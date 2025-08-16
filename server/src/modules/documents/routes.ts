import express from 'express';
import {
    uploadDocument,
    getDocumentsByNIC,
    downloadDocument,
    deleteDocument,
    serveDocument,
    uploadMiddleware
} from './controller';
import { authenticateCitizen } from '@/middleware/citizen-auth';
import { authenticate, authorize } from '@/middleware/auth';
import { UserRole } from '@/database/entities/user.entity';

const router = express.Router();

// Handle preflight OPTIONS requests for CORS - specific routes
router.options('/upload/:citizenNic', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(200).end();
});

router.options('/citizen/:citizenNic', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(200).end();
});

router.options('/download/:id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(200).end();
});

// Static route to serve uploaded files
router.get('/files/:filename', serveDocument);

// Citizen routes (require citizen authentication)
router.post('/upload/:citizenNic', 
    authenticateCitizen, 
    uploadMiddleware, 
    uploadDocument
);

router.get('/citizen/:citizenNic', 
    authenticateCitizen, 
    getDocumentsByNIC
);

router.get('/download/:id', 
    authenticateCitizen, 
    downloadDocument
);

router.delete('/:id', 
    authenticateCitizen, 
    deleteDocument
);

// Admin/GN routes (require staff authentication)
router.get('/admin/:citizenNic', 
    authenticate,
    authorize([UserRole.GN, UserRole.ADMIN]), 
    getDocumentsByNIC
);

router.get('/admin/download/:id', 
    authenticate,
    authorize([UserRole.GN, UserRole.ADMIN]), 
    downloadDocument
);

router.delete('/admin/:id', 
    authenticate,
    authorize([UserRole.ADMIN]), 
    deleteDocument
);

export default router;
