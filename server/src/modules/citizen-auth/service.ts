import { AppDataSource } from '@/database';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Citizen, CitizenAccountStatus } from '@/database/entities/citizen.entity';
import { CitizenOTP, OTPType, OTPStatus } from '@/database/entities/citizen-otp.entity';
import { CitizenSession, SessionStatus, LoginMethod } from '@/database/entities/citizen-session.entity';
import { emailService } from '@/core/email';
import { BadRequest, Unauthorized, NotFound, Conflict } from '@/core/errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import log from '@/core/logger';

interface LoginRequest {
    email: string;
    password?: string;
    otpCode?: string;
    loginMethod: 'password' | 'otp';
    ipAddress?: string;
    userAgent?: string;
}

interface AuthResponse {
    citizen: {
        nic: string;
        displayName: string;
        email: string;
        verificationStatus: string;
    };
    accessToken: string;
    refreshToken: string;
    loginMethod: string;
}

interface OTPRequest {
    email: string;
    type: OTPType;
    ipAddress?: string;
    userAgent?: string;
}

export class CitizenAuthService {
    private citizenRepository: Repository<Citizen>;
    private otpRepository: Repository<CitizenOTP>;
    private sessionRepository: Repository<CitizenSession>;

    constructor() {
        this.citizenRepository = AppDataSource.getRepository(Citizen);
        this.otpRepository = AppDataSource.getRepository(CitizenOTP);
        this.sessionRepository = AppDataSource.getRepository(CitizenSession);
    }

    // Password-based login
    async loginWithPassword(request: LoginRequest): Promise<AuthResponse> {
        if (!request.password) {
            throw new BadRequest('Password is required for password-based login');
        }

        const citizen = await this.findCitizenByEmail(request.email);
        
        if (!citizen.passwordHash) {
            throw new BadRequest('Password not set. Please use OTP login or set a password first.');
        }

        const isPasswordValid = await bcrypt.compare(request.password, citizen.passwordHash);
        if (!isPasswordValid) {
            throw new Unauthorized('Invalid email or password');
        }

        return this.createAuthResponse(citizen, LoginMethod.PASSWORD, request);
    }

    // OTP-based login
    async loginWithOTP(request: LoginRequest): Promise<AuthResponse> {
        if (!request.otpCode) {
            throw new BadRequest('OTP code is required for OTP-based login');
        }

        const citizen = await this.findCitizenByEmail(request.email);
        
        // Verify OTP
        await this.verifyOTP(citizen.nic, request.otpCode, OTPType.LOGIN);

        return this.createAuthResponse(citizen, LoginMethod.OTP, request);
    }

    // Generate and send OTP
    async generateOTP(request: OTPRequest): Promise<{ message: string; expiresAt: Date }> {
        const citizen = await this.findCitizenByEmail(request.email);

        // Check rate limiting (max 3 OTPs per 15 minutes)
        await this.checkOTPRateLimit(citizen.nic, request.type);

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Invalidate previous pending OTPs of the same type
        await this.otpRepository.update(
            {
                citizenNic: citizen.nic,
                type: request.type,
                status: OTPStatus.PENDING
            },
            { status: OTPStatus.EXPIRED }
        );

        // Create new OTP
        const otp = this.otpRepository.create({
            citizenNic: citizen.nic,
            otpCode,
            type: request.type,
            expiresAt,
            ipAddress: request.ipAddress,
            userAgent: request.userAgent
        });

        await this.otpRepository.save(otp);

        // Send OTP via email
        const emailSent = await emailService.sendOTPEmail(
            citizen.email!,
            otpCode,
            request.type
        );

        if (!emailSent) {
            throw new Error('Failed to send OTP email');
        }

        log.info(`OTP generated for citizen ${citizen.nic}, type: ${request.type}`);

        return {
            message: `OTP sent to your email address ending with ...${citizen.email!.slice(-4)}`,
            expiresAt
        };
    }

    // Verify OTP
    async verifyOTP(citizenNic: string, otpCode: string, type: OTPType): Promise<void> {
        const otp = await this.otpRepository.findOne({
            where: {
                citizenNic,
                otpCode,
                type,
                status: OTPStatus.PENDING
            }
        });

        if (!otp) {
            throw new BadRequest('Invalid or expired OTP code');
        }

        if (otp.isExpired()) {
            await this.otpRepository.update({ id: otp.id }, { status: OTPStatus.EXPIRED });
            throw new BadRequest('OTP code has expired');
        }

        // Mark OTP as verified
        otp.status = OTPStatus.VERIFIED;
        otp.verifiedAt = new Date();
        await this.otpRepository.save(otp);

        log.info(`OTP verified for citizen ${citizenNic}, type: ${type}`);
    }

    // Set password for citizen
    async setPassword(citizenNic: string, password: string, otpCode: string): Promise<{ message: string }> {
        // Verify OTP first
        await this.verifyOTP(citizenNic, otpCode, OTPType.PASSWORD_RESET);

        const citizen = await this.citizenRepository.findOne({
            where: { nic: citizenNic }
        });

        if (!citizen) {
            throw new NotFound('Citizen not found');
        }

        // Hash and save password
        const passwordHash = await bcrypt.hash(password, 10);
        citizen.passwordHash = passwordHash;
        await this.citizenRepository.save(citizen);

        log.info(`Password set for citizen ${citizenNic}`);

        return { message: 'Password set successfully' };
    }

    // Refresh access token
    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        const session = await this.sessionRepository.findOne({
            where: { refreshToken, status: SessionStatus.ACTIVE },
            relations: ['citizen']
        });

        if (!session || !session.isActive()) {
            throw new Unauthorized('Invalid or expired refresh token');
        }

        // Update last used time
        session.lastUsedAt = new Date();
        await this.sessionRepository.save(session);

        // Generate new access token
        const accessToken = this.generateAccessToken(session.citizen!);

        return { accessToken };
    }

    // Logout (invalidate session)
    async logout(refreshToken: string): Promise<{ message: string }> {
        const session = await this.sessionRepository.findOne({
            where: { refreshToken }
        });

        if (session) {
            session.status = SessionStatus.REVOKED;
            await this.sessionRepository.save(session);
        }

        return { message: 'Logged out successfully' };
    }

    // Helper methods
    private async findCitizenByEmail(email: string): Promise<Citizen> {
        const citizen = await this.citizenRepository.findOne({
            where: { email }
        });

        if (!citizen) {
            throw new NotFound('No citizen found with this email address');
        }

        if (citizen.accountStatus !== CitizenAccountStatus.ACTIVE) {
            throw new Unauthorized('Citizen account is not active');
        }

        return citizen;
    }

    private async createAuthResponse(
        citizen: Citizen,
        loginMethod: LoginMethod,
        request: LoginRequest
    ): Promise<AuthResponse> {
        // Generate tokens
        const accessToken = this.generateAccessToken(citizen);
        const refreshToken = this.generateRefreshToken();

        // Create session
        const session = this.sessionRepository.create({
            citizenNic: citizen.nic,
            refreshToken,
            loginMethod,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            ipAddress: request.ipAddress,
            userAgent: request.userAgent,
            lastUsedAt: new Date()
        });

        await this.sessionRepository.save(session);

        log.info(`Citizen ${citizen.nic} logged in via ${loginMethod}`);

        return {
            citizen: {
                nic: citizen.nic,
                displayName: citizen.displayName,
                email: citizen.email!,
                verificationStatus: citizen.verificationStatus
            },
            accessToken,
            refreshToken,
            loginMethod
        };
    }

    private generateAccessToken(citizen: Citizen): string {
        const payload = {
            nic: citizen.nic,
            email: citizen.email,
            type: 'citizen',
            verificationStatus: citizen.verificationStatus
        };

        return jwt.sign(payload, process.env.ACCESS_JWT_SECRET!, {
            expiresIn: '24h',
            issuer: 'gov-portal',
            audience: 'citizen'
        });
    }

    private generateRefreshToken(): string {
        return jwt.sign(
            { type: 'refresh' },
            process.env.REFRESH_JWT_SECRET!,
            { expiresIn: '7d' }
        );
    }

    private async checkOTPRateLimit(citizenNic: string, type: OTPType): Promise<void> {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        
        const recentOTPs = await this.otpRepository.count({
            where: {
                citizenNic,
                type,
                createdAt: MoreThanOrEqual(fifteenMinutesAgo)
            }
        });

        if (recentOTPs >= 3) {
            throw new BadRequest('Too many OTP requests. Please wait 15 minutes before trying again.');
        }
    }
}
