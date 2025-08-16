import { Request, Response } from 'express';
import { DocumentUploadService, upload } from '@/services/document-upload.service';
import { dataResponse, messageResponse } from '@/core/responses';
import { BadRequest, NotFound } from '@/core/errors';
import path from 'path';
import fs from 'fs';

const documentUploadService = new DocumentUploadService();

// Middleware for handling single file upload
export const uploadMiddleware = upload.single('document');

export const uploadDocument = async (req: Request, res: Response) => {
    try {
        // Set CORS headers for file upload
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        
        if (!req.file) {
            throw new BadRequest('No file uploaded');
        }

        const { citizenNic } = req.params;
        const { documentType } = req.body;

        if (!citizenNic) {
            throw new BadRequest('Citizen NIC is required');
        }

        const document = await documentUploadService.uploadDocument(
            citizenNic,
            req.file,
            documentType
        );

        return dataResponse(res, {
            id: document.id,
            citizenNic: document.citizenNic,
            documentType: document.documentType,
            originalName: document.originalName,
            fileName: document.fileName,
            mimeType: document.mimeType,
            fileSize: document.fileSize,
            createdAt: document.createdAt
        }, 'Document uploaded successfully');

    } catch (error) {
        throw error;
    }
};

export const getDocumentsByNIC = async (req: Request, res: Response) => {
    try {
        const { citizenNic } = req.params;

        if (!citizenNic) {
            throw new BadRequest('Citizen NIC is required');
        }

        const documents = await documentUploadService.getDocumentsByNIC(citizenNic);

        const documentData = documents.map(doc => ({
            id: doc.id,
            citizenNic: doc.citizenNic,
            documentType: doc.documentType,
            originalName: doc.originalName,
            fileName: doc.fileName,
            mimeType: doc.mimeType,
            fileSize: doc.fileSize,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        }));

        return dataResponse(res, documentData, 'Documents retrieved successfully');

    } catch (error) {
        throw error;
    }
};

export const downloadDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new BadRequest('Document ID is required');
        }

        const document = await documentUploadService.getDocumentById(id);

        if (!document) {
            throw new NotFound('Document not found');
        }

        // Check if file exists
        if (!fs.existsSync(document.filePath)) {
            throw new NotFound('Document file not found on server');
        }

        // Set CORS headers for file download
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type, Content-Length');
        
        // Set appropriate headers
        res.setHeader('Content-Type', document.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);

        // Stream the file
        const fileStream = fs.createReadStream(document.filePath);
        fileStream.pipe(res);

    } catch (error) {
        throw error;
    }
};

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new BadRequest('Document ID is required');
        }

        await documentUploadService.deleteDocument(id);

        return messageResponse(res, 'Document deleted successfully');

    } catch (error) {
        throw error;
    }
};

export const serveDocument = async (req: Request, res: Response) => {
    try {
        const { filename } = req.params;

        if (!filename) {
            throw new BadRequest('Filename is required');
        }

        const filePath = path.join(process.cwd(), 'uploads', filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new NotFound('File not found');
        }

        // Get file stats for content type detection
        const stats = fs.statSync(filePath);
        const ext = path.extname(filename).toLowerCase();
        
        let contentType = 'application/octet-stream';
        if (ext === '.pdf') contentType = 'application/pdf';
        else if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.gif') contentType = 'image/gif';

        // Set CORS headers for file serving
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        throw error;
    }
};
