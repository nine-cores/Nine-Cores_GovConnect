import { AppDataSource } from '@/database';
import logger from '@/core/logger';

async function clearDatabase() {
    try {
        logger.info('Connecting to database...');
        await AppDataSource.initialize();
        
        logger.info('Starting database cleanup...');
        
        // Disable foreign key checks temporarily
        await AppDataSource.query('SET session_replication_role = replica;');
        
        // Get all table names including migrations for complete reset
        const tables = await AppDataSource.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `);

        // Drop all tables (including migrations for complete reset)
        for (const table of tables) {
            const tableName = table.table_name;
            logger.info(`Dropping table: ${tableName}`);
            await AppDataSource.query(`DROP TABLE IF EXISTS "public"."${tableName}" CASCADE;`);
        }

        // Drop all custom types/enums
        const types = await AppDataSource.query(`
            SELECT typname 
            FROM pg_type 
            WHERE typnamespace = (
                SELECT oid FROM pg_namespace WHERE nspname = 'public'
            ) 
            AND typtype = 'e'
        `);

        for (const type of types) {
            const typeName = type.typname;
            logger.info(`Dropping enum type: ${typeName}`);
            await AppDataSource.query(`DROP TYPE IF EXISTS "public"."${typeName}" CASCADE;`);
        }

        // Drop all sequences
        const sequences = await AppDataSource.query(`
            SELECT sequence_name 
            FROM information_schema.sequences 
            WHERE sequence_schema = 'public'
        `);

        for (const sequence of sequences) {
            const sequenceName = sequence.sequence_name;
            logger.info(`Dropping sequence: ${sequenceName}`);
            await AppDataSource.query(`DROP SEQUENCE IF EXISTS "public"."${sequenceName}" CASCADE;`);
        }

        // Re-enable foreign key checks
        await AppDataSource.query('SET session_replication_role = DEFAULT;');
        
        logger.info('Database cleared completely (including migrations)!');
        
    } catch (error) {
        logger.error('Error clearing database:');
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            logger.info('Database connection closed');
        }
        process.exit(0);
    }
}

clearDatabase().catch((error) => {
    logger.error('Failed to clear database:');
    process.exit(1);
});
