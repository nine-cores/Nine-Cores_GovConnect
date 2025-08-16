import { Request, Response, NextFunction } from 'express';
import { CitizenAppointmentService } from './service';
import { dataResponse, messageResponse } from '@/core/responses';
import {
    createAppointmentSchema,
    getAvailableSlotsSchema,
    citizenNicSchema,
    appointmentIdSchema,
    gnAppointmentsQuerySchema
} from './schema';
import log from '@/core/logger';
import Joi from 'joi';
import { BadRequest } from '@/core/errors';

// Simple validation helper
const validate = async (schema: Joi.ObjectSchema, data: any) => {
    const { error, value } = schema.validate(data);
    if (error) {
        throw new BadRequest(error.details[0].message.replace(/"/g, ''));
    }
    return value;
};

export class CitizenAppointmentController {
    private citizenAppointmentService = new CitizenAppointmentService();

    // Get available time slots for citizen's division GN (authenticated)
    getAvailableTimeSlots = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.citizen) {
                throw new BadRequest('Citizen authentication required');
            }
            
            const { dateFrom, dateTo } = req.query;

            const availableSlots = await this.citizenAppointmentService.getAvailableTimeSlots(
                req.citizen.nic,
                dateFrom as string,
                dateTo as string
            );

            return dataResponse(res, availableSlots, 'Available time slots retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    // Create appointment and book time slot in one operation
    createAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const appointmentData = await validate(createAppointmentSchema, req.body);
            
            // Extract citizen NIC from authenticated citizen
            if (!req.citizen) {
                throw new BadRequest('Citizen authentication required');
            }
            
            const appointment = await this.citizenAppointmentService.createAppointment(
                req.citizen.nic,
                appointmentData
            );

            log.info(`Appointment created and time slot booked: ${appointment.gnAppointmentId} for citizen: ${req.citizen.nic}`);
            return dataResponse(res, appointment, 'Appointment created and time slot booked successfully', 201);
        } catch (error) {
            next(error);
        }
    };

    // Get citizen's appointments
    getCitizenAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.citizen) {
                throw new BadRequest('Citizen authentication required');
            }
            
            const appointments = await this.citizenAppointmentService.getCitizenAppointments(req.citizen.nic);

            return dataResponse(res, appointments, 'Citizen appointments retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    // Cancel appointment
    cancelAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.citizen) {
                throw new BadRequest('Citizen authentication required');
            }
            
            const { appointmentId } = await validate(appointmentIdSchema, req.params);

            const appointment = await this.citizenAppointmentService.cancelAppointment(req.citizen.nic, appointmentId);

            log.info(`Appointment cancelled: ${appointmentId} by citizen: ${req.citizen.nic}`);
            return dataResponse(res, appointment, 'Appointment cancelled successfully');
        } catch (error) {
            next(error);
        }
    };

    // Get available GN services
    getAvailableGNServices = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const services = await this.citizenAppointmentService.getAvailableGNServices();
            return dataResponse(res, services, 'Available GN services retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    // Get available slots with query parameters (authenticated)
    getAvailableSlotsWithQuery = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.citizen) {
                throw new BadRequest('Citizen authentication required');
            }
            
            const { dateFrom, dateTo } = req.query;

            const availableSlots = await this.citizenAppointmentService.getAvailableTimeSlots(
                req.citizen.nic,
                dateFrom as string,
                dateTo as string
            );

            return dataResponse(res, availableSlots, 'Available time slots retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    // Get GN officer's appointments with query options
    getGNAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new BadRequest('User authentication required');
            }

            // Validate query parameters
            const queryOptions = await validate(gnAppointmentsQuerySchema, req.query);

            const result = await this.citizenAppointmentService.getGNAppointments(
                req.user.userId,
                queryOptions
            );

            log.info(`GN appointments retrieved for user: ${req.user.userId}, total: ${result.total}`);
            return dataResponse(res, result, 'GN appointments retrieved successfully');
        } catch (error) {
            next(error);
        }
    };
}
