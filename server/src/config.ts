import * as dotenv from 'dotenv';
dotenv.config();

export const { env, api, app, db, auth } = {
    env: process.env.NODE_ENV || 'production',

    api: {
        port: process.env.PORT || 8000,
        version: 'v1',
        url: process.env.API_URL,
        host: process.env.API_HOST
    },

    app: {
        url: process.env.APP_URL
    },

    db: {
        user: process.env.DB_USER,
        name: process.env.DB_NAME,
        pwd: process.env.DB_PWD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432
    },

    auth: {
        salt: 10,
        jwt: {
            access: {
                secret: process.env.ACCESS_JWT_SECRET,
                expiresIn: '24h'
            },
            refresh: {
                secret: process.env.REFRESH_JWT_SECRET,
                expiresIn: '30d'
            }
        }
    }
};
