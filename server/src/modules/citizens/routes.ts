import express from 'express';
import {
    addCitizen,
    getCitizenByNIC,
    updateCitizen,
    verifyCitizen,
    getCitizensByDivision,
    searchCitizens,
    previewCitizenData,
    getAllCitizens,
    bulkLoadCitizens
} from './controller';
import { authenticate, authorize } from '@/middleware/auth';
import { UserRole } from '@/database/entities/user.entity';

const router = express.Router();

// All citizen routes require authentication
router.use(authenticate);

// GN officer routes
router.post('/', 
    authorize([UserRole.GN, UserRole.ADMIN]), 
    addCitizen
);

router.get('/my-division', 
    authorize([UserRole.GN]), 
    getCitizensByDivision
);

router.get('/preview/:nic', 
    authorize([UserRole.GN, UserRole.ADMIN]), 
    previewCitizenData
);

router.patch('/:nic/verify', 
    authorize([UserRole.GN, UserRole.ADMIN]), 
    verifyCitizen
);

// Search routes (GN and Admin)
router.get('/search', 
    authorize([UserRole.GN, UserRole.ADMIN]), 
    searchCitizens
);

// Admin routes
router.post('/bulk-load', 
    authorize([UserRole.ADMIN]), 
    bulkLoadCitizens
);

router.get('/', 
    authorize([UserRole.ADMIN]), 
    getAllCitizens
);

// General routes (GN and Admin)
router.get('/:nic', 
    authorize([UserRole.GN, UserRole.ADMIN]), 
    getCitizenByNIC
);

router.patch('/:nic', 
    authorize([UserRole.GN, UserRole.ADMIN]), 
    updateCitizen
);

export default router;
