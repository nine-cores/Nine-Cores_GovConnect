import { AppDataSource } from '@/database';
import { GNAvailability, AvailabilityStatus } from '@/database/entities/gn-availability.entity';
import { User, UserRole } from '@/database/entities/user.entity';
import { BadRequest, NotFound, Forbidden, Conflict } from '@/core/errors';
import { Between, MoreThanOrEqual, LessThanOrEqual, IsNull, Not } from 'typeorm';

export interface CreateAvailabilityInput {
    availableDate: string; // YYYY-MM-DD format
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    slotDuration?: number; // Duration in minutes (default: 30)
}

export interface UpdateAvailabilityInput {
    availableDate?: string;
    startTime?: string;
    endTime?: string;
    status?: AvailabilityStatus;
}

export interface AvailabilityFilter {
    dateFrom?: string;
    dateTo?: string;
    status?: AvailabilityStatus;
}

export class GNAvailabilityService {
    private gnAvailabilityRepository = AppDataSource.getRepository(GNAvailability);
    private userRepository = AppDataSource.getRepository(User);

    /**
     * Create availability slots for a GN officer
     */
    async createAvailability(
        userId: string,
        availabilityData: CreateAvailabilityInput
    ): Promise<GNAvailability[]> {
        // Validate GN user exists and has correct role
        const gnUser = await this.userRepository.findOne({
            where: { userId, role: UserRole.GN }
        });

        if (!gnUser) {
            throw new NotFound('GN user not found');
        }

        // Validate date is not in the past
        const availableDate = new Date(availabilityData.availableDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (availableDate < today) {
            throw new BadRequest('Cannot set availability for past dates');
        }

        // Validate time format and logic
        const startTime = availabilityData.startTime;
        const endTime = availabilityData.endTime;

        if (!this.isValidTimeFormat(startTime) || !this.isValidTimeFormat(endTime)) {
            throw new BadRequest('Invalid time format. Use HH:MM format');
        }

        if (startTime >= endTime) {
            throw new BadRequest('Start time must be before end time');
        }

        // Check for existing availability conflicts
        await this.checkForConflicts(userId, availableDate, startTime, endTime);

        // Create time slots based on duration
        const slotDuration = availabilityData.slotDuration || 30; // Default 30 minutes
        const slots = this.generateTimeSlots(startTime, endTime, slotDuration);

        // Create availability records
        const availabilitySlots: GNAvailability[] = [];

        for (const slot of slots) {
            const availability = this.gnAvailabilityRepository.create({
                userId,
                availableDate,
                startTime: slot.start,
                endTime: slot.end,
                status: AvailabilityStatus.AVAILABLE
            });

            availabilitySlots.push(availability);
        }

        // Save all slots
        const savedSlots = await this.gnAvailabilityRepository.save(availabilitySlots);

        return savedSlots;
    }

    /**
     * Get availability for a specific GN officer
     */
    async getGNAvailability(
        userId: string,
        filter: AvailabilityFilter = {}
    ): Promise<GNAvailability[]> {
        // Validate GN user exists
        const gnUser = await this.userRepository.findOne({
            where: { userId, role: UserRole.GN }
        });

        if (!gnUser) {
            throw new NotFound('GN user not found');
        }

        const whereCondition: any = { userId };

        // Apply filters
        if (filter.status) {
            whereCondition.status = filter.status;
        }

        if (filter.dateFrom && filter.dateTo) {
            whereCondition.availableDate = Between(
                new Date(filter.dateFrom),
                new Date(filter.dateTo)
            );
        } else if (filter.dateFrom) {
            whereCondition.availableDate = MoreThanOrEqual(new Date(filter.dateFrom));
        } else if (filter.dateTo) {
            whereCondition.availableDate = LessThanOrEqual(new Date(filter.dateTo));
        }

        const availabilities = await this.gnAvailabilityRepository.find({
            where: whereCondition,
            relations: ['user'],
            order: { availableDate: 'ASC', startTime: 'ASC' }
        });

        return availabilities;
    }

    /**
     * Update availability slot
     */
    async updateAvailability(
        userId: string,
        availabilityId: number,
        updateData: UpdateAvailabilityInput
    ): Promise<GNAvailability> {
        // Find availability slot
        const availability = await this.gnAvailabilityRepository.findOne({
            where: { gnAvailabilityId: availabilityId, userId },
            relations: ['user']
        });

        if (!availability) {
            throw new NotFound('Availability slot not found');
        }

        // Don't allow updating booked slots
        if (
            availability.status === AvailabilityStatus.BOOKED &&
            updateData.status !== AvailabilityStatus.CANCELLED
        ) {
            throw new BadRequest('Cannot modify booked availability slots');
        }

        // Update fields
        if (updateData.availableDate) {
            const newDate = new Date(updateData.availableDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (newDate < today) {
                throw new BadRequest('Cannot set availability for past dates');
            }
            availability.availableDate = newDate;
        }

        if (updateData.startTime) {
            if (!this.isValidTimeFormat(updateData.startTime)) {
                throw new BadRequest('Invalid start time format. Use HH:MM format');
            }
            availability.startTime = updateData.startTime;
        }

        if (updateData.endTime) {
            if (!this.isValidTimeFormat(updateData.endTime)) {
                throw new BadRequest('Invalid end time format. Use HH:MM format');
            }
            availability.endTime = updateData.endTime;
        }

        if (updateData.status) {
            availability.status = updateData.status;
        }

        // Validate time logic after updates
        if (availability.startTime >= availability.endTime) {
            throw new BadRequest('Start time must be before end time');
        }

        const updatedAvailability = await this.gnAvailabilityRepository.save(availability);
        return updatedAvailability;
    }

    /**
     * Delete availability slot
     */
    async deleteAvailability(userId: string, availabilityId: number): Promise<void> {
        const availability = await this.gnAvailabilityRepository.findOne({
            where: { gnAvailabilityId: availabilityId, userId }
        });

        if (!availability) {
            throw new NotFound('Availability slot not found');
        }

        // Don't allow deleting booked slots
        if (availability.status === AvailabilityStatus.BOOKED) {
            throw new BadRequest('Cannot delete booked availability slots');
        }

        await this.gnAvailabilityRepository.remove(availability);
    }

    /**
     * Get available slots for booking (public endpoint for citizens)
     */
    async getAvailableSlots(
        userId?: string,
        dateFrom?: string,
        dateTo?: string
    ): Promise<GNAvailability[]> {
        const whereCondition: any = {
            status: AvailabilityStatus.AVAILABLE
        };

        // Filter by specific GN officer if provided
        if (userId) {
            whereCondition.userId = userId;
        }

        // Only show future dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFrom && dateTo) {
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);

            // Ensure dates are not in the past
            const actualFromDate = fromDate > today ? fromDate : today;

            whereCondition.availableDate = Between(actualFromDate, toDate);
        } else {
            whereCondition.availableDate = MoreThanOrEqual(today);
        }

        const availableSlots = await this.gnAvailabilityRepository.find({
            where: whereCondition,
            relations: ['user'],
            order: { availableDate: 'ASC', startTime: 'ASC' }
        });

        return availableSlots;
    }

    /**
     * Mark slot as booked (called when appointment is created)
     */
    async markSlotAsBooked(availabilityId: number): Promise<void> {
        const availability = await this.gnAvailabilityRepository.findOne({
            where: { gnAvailabilityId: availabilityId }
        });

        if (!availability) {
            throw new NotFound('Availability slot not found');
        }

        if (availability.status !== AvailabilityStatus.AVAILABLE) {
            throw new BadRequest('Slot is not available for booking');
        }

        availability.status = AvailabilityStatus.BOOKED;
        await this.gnAvailabilityRepository.save(availability);
    }

    /**
     * Mark slot as available (called when appointment is cancelled)
     */
    async markSlotAsAvailable(availabilityId: number): Promise<void> {
        const availability = await this.gnAvailabilityRepository.findOne({
            where: { gnAvailabilityId: availabilityId }
        });

        if (!availability) {
            throw new NotFound('Availability slot not found');
        }

        availability.status = AvailabilityStatus.AVAILABLE;
        await this.gnAvailabilityRepository.save(availability);
    }

    // Helper methods

    private isValidTimeFormat(time: string): boolean {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    private async checkForConflicts(
        userId: string,
        date: Date,
        startTime: string,
        endTime: string
    ): Promise<void> {
        const existingSlots = await this.gnAvailabilityRepository.find({
            where: {
                userId,
                availableDate: date,
                status: AvailabilityStatus.AVAILABLE
            }
        });

        for (const slot of existingSlots) {
            if (this.timesOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
                throw new BadRequest(
                    `Time conflict with existing availability from ${slot.startTime} to ${slot.endTime}`
                );
            }
        }
    }

    private timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
        return start1 < end2 && start2 < end1;
    }

    private generateTimeSlots(
        startTime: string,
        endTime: string,
        durationMinutes: number
    ): Array<{ start: string; end: string }> {
        const slots: Array<{ start: string; end: string }> = [];

        let currentTime = this.timeToMinutes(startTime);
        const endTimeMinutes = this.timeToMinutes(endTime);

        while (currentTime + durationMinutes <= endTimeMinutes) {
            const slotStart = this.minutesToTime(currentTime);
            const slotEnd = this.minutesToTime(currentTime + durationMinutes);

            slots.push({ start: slotStart, end: slotEnd });
            currentTime += durationMinutes;
        }

        return slots;
    }

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private minutesToTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    private parseYMD(ymd: string): Date {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
            throw new BadRequest('Invalid date format. Expected YYYY-MM-DD');
        }
        const [y, m, d] = ymd.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        if (isNaN(dt.getTime())) {
            throw new BadRequest('Invalid date value');
        }
        dt.setHours(0, 0, 0, 0);
        return dt;
    }

    async deleteAvailabilityForDate(
        userId: string,
        dateYmd: string,
        mode: 'skipBooked' | 'failOnBooked' = 'skipBooked'
    ): Promise<{ deleted: number; bookedCount: number }> {
        const date = this.parseYMD(dateYmd);

        const bookedCount = await this.gnAvailabilityRepository.count({
            where: { userId, availableDate: date, gnAppointmentId: Not(IsNull()) }
        });

        if (mode === 'failOnBooked' && bookedCount > 0) {
            throw new Conflict(`Cannot delete: ${bookedCount} slot(s) are booked on ${dateYmd}.`);
        }

        const deleteResult = await this.gnAvailabilityRepository.delete({
            userId,
            availableDate: date,
            status: AvailabilityStatus.AVAILABLE,
            gnAppointmentId: IsNull()
        });

        return { deleted: deleteResult.affected ?? 0, bookedCount };
    }
}
