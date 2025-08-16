/// <reference types="../../types/express" />
import { Request, Response, NextFunction } from 'express';
import { CitizenManagementService, CreateCitizenInput } from '@/services/citizen-management.service';
import { DivisionService } from '@/modules/division/service';
import { CitizenVerificationStatus } from '@/database/entities/citizen.entity';
import { dataResponse, messageResponse } from '@/core/responses';
import validate from '@/middleware/validator';
import { 
    createCitizenSchema, 
    updateCitizenSchema, 
    verifyCitizenSchema,
    getCitizenSchema,
    searchCitizensSchema,
    previewCitizenSchema
} from './schema';

const citizenService = new CitizenManagementService();
const divisionService = new DivisionService();

export const bulkLoadCitizens = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await citizenService.bulkLoadCitizensFromJson();
        
        return dataResponse(res, {
            summary: {
                totalProcessed: result.loaded + result.skipped + result.errors.length,
                loaded: result.loaded,
                skipped: result.skipped,
                errors: result.errors.length
            },
            details: {
                errors: result.errors
            }
        }, 'Bulk citizen load completed', 200);
    } catch (error) {
        next(error);
    }
};

export const addCitizen = [
    validate(createCitizenSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const citizenData: CreateCitizenInput = req.body;
            const citizen = await citizenService.addCitizen(citizenData);
            
            return dataResponse(res, citizen, 'Citizen added successfully', 201);
        } catch (error) {
            next(error);
        }
    }
];

export const getCitizenByNIC = [
    validate(getCitizenSchema, 'params'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { nic } = req.params;
            const citizen = await citizenService.getCitizenByNIC(nic);
            
            return dataResponse(res, citizen, 'Citizen retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
];

export const updateCitizen = [
    validate(getCitizenSchema, 'params'),
    validate(updateCitizenSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { nic } = req.params;
            const updates = req.body;
            const citizen = await citizenService.updateCitizen(nic, updates);
            
            return dataResponse(res, citizen, 'Citizen updated successfully');
        } catch (error) {
            next(error);
        }
    }
];

export const verifyCitizen = [
    validate(getCitizenSchema, 'params'),
    validate(verifyCitizenSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { nic } = req.params;
            const { verificationStatus } = req.body;
            const citizen = await citizenService.verifyCitizen(nic, verificationStatus);
            
            return dataResponse(res, citizen, 'Citizen verification status updated successfully');
        } catch (error) {
            next(error);
        }
    }
];

export const getCitizensByDivision = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get division from authenticated GN user
            const user = req.user;
            if (!user?.userId) {
                return dataResponse(res, { 
                    citizens: [], 
                    total: 0, 
                    page: 1, 
                    totalPages: 0 
                }, 'User not authenticated');
            }

            // Find division assigned to this GN
            const division = await divisionService.getDivisionByGNUserId(user.userId);
            if (!division) {
                return dataResponse(res, { 
                    citizens: [], 
                    total: 0, 
                    page: 1, 
                    totalPages: 0 
                }, 'No division assigned to this GN user');
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            
            const result = await citizenService.getCitizensByDivision(division.divisionId, page, limit);
            
            return dataResponse(res, result, 'Citizens retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
];

export const searchCitizens = [
    validate(searchCitizensSchema, 'query'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { query } = req.query;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            
            const result = await citizenService.searchCitizens(query as string, page, limit);
            
            return dataResponse(res, result, 'Citizens search completed');
        } catch (error) {
            next(error);
        }
    }
];

export const previewCitizenData = [
    validate(previewCitizenSchema, 'params'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { nic } = req.params;
            const preview = await citizenService.previewCitizenData(nic);
            
            return dataResponse(res, preview, 'Citizen data preview retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
];

export const getAllCitizens = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            
            // For admin users, get all citizens across all divisions
            const result = await citizenService.searchCitizens('', page, limit);
            
            return dataResponse(res, result, 'All citizens retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
];
