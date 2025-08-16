import { db } from '@/config';
import path from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: db.host,
    port: db.port,
    username: db.user,
    password: db.pwd,
    database: db.name,
    synchronize: false,
    logging: false,
    entities: [path.join(__dirname, '/entities/**/*.entity.{ts,js}')],
    migrations: [path.join(__dirname, '/migrations/**/*.{ts,js}')],
    subscribers: [],
    migrationsTableName: 'migrations',
    namingStrategy: new SnakeNamingStrategy(),
});
;

export async function createConnection() {
    if (!AppDataSource.isInitialized) { try { await AppDataSource.initialize(); } catch (error) { throw error; } }
}
