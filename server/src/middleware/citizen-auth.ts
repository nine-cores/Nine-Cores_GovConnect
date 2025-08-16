import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '@/database';
import { Citizen } from '@/database/entities/citizen.entity';
import { CitizenSession, SessionStatus } from '@/database/entities/citizen-session.entity';
import { Unauthorized } from '@/core/errors';
import log from '@/core/logger';

interface CitizenJwtPayload {
    nic: string;
    email: string;
    type: string;
    verificationStatus: string;
}

// Extend Request interface to include citizen and session
declare global {
    namespace Express {
        interface Request {
            citizen?: Citizen;
            citizenPayload?: CitizenJwtPayload;
            session?: CitizenSession;
        }
    }
}

export const authenticateCitizen = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Unauthorized('Access token is required');
        }

        const token = authHeader.substring(7);

        // Verify JWT token
        const payload = jwt.verify(
            token,
            process.env.ACCESS_JWT_SECRET!,
            {
                issuer: 'gov-portal',
                audience: 'citizen'
            }
        ) as CitizenJwtPayload;

        // Validate payload structure
        if (!payload.nic || !payload.email || payload.type !== 'citizen') {
            throw new Unauthorized('Invalid token format');
        }

        // Get citizen from database
        const citizenRepository = AppDataSource.getRepository(Citizen);
        const citizen = await citizenRepository.findOne({
            where: { nic: payload.nic },
            relations: ['division']
        });

        if (!citizen) {
            throw new Unauthorized('Citizen not found');
        }

        // Check if citizen account is active
        if (citizen.accountStatus !== 'Active') {
            throw new Unauthorized('Citizen account is not active');
        }

        // Attach citizen to request object
        req.citizen = citizen;
        req.citizenPayload = payload;

        log.debug(`Citizen authenticated: ${citizen.nic}`);
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new Unauthorized('Invalid access token'));
        } else {
            next(error);
        }
    }
};

// Middleware to check if citizen is verified
export const requireVerifiedCitizen = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.citizen) {
        return next(new Unauthorized('Citizen authentication required'));
    }

    if (req.citizen.verificationStatus !== 'Verified') {
        return next(new Unauthorized('Citizen account must be verified to access this resource'));
    }

    next();
};

// Middleware to validate refresh token and get session
export const validateRefreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new Unauthorized('Refresh token is required');
        }

        // Verify refresh token structure
        jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET!);

        // Check if session exists and is active
        const sessionRepository = AppDataSource.getRepository(CitizenSession);
        const session = await sessionRepository.findOne({
            where: { refreshToken, status: SessionStatus.ACTIVE },
            relations: ['citizen']
        });

        if (!session || !session.isActive()) {
            throw new Unauthorized('Invalid or expired refresh token');
        }

        // Attach session to request
        req.session = session;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new Unauthorized('Invalid refresh token'));
        } else {
            next(error);
        }
    }
};
