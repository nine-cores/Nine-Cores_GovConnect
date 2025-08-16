import express from 'express';
import { register, login, refreshTokens, logout, getCurrentUser } from './controller';
import { authenticate } from '@/middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshTokens);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router;
