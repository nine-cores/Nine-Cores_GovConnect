import { Router } from 'express';
import { CertificateRequestController } from './controller';
import { authenticateCitizen } from '../../middleware/citizen-auth';
import { authenticate } from '../../middleware/auth';

const router = Router();
const certificateRequestController = new CertificateRequestController();

// Public routes
router.get('/certificate-types', certificateRequestController.getCertificateTypes);
router.get('/certificate-request-statuses', certificateRequestController.getRequestStatuses);

// Create a new certificate request (citizen only)
router.post(
  '/',
  authenticateCitizen,
  certificateRequestController.createCertificateRequest.bind(certificateRequestController)
);

// Citizen routes (require citizen authentication)
router.get('/certificate-requests', authenticateCitizen, certificateRequestController.getMyCertificateRequests);
router.get('/certificate-requests/:id', authenticateCitizen, certificateRequestController.getCertificateRequest);
router.delete('/certificate-requests/:id', authenticateCitizen, certificateRequestController.deleteCertificateRequest);

// Admin routes (require admin authentication)
router.get('/admin/certificate-requests', authenticate, certificateRequestController.getAllCertificateRequests);
router.put('/admin/certificate-requests/:id/status', authenticate, certificateRequestController.updateRequestStatus);

export default router;
