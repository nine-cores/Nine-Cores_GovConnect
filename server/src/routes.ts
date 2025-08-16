import express from 'express';
import helloController from '@/modules/hello/controller';
import authRoutes from '@/modules/auth/routes';
import userRoutes from '@/modules/users/routes';
import citizenRoutes from '@/modules/citizens/routes';
import citizenAuthRoutes from '@/modules/citizen-auth/routes';
import gnAvailabilityRoutes from '@/modules/gn-availability/routes';
import divisionRoutes from '@/modules/division/routes';
import citizenAppointmentRoutes from '@/modules/citizen-appointments/routes';
import documentRoutes from '@/modules/documents/routes';
import certificateRequestRoutes from '@/modules/certificate-requests/routes';
import debugRoutes from '@/modules/debug/routes';

const router = express.Router();

router.use('/hello', helloController);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/citizens', citizenRoutes);
router.use('/citizen-auth', citizenAuthRoutes);
router.use('/gn-availability', gnAvailabilityRoutes);
router.use('/divisions', divisionRoutes);
router.use('/citizen-appointments', citizenAppointmentRoutes);
router.use('/documents', documentRoutes);
router.use('/certificate-requests', certificateRequestRoutes);

// Only include debug routes in development
if (process.env.NODE_ENV === 'development') {
    router.use('/debug', debugRoutes);
}

export default router;
