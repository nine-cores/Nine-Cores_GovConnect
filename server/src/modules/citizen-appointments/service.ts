import { AppDataSource } from '@/database';
import { Citizen, CitizenVerificationStatus } from '@/database/entities/citizen.entity';
import { GNAppointment, AppointmentStatus } from '@/database/entities/gn-appointment.entity';
import { GNAvailability, AvailabilityStatus } from '@/database/entities/gn-availability.entity';
import { GNService } from '@/database/entities/gn-service.entity';
import { Division } from '@/database/entities/division.entity';
import { User, UserRole } from '@/database/entities/user.entity';
import { BadRequest, NotFound, Forbidden } from '@/core/errors';
import { MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { emailService } from '@/core/email';
import log from '@/core/logger';

export interface CreateAppointmentInput {
    gnServiceId: string;
    availabilityId: number; // Required - the specific time slot to book
    purpose: string;
}

export class CitizenAppointmentService {
    private citizenRepository = AppDataSource.getRepository(Citizen);
    private gnAppointmentRepository = AppDataSource.getRepository(GNAppointment);
    private gnAvailabilityRepository = AppDataSource.getRepository(GNAvailability);
    private gnServiceRepository = AppDataSource.getRepository(GNService);
    private divisionRepository = AppDataSource.getRepository(Division);
    private userRepository = AppDataSource.getRepository(User);

    /**
     * Get available time slots for citizen's division GN
     */
    async getAvailableTimeSlots(
        citizenNic: string,
        dateFrom?: string,
        dateTo?: string
    ): Promise<GNAvailability[]> {
        // Validate citizen exists and is verified
        const citizen = await this.citizenRepository.findOne({
            where: { nic: citizenNic },
            relations: ['division']
        });

        if (!citizen) {
            throw new NotFound('Citizen not found');
        }

        if (citizen.verificationStatus !== CitizenVerificationStatus.VERIFIED) {
            throw new Forbidden('Citizen must be verified to view available slots');
        }

        if (!citizen.divisionId) {
            throw new BadRequest('Citizen must be assigned to a division');
        }

        // Get the division and its assigned GN
        const division = await this.divisionRepository.findOne({
            where: { divisionId: citizen.divisionId },
            relations: ['gramaNiladhari']
        });

        if (!division || !division.gnUserId) {
            throw new NotFound('No GN assigned to your division');
        }

        // Build query conditions
        const whereCondition: any = {
            userId: division.gnUserId,
            status: AvailabilityStatus.AVAILABLE
        };

        // Only show future dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFrom && dateTo) {
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);
            
            // Ensure dates are not in the past
            const actualFromDate = fromDate > today ? fromDate : today;
            
            whereCondition.availableDate = MoreThanOrEqual(actualFromDate);
            
            // Add date range filter manually in the query
            const availableSlots = await this.gnAvailabilityRepository
                .createQueryBuilder('availability')
                .where('availability.user_id = :userId', { userId: division.gnUserId })
                .andWhere('availability.status = :status', { status: AvailabilityStatus.AVAILABLE })
                .andWhere('availability.available_date >= :fromDate', { fromDate: actualFromDate })
                .andWhere('availability.available_date <= :toDate', { toDate })
                .leftJoinAndSelect('availability.user', 'user')
                .orderBy('availability.available_date', 'ASC')
                .addOrderBy('availability.start_time', 'ASC')
                .getMany();

            return availableSlots;
        } else {
            whereCondition.availableDate = MoreThanOrEqual(today);
            
            return await this.gnAvailabilityRepository.find({
                where: whereCondition,
                relations: ['user'],
                order: { availableDate: 'ASC', startTime: 'ASC' }
            });
        }
    }

    /**
     * Create appointment and book time slot in a single operation
     */
    async createAppointment(
        citizenNic: string,
        appointmentData: CreateAppointmentInput
    ): Promise<GNAppointment> {
        const { gnServiceId, availabilityId, purpose } = appointmentData;

        // Validate citizen exists and is verified
        const citizen = await this.citizenRepository.findOne({
            where: { nic: citizenNic },
            relations: ['division']
        });

        if (!citizen) {
            throw new NotFound('Citizen not found');
        }

        if (citizen.verificationStatus !== CitizenVerificationStatus.VERIFIED) {
            throw new Forbidden('Citizen must be verified to create appointments');
        }

        if (!citizen.divisionId) {
            throw new BadRequest('Citizen must be assigned to a division');
        }

        // Validate GN service exists
        const gnService = await this.gnServiceRepository.findOne({
            where: { gnServiceId, isEnabled: true }
        });

        if (!gnService) {
            throw new NotFound('GN service not found or disabled');
        }

        // Get the specific availability slot
        const availability = await this.gnAvailabilityRepository.findOne({
            where: { 
                gnAvailabilityId: availabilityId,
                status: AvailabilityStatus.AVAILABLE
            },
            relations: ['user']
        });

        if (!availability) {
            throw new NotFound('Time slot not available or does not exist');
        }

        // Check if the GN belongs to citizen's division
        const gnDivision = await this.divisionRepository.findOne({
            where: { gnUserId: availability.userId }
        });

        if (!gnDivision || gnDivision.divisionId !== citizen.divisionId) {
            throw new BadRequest('Selected time slot is not from your division GN officer');
        }

        // Check if appointment date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (availability.availableDate < today) {
            throw new BadRequest('Cannot book appointments for past dates');
        }

        // Create appointment with the availability details
        const appointment = this.gnAppointmentRepository.create({
            citizenNic,
            userId: availability.userId, // GN officer from the availability
            gnServiceId,
            appointmentDate: availability.availableDate,
            startTime: availability.startTime,
            endTime: availability.endTime,
            purpose,
            status: AppointmentStatus.CONFIRMED
        });

        const savedAppointment = await this.gnAppointmentRepository.save(appointment);

        // Mark the availability slot as booked and link to appointment
        availability.status = AvailabilityStatus.BOOKED;
        availability.gnAppointmentId = savedAppointment.gnAppointmentId;
        await this.gnAvailabilityRepository.save(availability);

        log.info(`Appointment created and time slot booked: ${savedAppointment.gnAppointmentId} for citizen: ${citizenNic}`);

        // Return appointment with relations
        const appointmentWithRelations = await this.gnAppointmentRepository.findOne({
            where: { gnAppointmentId: savedAppointment.gnAppointmentId },
            relations: ['citizen', 'gnService', 'user']
        }) as GNAppointment;

        // Send confirmation email if citizen has email
        if (citizen.email) {
            try {
                const emailSent = await emailService.sendAppointmentConfirmation(appointmentWithRelations, citizen.email);
                if (emailSent) {
                    log.info(`Appointment confirmation email sent to: ${citizen.email}`);
                } else {
                    log.warn(`Failed to send appointment confirmation email to: ${citizen.email}`);
                }
            } catch (error) {
                log.error(`Error sending appointment confirmation email: ${error}`);
                // Don't throw error - appointment is already created successfully
            }
        } else {
            log.info(`No email address for citizen ${citizenNic}, skipping confirmation email`);
        }

        return appointmentWithRelations;
    }

    /**
     * Get citizen's appointments
     */
    async getCitizenAppointments(citizenNic: string): Promise<GNAppointment[]> {
        const citizen = await this.citizenRepository.findOne({
            where: { nic: citizenNic }
        });

        if (!citizen) {
            throw new NotFound('Citizen not found');
        }

        return await this.gnAppointmentRepository.find({
            where: { citizenNic },
            relations: ['gnService', 'user'],
            order: { appointmentDate: 'DESC', startTime: 'DESC' }
        });
    }

    /**
     * Cancel appointment and free up time slot
     */
    async cancelAppointment(citizenNic: string, gnAppointmentId: number): Promise<GNAppointment> {
        // Validate appointment belongs to citizen
        const appointment = await this.gnAppointmentRepository.findOne({
            where: { gnAppointmentId, citizenNic }
        });

        if (!appointment) {
            throw new NotFound('Appointment not found');
        }

        if (appointment.status === AppointmentStatus.CANCELLED) {
            throw new BadRequest('Appointment is already cancelled');
        }

        if (appointment.status === AppointmentStatus.COMPLETED) {
            throw new BadRequest('Cannot cancel completed appointment');
        }

        // Free up the time slot if it was booked
        if (appointment.status === AppointmentStatus.CONFIRMED) {
            const availability = await this.gnAvailabilityRepository.findOne({
                where: { gnAppointmentId }
            });

            if (availability) {
                availability.status = AvailabilityStatus.AVAILABLE;
                availability.gnAppointmentId = null;
                await this.gnAvailabilityRepository.save(availability);
            }
        }

        // Cancel the appointment
        appointment.status = AppointmentStatus.CANCELLED;
        return await this.gnAppointmentRepository.save(appointment);
    }

    /**
     * Get GN services available for appointments
     */
    async getAvailableGNServices(): Promise<GNService[]> {
        return await this.gnServiceRepository.find({
            where: { isEnabled: true },
            order: { serviceName: 'ASC' }
        });
    }

    /**
     * Get GN officer's appointments with query options
     */
    async getGNAppointments(
        userId: string,
        options: {
            dateFrom?: string;
            dateTo?: string;
            status?: AppointmentStatus;
            citizenNic?: string;
            limit?: number;
            offset?: number;
        } = {}
    ): Promise<{ appointments: GNAppointment[]; total: number }> {
        const { dateFrom, dateTo, status, citizenNic, limit = 50, offset = 0 } = options;

        // Build query conditions
        const whereCondition: any = {
            userId
        };

        // Add date range filter
        if (dateFrom && dateTo) {
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);
            whereCondition.appointmentDate = Between(fromDate, toDate);
        } else if (dateFrom) {
            const fromDate = new Date(dateFrom);
            whereCondition.appointmentDate = MoreThanOrEqual(fromDate);
        } else if (dateTo) {
            const toDate = new Date(dateTo);
            whereCondition.appointmentDate = LessThanOrEqual(toDate);
        }

        // Add status filter
        if (status) {
            whereCondition.status = status;
        }

        // Add citizen NIC filter
        if (citizenNic) {
            whereCondition.citizenNic = citizenNic;
        }

        // Get total count
        const total = await this.gnAppointmentRepository.count({
            where: whereCondition
        });

        // Get appointments with pagination
        const appointments = await this.gnAppointmentRepository.find({
            where: whereCondition,
            relations: ['citizen', 'gnService'],
            order: { 
                appointmentDate: 'DESC',
                startTime: 'ASC'
            },
            take: limit,
            skip: offset
        });

        return { appointments, total };
    }
}
