import { AppDataSource } from '@/database';
import logger  from '@/core/logger';

async function clearDataOnly() {
    try {
        logger.info('Connecting to database...');
        await AppDataSource.initialize();
        
        logger.info('Starting data cleanup (preserving migrations)...');
        
        // Get all table names except migrations
        const tables = await AppDataSource.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name != 'migrations'
        `);

        // Disable foreign key checks temporarily
        await AppDataSource.query('SET session_replication_role = replica;');
        
        // Drop all tables except migrations
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

        // Re-enable foreign key checks
        await AppDataSource.query('SET session_replication_role = DEFAULT;');
        
        logger.info('Data cleared successfully (migrations preserved)!');
        
    } catch (error) {
        logger.error('Error clearing data:');
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            logger.info('Database connection closed');
        }
        process.exit(0);
    }
}

clearDataOnly().catch((error) => {
    logger.error('Failed to clear data:');
    process.exit(1);
});
