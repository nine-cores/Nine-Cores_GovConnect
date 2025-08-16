import { Router } from 'express';
import { CitizenAppointmentController } from './controller';
import { authenticateCitizen } from '@/middleware/citizen-auth';
import { authenticate } from '@/middleware/auth';

const router = Router();
const citizenAppointmentController = new CitizenAppointmentController();

// Public endpoints (no authentication required)

// Get available GN services
router.get('/services', 
    citizenAppointmentController.getAvailableGNServices
);

// Protected endpoints (require citizen authentication)

// Get available time slots by query parameters (for authenticated citizen's division GN)
router.get('/available-slots', 
    authenticateCitizen,
    citizenAppointmentController.getAvailableSlotsWithQuery
);

// Create appointment and book time slot in one operation
router.post('/appointments', 
    authenticateCitizen,
    citizenAppointmentController.createAppointment
);

// Get citizen's appointments (use authenticated citizen's NIC)
router.get('/my-appointments', 
    authenticateCitizen,
    citizenAppointmentController.getCitizenAppointments
);

// Cancel appointment
router.post('/cancel/:appointmentId', 
    authenticateCitizen,
    citizenAppointmentController.cancelAppointment
);

// GN Officer endpoints (require regular user authentication)

// Get GN's appointments with query options
router.get('/gn/appointments', 
    authenticate,
    citizenAppointmentController.getGNAppointments
);

export default router;
