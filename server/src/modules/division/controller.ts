import { Request, Response, NextFunction } from 'express';
import { DivisionService } from './service';
import { dataResponse, messageResponse } from '@/core/responses';
import {
    createDivisionSchema,
    updateDivisionSchema,
    assignGNSchema,
    divisionIdSchema,
    gnUserIdSchema
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

export class DivisionController {
    private divisionService = new DivisionService();

    // Create new division
    createDivision = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = await validate(createDivisionSchema, req.body);
            const division = await this.divisionService.createDivision(validatedData);

            log.info(`Division created: ${division.divisionId} by user: ${req.user?.userId}`);
            return dataResponse(res, division, 'Division created successfully', 201);
        } catch (error) {
            next(error);
        }
    };

    // Get all divisions
    getAllDivisions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const divisions = await this.divisionService.getAllDivisions();
            return dataResponse(res, divisions, 'Divisions retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    // Get division by ID
    getDivisionById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { divisionId } = await validate(divisionIdSchema, req.params);
            const division = await this.divisionService.getDivisionById(divisionId);
            return dataResponse(res, division, 'Division retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    // Update division
    updateDivision = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { divisionId } = await validate(divisionIdSchema, req.params);
            const updateData = await validate(updateDivisionSchema, req.body);
            
            const division = await this.divisionService.updateDivision(divisionId, updateData);

            log.info(`Division updated: ${divisionId} by user: ${req.user?.userId}`);
            return dataResponse(res, division, 'Division updated successfully');
        } catch (error) {
            next(error);
        }
    };

    // Delete division
    deleteDivision = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { divisionId } = await validate(divisionIdSchema, req.params);
            await this.divisionService.deleteDivision(divisionId);

            log.info(`Division deleted: ${divisionId} by user: ${req.user?.userId}`);
            return messageResponse(res, 'Division deleted successfully');
        } catch (error) {
            next(error);
        }
    };

    // Assign GN to division
    assignGNToDivision = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const assignData = await validate(assignGNSchema, req.body);
            const division = await this.divisionService.assignGNToDivision(assignData);

            log.info(`GN ${assignData.gnUserId} assigned to division ${assignData.divisionId} by user: ${req.user?.userId}`);
            return dataResponse(res, division, 'GN assigned to division successfully');
        } catch (error) {
            next(error);
        }
    };

    // Remove GN from division
    removeGNFromDivision = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { divisionId } = await validate(divisionIdSchema, req.params);
            const division = await this.divisionService.removeGNFromDivision(divisionId);

            log.info(`GN removed from division ${divisionId} by user: ${req.user?.userId}`);
            return dataResponse(res, division, 'GN removed from division successfully');
        } catch (error) {
            next(error);
        }
    };

    // Get division by GN user ID
    getDivisionByGNUserId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { gnUserId } = await validate(gnUserIdSchema, req.params);
            const division = await this.divisionService.getDivisionByGNUserId(gnUserId);

            if (!division) {
                return dataResponse(res, null, 'No division assigned to this GN user');
            }

            return dataResponse(res, division, 'Division retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    // Get divisions without assigned GN
    getDivisionsWithoutGN = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const divisions = await this.divisionService.getDivisionsWithoutGN();
            return dataResponse(res, divisions, 'Divisions without GN retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    // Get available GN users (not assigned to any division)
    getAvailableGNUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gnUsers = await this.divisionService.getAvailableGNUsers();
            return dataResponse(res, gnUsers, 'Available GN users retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    // Get division statistics
    getDivisionStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const allDivisions = await this.divisionService.getAllDivisions();
            const divisionsWithoutGN = await this.divisionService.getDivisionsWithoutGN();
            const availableGNUsers = await this.divisionService.getAvailableGNUsers();

            const stats = {
                totalDivisions: allDivisions.length,
                divisionsWithGN: allDivisions.length - divisionsWithoutGN.length,
                divisionsWithoutGN: divisionsWithoutGN.length,
                availableGNUsers: availableGNUsers.length,
                assignmentCoverage: allDivisions.length > 0 
                    ? Math.round(((allDivisions.length - divisionsWithoutGN.length) / allDivisions.length) * 100)
                    : 0
            };

            return dataResponse(res, stats, 'Division statistics retrieved successfully');
        } catch (error) {
            next(error);
        }
    };
}
