import express from 'express';
import { GNAvailabilityController } from './controller';
import { authenticate, authorize } from '@/middleware/auth';
import validate from '@/middleware/validator';
import {
    createAvailabilitySchema,
    updateAvailabilitySchema,
    getAvailabilitySchema,
    getAvailableSlotsSchema,
    bulkUpdateAvailabilitySchema,
    deleteAvailabilityByDateSchema
} from './schema';
import { UserRole } from '@/database/entities/user.entity';

const router = express.Router();
const gnAvailabilityController = new GNAvailabilityController();

// Routes for GN officers to manage their availability
router.post(
    '/',
    authenticate,
    authorize([UserRole.GN]),
    validate(createAvailabilitySchema),
    gnAvailabilityController.createAvailability
);

router.get(
    '/my-availability',
    authenticate,
    authorize([UserRole.GN]),
    validate(getAvailabilitySchema),
    gnAvailabilityController.getMyAvailability
);

// DELETE /api/availability/my-availability/:date  (date = YYYY-MM-DD)
router.delete(
    '/my-availability/:date',
    authenticate,
    authorize([UserRole.GN]),
    validate(deleteAvailabilityByDateSchema),
    gnAvailabilityController.deleteAvailabilityForDate
);

router.get(
    '/my-availabile-dates',
    authenticate,
    authorize([UserRole.GN]),
    validate(getAvailabilitySchema),
    gnAvailabilityController.getAllGNAvailabileDates
);

router.put(
    '/:id',
    authenticate,
    authorize([UserRole.GN]),
    validate(updateAvailabilitySchema),
    gnAvailabilityController.updateAvailability
);

router.delete(
    '/:id',
    authenticate,
    authorize([UserRole.GN]),
    gnAvailabilityController.deleteAvailability
);

router.patch(
    '/bulk-update',
    authenticate,
    authorize([UserRole.GN]),
    validate(bulkUpdateAvailabilitySchema),
    gnAvailabilityController.bulkUpdateAvailability
);

router.get(
    '/stats',
    authenticate,
    authorize([UserRole.GN]),
    gnAvailabilityController.getAvailabilityStats
);

// Public routes for citizens to view available slots
router.get(
    '/available-slots',
    validate(getAvailableSlotsSchema),
    gnAvailabilityController.getAvailableSlots
);

export default router;
