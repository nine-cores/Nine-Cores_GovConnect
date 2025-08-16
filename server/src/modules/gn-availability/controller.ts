/// <reference types="../../types/express" />
import { Request, Response, NextFunction } from 'express';
import { GNAvailabilityService, CreateAvailabilityInput, UpdateAvailabilityInput } from './service';
import { DataResponse, MessageResponse } from '@/core/responses';
import { BadRequest } from '@/core/errors';
import validate from '@/middleware/validator';
import {
    createAvailabilitySchema,
    updateAvailabilitySchema,
    getAvailabilitySchema,
    getAvailableSlotsSchema,
    deleteAvailabilitySchema,
    bulkUpdateAvailabilitySchema
} from './schema';
import log from '@/core/logger';

export class GNAvailabilityController {
    private gnAvailabilityService: GNAvailabilityService;

    constructor() {
        this.gnAvailabilityService = new GNAvailabilityService();
    }

    // Create availability slots
    createAvailability = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user) {
                throw new BadRequest('User not authenticated');
            }

            const availabilityData: CreateAvailabilityInput = req.body;
            const availabilitySlots = await this.gnAvailabilityService.createAvailability(
                user.userId,
                availabilityData
            );

            log.info(
                `GN ${user.userId} created ${availabilitySlots.length} availability slots for ${availabilityData.availableDate}`
            );

            new DataResponse(res, {
                data: availabilitySlots,
                message: `Successfully created ${availabilitySlots.length} availability slots`
            });
        } catch (error) {
            next(error);
        }
    };

    // Distinct GN availability dates (no pagination/queries)
    getAllGNAvailabileDates = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user) throw new BadRequest('User not authenticated');
            const slots = await this.gnAvailabilityService.getGNAvailability(
                user.userId,
                {} as any
            );

            type Availability = {
                availableDate: string | Date;
                [k: string]: any;
            };
            const toYMD = (d: string | Date): string | null => {
                if (!d) return null;
                if (d instanceof Date) return d.toISOString().slice(0, 10);
                if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
                const dt = new Date(d);
                return isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
            };

            const uniq = new Set<string>();
            for (const s of slots as Availability[]) {
                const ymd = toYMD(s.availableDate);
                if (ymd) uniq.add(ymd);
            }

            const dates = Array.from(uniq).sort();
            const formattedDates = dates.map((d) => {
                const [y, m, day] = d.split('-').map(Number);
                return new Date(y, m - 1, day).getTime();
            });

            new DataResponse(res, {
                data: formattedDates,
                message: 'Distinct availability dates retrieved successfully'
            });
        } catch (err) {
            next(err);
        }
    };

    // Get GN's own availability
    getMyAvailability = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user) {
                throw new BadRequest('User not authenticated');
            }

            const filter = {
                gnServiceId: req.query.gnServiceId as string,
                dateFrom: req.query.dateFrom as string,
                dateTo: req.query.dateTo as string,
                status: req.query.status as any
            };

            const availabilities = await this.gnAvailabilityService.getGNAvailability(
                user.userId,
                filter
            );

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;

            const paginatedData = availabilities.slice(startIndex, endIndex);
            const totalPages = Math.ceil(availabilities.length / limit);

            new DataResponse(res, {
                data: paginatedData,
                meta: {
                    page,
                    limit,
                    total: availabilities.length,
                    totalPages
                },
                message: 'Availability retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Update availability slot
    updateAvailability = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user) {
                throw new BadRequest('User not authenticated');
            }

            const availabilityId = parseInt(req.params.id);
            if (isNaN(availabilityId)) {
                throw new BadRequest('Invalid availability ID');
            }

            const updateData: UpdateAvailabilityInput = req.body;
            const updatedAvailability = await this.gnAvailabilityService.updateAvailability(
                user.userId,
                availabilityId,
                updateData
            );

            log.info(`GN ${user.userId} updated availability slot ${availabilityId}`);
            new DataResponse(res, {
                data: updatedAvailability,
                message: 'Availability updated successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Delete availability slot
    deleteAvailability = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user) {
                throw new BadRequest('User not authenticated');
            }

            const availabilityId = parseInt(req.params.id);
            if (isNaN(availabilityId)) {
                throw new BadRequest('Invalid availability ID');
            }

            await this.gnAvailabilityService.deleteAvailability(user.userId, availabilityId);

            log.info(`GN ${user.userId} deleted availability slot ${availabilityId}`);

            new MessageResponse(res, {
                message: 'Availability deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Get available slots for public booking (for citizens)
    getAvailableSlots = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.query.userId as string; // Optional - filter by specific GN officer
            const dateFrom = req.query.dateFrom as string;
            const dateTo = req.query.dateTo as string;

            const availableSlots = await this.gnAvailabilityService.getAvailableSlots(
                userId,
                dateFrom,
                dateTo
            );

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;

            const paginatedData = availableSlots.slice(startIndex, endIndex);
            const totalPages = Math.ceil(availableSlots.length / limit);

            new DataResponse(res, {
                data: paginatedData,
                meta: {
                    page,
                    limit,
                    total: availableSlots.length,
                    totalPages
                },
                message: 'Available slots retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Bulk update availability status
    bulkUpdateAvailability = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user) {
                throw new BadRequest('User not authenticated');
            }

            const { availabilityIds, status } = req.body;
            const updatedSlots = [];

            // Update each slot
            for (const availabilityId of availabilityIds) {
                try {
                    const updatedSlot = await this.gnAvailabilityService.updateAvailability(
                        user.userId,
                        availabilityId,
                        { status }
                    );
                    updatedSlots.push(updatedSlot);
                } catch (error) {
                    log.warn(
                        `Failed to update availability slot ${availabilityId}: ${error.message}`
                    );
                    // Continue with other slots
                }
            }

            log.info(
                `GN ${user.userId} bulk updated ${updatedSlots.length} availability slots to ${status}`
            );

            new DataResponse(res, {
                data: updatedSlots,
                meta: {
                    requested: availabilityIds.length,
                    updated: updatedSlots.length,
                    failed: availabilityIds.length - updatedSlots.length
                },
                message: `Bulk update completed. ${updatedSlots.length} slots updated successfully`
            });
        } catch (error) {
            next(error);
        }
    };

    // Get availability statistics
    getAvailabilityStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user) {
                throw new BadRequest('User not authenticated');
            }

            // Get availability for the next 30 days
            const dateFrom = new Date().toISOString().split('T')[0];
            const dateTo = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0];

            const allAvailability = await this.gnAvailabilityService.getGNAvailability(
                user.userId,
                { dateFrom, dateTo }
            );

            const stats = {
                total: allAvailability.length,
                available: allAvailability.filter((a) => a.status === 'Available').length,
                booked: allAvailability.filter((a) => a.status === 'Booked').length,
                cancelled: allAvailability.filter((a) => a.status === 'Cancelled').length,
                next30Days: allAvailability.length
            };

            new DataResponse(res, {
                data: stats,
                message: 'Availability statistics retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    deleteAvailabilityForDate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user) throw new BadRequest('User not authenticated');

            const { date, mode } = req.query as {
                date: string;
                mode: 'skipBooked' | 'failOnBooked';
            };

            const result = await this.gnAvailabilityService.deleteAvailabilityForDate(
                user.userId,
                date,
                mode
            );

            const { deleted, bookedCount } = result;

            new DataResponse(res, {
                data: { date, deleted, bookedCount },
                message:
                    mode === 'skipBooked'
                        ? `Removed ${deleted} slot(s) for ${date}${bookedCount ? ` (skipped ${bookedCount} booked)` : ''}`
                        : `Removed ${deleted} slot(s) for ${date}`
            });
        } catch (error) {
            next(error);
        }
    };
}
