import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const fileExtension = path.extname(file.originalname);
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileName = `${timestamp}_${randomString}${fileExtension}`;
        cb(null, fileName);
    }
});

// File filter to allow only certain file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Allowed file types
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'));
    }
};

// Multer configuration
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Single file upload middleware
export const uploadSingle = upload.single('document');
