import { Router } from 'express';
import { CitizenAuthController } from './controller';
import validate from '@/middleware/validator';
import {
    loginWithPasswordSchema,
    loginWithOTPSchema,
    requestOTPSchema,
    setPasswordSchema,
    refreshTokenSchema,
    verifyOTPSchema
} from './schema';

const router = Router();
const citizenAuthController = new CitizenAuthController();

/**
 * @route POST /api/v1/citizen-auth/login/password
 * @desc Login citizen with email and password
 * @access Public
 */
router.post(
    '/login/password',
    validate(loginWithPasswordSchema),
    citizenAuthController.loginWithPassword
);

/**
 * @route POST /api/v1/citizen-auth/login/otp
 * @desc Login citizen with email and OTP
 * @access Public
 */
router.post(
    '/login/otp',
    validate(loginWithOTPSchema),
    citizenAuthController.loginWithOTP
);

/**
 * @route POST /api/v1/citizen-auth/request-login-otp
 * @desc Request OTP for login
 * @access Public
 */
router.post(
    '/request-login-otp',
    validate(requestOTPSchema),
    citizenAuthController.requestLoginOTP
);

/**
 * @route POST /api/v1/citizen-auth/request-password-reset-otp
 * @desc Request OTP for password reset
 * @access Public
 */
router.post(
    '/request-password-reset-otp',
    validate(requestOTPSchema),
    citizenAuthController.requestPasswordResetOTP
);

/**
 * @route POST /api/v1/citizen-auth/set-password
 * @desc Set password for citizen account
 * @access Public (requires OTP verification)
 */
router.post(
    '/set-password',
    validate(setPasswordSchema),
    citizenAuthController.setPassword
);

/**
 * @route POST /api/v1/citizen-auth/refresh-token
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post(
    '/refresh-token',
    validate(refreshTokenSchema),
    citizenAuthController.refreshToken
);

/**
 * @route POST /api/v1/citizen-auth/logout
 * @desc Logout citizen (invalidate session)
 * @access Public
 */
router.post(
    '/logout',
    validate(refreshTokenSchema),
    citizenAuthController.logout
);

/**
 * @route POST /api/v1/citizen-auth/verify-otp
 * @desc Verify OTP (standalone endpoint for verification without login)
 * @access Public
 */
router.post(
    '/verify-otp',
    validate(verifyOTPSchema),
    citizenAuthController.verifyOTP
);

/**
 * @route GET /api/v1/citizen-auth/password-status
 * @desc Check if citizen has password set and available login methods
 * @access Public
 */
router.get(
    '/password-status',
    citizenAuthController.checkPasswordStatus
);

export default router;
