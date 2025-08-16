import { Router } from 'express';
import { DebugController } from './controller';

const router = Router();
const debugController = new DebugController();

/**
 * @route GET /api/v1/debug/otp/:email
 * @desc Get latest OTP for testing purposes
 * @access Public (only for development)
 */
router.get('/otp/:email', debugController.getLatestOTP);

/**
 * @route GET /api/v1/debug/otps
 * @desc Get all pending OTPs for debugging
 * @access Public (only for development)
 */
router.get('/otps', debugController.getAllPendingOTPs);

export default router;
