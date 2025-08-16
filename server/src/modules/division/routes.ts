import { Router } from 'express';
import { DivisionController } from './controller';
import { authorize } from '@/middleware/auth';
import { UserRole } from '@/database/entities/user.entity';

const router = Router();
const divisionController = new DivisionController();

// Admin-only routes for managing divisions
router.post('/', 
    authorize([UserRole.ADMIN]), 
    divisionController.createDivision
);

router.get('/', 
    authorize([UserRole.ADMIN, UserRole.GN, UserRole.STAFF_MT]), 
    divisionController.getAllDivisions
);

router.get('/stats', 
    authorize([UserRole.ADMIN]), 
    divisionController.getDivisionStats
);

router.get('/without-gn', 
    authorize([UserRole.ADMIN]), 
    divisionController.getDivisionsWithoutGN
);

router.get('/available-gn-users', 
    authorize([UserRole.ADMIN]), 
    divisionController.getAvailableGNUsers
);

router.get('/by-gn/:gnUserId', 
    authorize([UserRole.ADMIN, UserRole.GN]), 
    divisionController.getDivisionByGNUserId
);

router.get('/:divisionId', 
    authorize([UserRole.ADMIN, UserRole.GN, UserRole.STAFF_MT]), 
    divisionController.getDivisionById
);

router.put('/:divisionId', 
    authorize([UserRole.ADMIN]), 
    divisionController.updateDivision
);

router.delete('/:divisionId', 
    authorize([UserRole.ADMIN]), 
    divisionController.deleteDivision
);

// GN assignment routes
router.post('/assign-gn', 
    authorize([UserRole.ADMIN]), 
    divisionController.assignGNToDivision
);

router.delete('/:divisionId/remove-gn', 
    authorize([UserRole.ADMIN]), 
    divisionController.removeGNFromDivision
);

export default router;
