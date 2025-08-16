import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/database';
import { CitizenOTP, OTPStatus } from '@/database/entities/citizen-otp.entity';
import { DataResponse } from '@/core/responses';
import { NotFound } from '@/core/errors';

export class DebugController {
    // Get latest OTP for a citizen (for testing purposes)
    getLatestOTP = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.params;
            
            if (!email) {
                throw new NotFound('Email parameter is required');
            }

            // Find citizen's latest OTP
            const otpRepository = AppDataSource.getRepository(CitizenOTP);
            const latestOTP = await otpRepository.findOne({
                where: {
                    citizen: { email },
                    status: OTPStatus.PENDING
                },
                order: { createdAt: 'DESC' },
                relations: ['citizen']
            });

            if (!latestOTP) {
                throw new NotFound('No pending OTP found for this email');
            }

            new DataResponse(res, {
                data: {
                    otpCode: latestOTP.otpCode,
                    type: latestOTP.type,
                    expiresAt: latestOTP.expiresAt,
                    isExpired: latestOTP.isExpired(),
                    citizenNic: latestOTP.citizenNic
                },
                message: 'Latest OTP retrieved for testing'
            });
        } catch (error) {
            next(error);
        }
    };

    // List all pending OTPs for debugging
    getAllPendingOTPs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const otpRepository = AppDataSource.getRepository(CitizenOTP);
            const pendingOTPs = await otpRepository.find({
                where: { status: OTPStatus.PENDING },
                order: { createdAt: 'DESC' },
                take: 10,
                relations: ['citizen']
            });

            new DataResponse(res, {
                data: pendingOTPs.map(otp => ({
                    otpCode: otp.otpCode,
                    type: otp.type,
                    citizenEmail: otp.citizen?.email,
                    citizenNic: otp.citizenNic,
                    expiresAt: otp.expiresAt,
                    isExpired: otp.isExpired(),
                    createdAt: otp.createdAt
                })),
                message: 'All pending OTPs for debugging'
            });
        } catch (error) {
            next(error);
        }
    };
}
