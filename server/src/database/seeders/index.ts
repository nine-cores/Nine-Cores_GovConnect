import { db } from '@/config';
import path from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const seedsDatasource = new DataSource({
    type: 'postgres',
    host: db.host,
    port: db.port,
    username: db.user,
    password: db.pwd,
    database: db.name,
    synchronize: false,
    logging: false,
    entities: [path.join(__dirname, '../entities/**/*.entity.{ts,js}')],
    migrations: [path.join(__dirname, '/scripts/**/*.{ts,js}')],
    subscribers: [],
    migrationsTableName: 'migration_seeders',
    namingStrategy: new SnakeNamingStrategy(),
});
;
