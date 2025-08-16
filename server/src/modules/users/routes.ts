import express from 'express';
import { getProfile, getAllUsers, getUserById, updateUserStatus, deleteUser } from './controller';
import { authenticate, authorize } from '@/middleware/auth';
import validate from '@/middleware/validator';
import { updateStatusSchema, getUserByIdSchema } from './schema';
import { UserRole } from '@/database/entities/user.entity';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// User profile (accessible by all authenticated users)
router.get('/profile', getProfile);

// Admin-only routes
router.get('/', authorize([UserRole.ADMIN]), getAllUsers);
router.get('/:id', authorize([UserRole.ADMIN]), validate(getUserByIdSchema, 'params'), getUserById);
router.patch('/:id/status', authorize([UserRole.ADMIN]), validate(getUserByIdSchema, 'params'), validate(updateStatusSchema), updateUserStatus);
router.delete('/:id', authorize([UserRole.ADMIN]), validate(getUserByIdSchema, 'params'), deleteUser);

export default router;
