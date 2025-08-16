import { Request, Response, NextFunction } from 'express';
import { CitizenAuthService } from './service';
import { OTPType } from '@/database/entities/citizen-otp.entity';
import { DataResponse, MessageResponse } from '@/core/responses';
import { BadRequest } from '@/core/errors';
import log from '@/core/logger';

export class CitizenAuthController {
    private citizenAuthService: CitizenAuthService;

    constructor() {
        this.citizenAuthService = new CitizenAuthService();
    }

    // Login with password
    loginWithPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('User-Agent');

            const result = await this.citizenAuthService.loginWithPassword({
                email,
                password,
                loginMethod: 'password',
                ipAddress,
                userAgent
            });

            log.info(`Citizen password login successful: ${email}`);
            new DataResponse(res, { data: result, message: 'Login successful' });
        } catch (error) {
            next(error);
        }
    };

    // Login with OTP
    loginWithOTP = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, otpCode } = req.body;
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('User-Agent');

            const result = await this.citizenAuthService.loginWithOTP({
                email,
                otpCode,
                loginMethod: 'otp',
                ipAddress,
                userAgent
            });

            log.info(`Citizen OTP login successful: ${email}`);
            new DataResponse(res, { data: result, message: 'Login successful' });
        } catch (error) {
            next(error);
        }
    };

    // Request OTP for login
    requestLoginOTP = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('User-Agent');

            const result = await this.citizenAuthService.generateOTP({
                email,
                type: OTPType.LOGIN,
                ipAddress,
                userAgent
            });

            log.info(`Login OTP requested for: ${email}`);
            new DataResponse(res, { data: result, message: 'OTP sent successfully' });
        } catch (error) {
            next(error);
        }
    };

    // Request OTP for password reset
    requestPasswordResetOTP = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('User-Agent');

            const result = await this.citizenAuthService.generateOTP({
                email,
                type: OTPType.PASSWORD_RESET,
                ipAddress,
                userAgent
            });

            log.info(`Password reset OTP requested for: ${email}`);
            new DataResponse(res, { data: result, message: 'Password reset OTP sent successfully' });
        } catch (error) {
            next(error);
        }
    };

    // Set password
    setPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { citizenNic, password, otpCode } = req.body;

            const result = await this.citizenAuthService.setPassword(
                citizenNic,
                password,
                otpCode
            );

            log.info(`Password set for citizen: ${citizenNic}`);
            new MessageResponse(res, { message: result.message });
        } catch (error) {
            next(error);
        }
    };

    // Refresh access token
    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body;

            const result = await this.citizenAuthService.refreshToken(refreshToken);

            new DataResponse(res, { data: result, message: 'Token refreshed successfully' });
        } catch (error) {
            next(error);
        }
    };

    // Logout
    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body;

            const result = await this.citizenAuthService.logout(refreshToken);

            log.info('Citizen logged out successfully');
            new MessageResponse(res, { message: result.message });
        } catch (error) {
            next(error);
        }
    };

    // Verify OTP (standalone endpoint)
    verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { citizenNic, otpCode, type } = req.body;

            await this.citizenAuthService.verifyOTP(citizenNic, otpCode, type);

            log.info(`OTP verified for citizen: ${citizenNic}, type: ${type}`);
            new MessageResponse(res, { message: 'OTP verified successfully' });
        } catch (error) {
            next(error);
        }
    };

    // Check if citizen has password set
    checkPasswordStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.query;

            if (!email) {
                throw new BadRequest('Email is required');
            }

            // This would need to be implemented in the service
            // For now, return a simple response
            new DataResponse(res, {
                data: {
                    hasPassword: true, // This should be determined by checking the citizen's passwordHash
                    loginMethods: ['password', 'otp']
                },
                message: 'Password status retrieved'
            });
        } catch (error) {
            next(error);
        }
    };
}
