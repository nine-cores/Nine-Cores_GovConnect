import { AppDataSource } from '@/database';
import { Document, DocumentType } from '@/database/entities/document.entity';
import { Citizen } from '@/database/entities/citizen.entity';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs/promises';
import log from '@/core/logger';

export class DocumentService {
    private documentRepository: Repository<Document>;
    private citizenRepository: Repository<Citizen>;

    constructor() {
        this.documentRepository = AppDataSource.getRepository(Document);
        this.citizenRepository = AppDataSource.getRepository(Citizen);
    }

    async uploadDocument(
        citizenNic: string,
        file: Express.Multer.File,
        documentType: DocumentType = DocumentType.OTHER
    ): Promise<Document> {
        // Verify citizen exists
        const citizen = await this.citizenRepository.findOne({
            where: { nic: citizenNic }
        });

        if (!citizen) {
            throw new Error('Citizen not found');
        }

        // Generate unique filename
        const fileExtension = path.extname(file.originalname);
        const timestamp = Date.now();
        const fileName = `${citizenNic}_${documentType}_${timestamp}${fileExtension}`;
        const filePath = path.join('uploads', fileName);

        // Create document record
        const document = this.documentRepository.create({
            citizenNic,
            documentType,
            originalName: file.originalname,
            fileName,
            filePath,
            mimeType: file.mimetype,
            fileSize: file.size
        });

        return await this.documentRepository.save(document);
    }

    async getDocumentsByNic(citizenNic: string): Promise<Document[]> {
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

    async deleteDocument(id: string, citizenNic: string): Promise<boolean> {
        const document = await this.documentRepository.findOne({
            where: { id, citizenNic }
        });

        if (!document) {
            return false;
        }

        try {
            // Delete physical file
            await fs.unlink(document.filePath);
        } catch (error) {
            log.warn(`Failed to delete physical file: ${document.filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }

        // Delete database record
        await this.documentRepository.remove(document);
        return true;
    }

    async getDocumentsByType(citizenNic: string, documentType: DocumentType): Promise<Document[]> {
        return await this.documentRepository.find({
            where: { citizenNic, documentType },
            order: { createdAt: 'DESC' }
        });
    }
}
