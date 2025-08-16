import jwt, { SignOptions } from 'jsonwebtoken';
import { auth } from '@/config';
import { User, UserAccountStatus } from '@/database/entities/user.entity';
import { AppDataSource } from '@/database';
import { Unauthorized, BadRequest, Conflict } from '@/core/errors';

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    userId: string;
    displayName: string;
    phoneNumber: string;
    email: string;
    password: string;
    role: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);

    generateAccessToken(payload: JwtPayload): string {
        if (!auth.jwt.access.secret) {
            throw new Error('Access JWT secret is not configured');
        }
        return jwt.sign(payload, auth.jwt.access.secret, {
            expiresIn: auth.jwt.access.expiresIn
        } as SignOptions);
    }

    generateRefreshToken(payload: JwtPayload): string {
        if (!auth.jwt.refresh.secret) {
            throw new Error('Refresh JWT secret is not configured');
        }
        return jwt.sign(payload, auth.jwt.refresh.secret, {
            expiresIn: auth.jwt.refresh.expiresIn
        } as SignOptions);
    }

    verifyAccessToken(token: string): JwtPayload {
        if (!auth.jwt.access.secret) {
            throw new Error('Access JWT secret is not configured');
        }
        try {
            return jwt.verify(token, auth.jwt.access.secret) as JwtPayload;
        } catch (error) {
            throw new Unauthorized('Invalid or expired access token');
        }
    }

    verifyRefreshToken(token: string): JwtPayload {
        if (!auth.jwt.refresh.secret) {
            throw new Error('Refresh JWT secret is not configured');
        }
        try {
            return jwt.verify(token, auth.jwt.refresh.secret) as JwtPayload;
        } catch (error) {
            throw new Unauthorized('Invalid or expired refresh token');
        }
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new Conflict('User with this email already exists');
        }

        // Create new user
        const user = this.userRepository.create({
            userId: data.userId,
            displayName: data.displayName,
            phoneNumber: data.phoneNumber,
            email: data.email,
            passwordHash: data.password,
            role: data.role as any
        });

        await this.userRepository.save(user);

        // Generate tokens
        const payload: JwtPayload = {
            userId: user.userId,
            email: user.email,
            role: user.role
        };

        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);

        // Save refresh token
        user.refreshToken = refreshToken;
        await this.userRepository.save(user);

        return {
            user,
            accessToken,
            refreshToken
        };
    }

    async login(data: LoginData): Promise<AuthResponse> {
        // Find user by email
        const user = await this.userRepository.findOne({
            where: { email: data.email }
        });

        if (!user) {
            throw new Unauthorized('Invalid email or password');
        }

        // Check if user is active
        if (user.accountStatus !== UserAccountStatus.ACTIVE) {
            throw new Unauthorized('Account is not active');
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(data.password);
        if (!isPasswordValid) {
            throw new Unauthorized('Invalid email or password');
        }

        // Update last login
        user.lastLoginAt = new Date();

        // Generate tokens
        const payload: JwtPayload = {
            userId: user.userId,
            email: user.email,
            role: user.role
        };

        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);

        // Save refresh token and last login
        user.refreshToken = refreshToken;
        await this.userRepository.save(user);

        return {
            user,
            accessToken,
            refreshToken
        };
    }

    async refreshTokens(refreshToken: string): Promise<AuthResponse> {
        // Verify refresh token
        const payload = this.verifyRefreshToken(refreshToken);

        // Find user
        const user = await this.userRepository.findOne({
            where: { userId: payload.userId, refreshToken }
        });

        if (!user) {
            throw new Unauthorized('Invalid refresh token');
        }

        // Check if user is active
        if (user.accountStatus !== UserAccountStatus.ACTIVE) {
            throw new Unauthorized('Account is not active');
        }

        // Generate new tokens
        const newPayload: JwtPayload = {
            userId: user.userId,
            email: user.email,
            role: user.role
        };

        const accessToken = this.generateAccessToken(newPayload);
        const newRefreshToken = this.generateRefreshToken(newPayload);

        // Save new refresh token
        user.refreshToken = newRefreshToken;
        await this.userRepository.save(user);

        return {
            user,
            accessToken,
            refreshToken: newRefreshToken
        };
    }

    async logout(refreshToken: string): Promise<void> {
        // Verify refresh token
        const payload = this.verifyRefreshToken(refreshToken);

        // Find user and clear refresh token
        const user = await this.userRepository.findOne({
            where: { userId: payload.userId }
        });

        if (user) {
            user.refreshToken = null;
            await this.userRepository.save(user);
        }
    }

    async getUserById(userId: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { userId, accountStatus: UserAccountStatus.ACTIVE }
        });
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { email, accountStatus: UserAccountStatus.ACTIVE }
        });
    }
}
