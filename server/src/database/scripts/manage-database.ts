import { AppDataSource } from '@/database';
import logger  from '@/core/logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DatabaseManagerOptions {
    clear?: boolean;
    migrate?: boolean;
    seed?: boolean;
    force?: boolean;
}

async function manageDatbase(options: DatabaseManagerOptions) {
    try {
        logger.info('Starting database management...');
        
        if (options.clear) {
            logger.info('Clearing database...');
            await clearDatabase();
        }

        if (options.migrate) {
            logger.info('Running migrations...');
            await runMigrations();
        }

        if (options.seed) {
            logger.info('Running seeders...');
            await runSeeders();
        }

        logger.info('Database management completed successfully!');
        
    } catch (error) {
        logger.error('Database management failed:');
        throw error;
    }
}

async function clearDatabase() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    
    // Get all table names
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
        await AppDataSource.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
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
    
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
}

async function runMigrations() {
    const { stdout, stderr } = await execAsync('npm run migrate');
    if (stderr) {
        logger.error('Migration stderr:');
    }
    logger.info('Migration stdout:');
}

async function runSeeders() {
    const { stdout, stderr } = await execAsync('npm run seed:run');
    if (stderr) {
        logger.error('Seeder stderr:');
    }
    logger.info('Seeder stdout:');
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: DatabaseManagerOptions = {
    clear: args.includes('--clear') || args.includes('-c'),
    migrate: args.includes('--migrate') || args.includes('-m'),
    seed: args.includes('--seed') || args.includes('-s'),
    force: args.includes('--force') || args.includes('-f'),
};

// Show help if no options provided
if (Object.values(options).every(v => !v)) {
    console.log(`
Database Management Script

Usage: npm run db:manage -- [options]

Options:
  --clear, -c     Clear all tables and types from database
  --migrate, -m   Run pending migrations
  --seed, -s      Run database seeders
  --force, -f     Force operation without confirmation

Examples:
  npm run db:manage -- --clear --migrate --seed
  npm run db:manage -- -c -m -s
  npm run db:manage -- --clear
    `);
    process.exit(0);
}

manageDatbase(options)
    .then(() => {
        logger.info('Database management completed');
        process.exit(0);
    })
    .catch((error) => {
        logger.error('Database management failed:');
        process.exit(1);
    });
