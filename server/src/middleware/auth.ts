/// <reference types="../types/express" />
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/modules/auth/service';
import { Unauthorized } from '@/core/errors';

const authService = new AuthService();

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Unauthorized('Access token is required');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Verify the token
        const payload = authService.verifyAccessToken(token);
        
        // Get the user
        const user = await authService.getUserById(payload.userId);
        
        if (!user) {
            throw new Unauthorized('User not found');
        }

        // Attach user to request
        req.user = user;
        
        next();
    } catch (error) {
        next(error);
    }
};

export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new Unauthorized('Authentication required');
            }

            if (!roles.includes(req.user.role)) {
                throw new Unauthorized('Insufficient permissions');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
