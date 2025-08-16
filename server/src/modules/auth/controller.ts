/// <reference types="../../types/express" />
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './service';
import { registerSchema, loginSchema, refreshTokenSchema, logoutSchema } from './schema';
import validate from '@/middleware/validator';
import { dataResponse, messageResponse } from '@/core/responses';

const authService = new AuthService();

export const register = [
    validate(registerSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await authService.register(req.body);
            
            return dataResponse(res, {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            }, 'User registered successfully', 201);
        } catch (error) {
            next(error);
        }
    }
];

export const login = [
    validate(loginSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await authService.login(req.body);
            
            return dataResponse(res, {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            }, 'Login successful');
        } catch (error) {
            next(error);
        }
    }
];

export const refreshTokens = [
    validate(refreshTokenSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body;
            const result = await authService.refreshTokens(refreshToken);
            
            return dataResponse(res, {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            }, 'Tokens refreshed successfully');
        } catch (error) {
            next(error);
        }
    }
];

export const logout = [
    validate(logoutSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body;
            await authService.logout(refreshToken);
            
            return messageResponse(res, 'Logout successful');
        } catch (error) {
            next(error);
        }
    }
];

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user; // This will be set by the auth middleware
        
        return dataResponse(res, { user }, 'User profile retrieved successfully');
    } catch (error) {
        next(error);
    }
};
