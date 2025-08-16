import express from 'express';
import path from 'path';
import { HttpError } from '@/core/errors';
import { api } from '@/config';
import log from '@/core/logger';
import routes from '@/routes';
import cors from 'cors';
import { checkCorsOrigin } from '@/core/cors';
import { createConnection } from '@/database';
import 'tsconfig-paths/register';

const app = express();

// express configurations
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploads with proper headers
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
    setHeaders: (res, path) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
}));

// Enhanced CORS configuration for file uploads
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            
            // In development, allow all origins
            if (process.env.NODE_ENV === 'development') {
                return callback(null, true);
            }
            
            // Use the existing CORS check for production
            return checkCorsOrigin(origin, callback);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'Cache-Control',
            'Pragma',
            'Content-Length',
            'Content-Disposition'
        ],
        exposedHeaders: [
            'Content-Length',
            'Content-Type',
            'Content-Disposition',
            'Cache-Control'
        ],
        optionsSuccessStatus: 200 // For legacy browser support
    })
);

// database connection
createConnection()
    .then(() => {
        log.info('Connected to database');
    })
    .catch((error) => {
        log.error('Error connecting to database:');
        log.error(error);
    });

// http routes
app.use(`/api/${api.version}`, routes);

// http error class handler
app.use(HttpError.middleware);

app.listen(api.port, () => {
    log.info(`Listening on port: ${api.port}`);
});
