import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppDataSource } from '@/database';
import { Document, DocumentType } from '@/database/entities/document.entity';
import { Citizen } from '@/database/entities/citizen.entity';
import { BadRequest, NotFound } from '@/core/errors';
import log from '@/core/logger';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// File filter for allowed file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Allow common document formats
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new BadRequest('Invalid file type. Only PDF, images (JPEG, PNG, GIF), and Word documents are allowed.'));
    }
};

// Configure multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

export class DocumentUploadService {
    private documentRepository = AppDataSource.getRepository(Document);
    private citizenRepository = AppDataSource.getRepository(Citizen);

    private parseDocumentType(documentType?: string): DocumentType {
        if (!documentType) {
            return DocumentType.OTHER;
        }

        // Normalize input to match enum values
        const normalizedType = documentType.toLowerCase().trim();
        
        switch (normalizedType) {
            case 'birthcertificate':
            case 'birth_certificate':
            case 'birth certificate':
            case 'birth':
                return DocumentType.BIRTH_CERTIFICATE;
            case 'policereport':
            case 'police_report':
            case 'police report':
            case 'police':
                return DocumentType.POLICE_REPORT;
            case 'nic':
            case 'national_id':
            case 'national id':
            case 'nationalid':
                return DocumentType.NIC;
            case 'other':
            default:
                return DocumentType.OTHER;
        }
    }

    async uploadDocument(
        citizenNic: string,
        file: Express.Multer.File,
        documentType?: string
    ): Promise<Document> {
        try {
            // Verify citizen exists
            const citizen = await this.citizenRepository.findOne({
                where: { nic: citizenNic }
            });

            if (!citizen) {
                // Clean up uploaded file if citizen doesn't exist
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                throw new NotFound('Citizen not found');
            }

            // Determine document type
            const docType = this.parseDocumentType(documentType);
            
            log.info(`Document upload - Input type: "${documentType}", Parsed type: "${docType}"`);

            // Create document record
            const document = new Document();
            document.citizenNic = citizenNic;
            document.documentType = docType;
            document.originalName = file.originalname;
            document.fileName = file.filename;
            document.filePath = file.path;
            document.mimeType = file.mimetype;
            document.fileSize = file.size;

            const savedDocument = await this.documentRepository.save(document);
            
            log.info(`Document uploaded for citizen ${citizenNic}: ${file.originalname}`);
            
            return savedDocument;
        } catch (error) {
            // Clean up uploaded file on error
            if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            throw error;
        }
    }

    async getDocumentsByNIC(citizenNic: string): Promise<Document[]> {
        return await this.documentRepository.find({
            where: { citizenNic },
            order: { createdAt: 'DESC' }
        });
    }

    async getDocumentById(id: string): Promise<Document | null> {
        return await this.documentRepository.findOne({
            where: { id }
        });
    }

    async deleteDocument(id: string): Promise<boolean> {
        const document = await this.getDocumentById(id);
        if (!document) {
            throw new NotFound('Document not found');
        }

        // Delete file from filesystem
        if (fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        // Delete from database
        await this.documentRepository.delete(id);
        
        log.info(`Document deleted: ${document.originalName}`);
        
        return true;
    }
}
