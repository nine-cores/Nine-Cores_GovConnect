import { AppDataSource } from '@/database';
import logger  from '@/core/logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface MigrationOptions {
    run?: boolean;
    revert?: boolean;
    show?: boolean;
    create?: string;
    generate?: string;
    all?: boolean;
    count?: number;
}

async function manageMigrations(options: MigrationOptions) {
    try {
        logger.info('Starting migration management...');

        if (options.show) {
            await showMigrations();
        }

        if (options.run || options.all) {
            await runMigrations(options.all);
        }

        if (options.revert) {
            await revertMigration(options.count || 1);
        }

        if (options.create) {
            await createMigration(options.create);
        }

        if (options.generate) {
            await generateMigration(options.generate);
        }

        logger.info('Migration management completed successfully!');
        
    } catch (error) {
        logger.error('Migration management failed:');
        throw error;
    }
}

async function showMigrations() {
    logger.info('Showing migration status...');
    try {
        const { stdout, stderr } = await execAsync('npm run migrate:show');
        if (stderr) {
            logger.error('Migration show stderr:');
        }
        console.log(stdout);
    } catch (error) {
        logger.error('Error showing migrations:');
    }
}

async function runMigrations(all: boolean = true) {
    logger.info(all ? 'Running all pending migrations...' : 'Running migrations...');
    try {
        const { stdout, stderr } = await execAsync('npm run migrate:all');
        if (stderr) {
            logger.error('Migration stderr:');
        }
        console.log(stdout);
    } catch (error) {
        logger.error('Error running migrations:');
        throw error;
    }
}

async function revertMigration(count: number = 1) {
    logger.info(`Reverting last ${count} migration(s)...`);
    try {
        for (let i = 0; i < count; i++) {
            const { stdout, stderr } = await execAsync('npm run migrate:revert');
            if (stderr) {
                logger.error(`Migration revert stderr (${i + 1}):`);
            }
            console.log(`Revert ${i + 1}:`, stdout);
        }
    } catch (error) {
        logger.error('Error reverting migration:');
        throw error;
    }
}

async function createMigration(name: string) {
    logger.info(`Creating new migration: ${name}...`);
    try {
        const { stdout, stderr } = await execAsync(`npm run migrate:create ./src/database/migrations/${name}`);
        if (stderr) {
            logger.error('Migration create stderr:');
        }
        console.log(stdout);
    } catch (error) {
        logger.error('Error creating migration:');
        throw error;
    }
}

async function generateMigration(name: string) {
    logger.info(`Generating migration: ${name}...`);
    try {
        const { stdout, stderr } = await execAsync(`npm run typeorm migration:generate -- -d ./src/database/index.ts ./src/database/migrations/${name}`);
        if (stderr) {
            logger.error('Migration generate stderr:');
        }
        console.log(stdout);
    } catch (error) {
        logger.error('Error generating migration:');
        throw error;
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: MigrationOptions = {
    run: args.includes('--run') || args.includes('-r'),
    all: args.includes('--all') || args.includes('-a'),
    revert: args.includes('--revert') || args.includes('--rollback'),
    show: args.includes('--show') || args.includes('-s'),
    create: args.find(arg => arg.startsWith('--create='))?.split('=')[1] || 
            (args.includes('--create') ? args[args.indexOf('--create') + 1] : undefined),
    generate: args.find(arg => arg.startsWith('--generate='))?.split('=')[1] || 
             (args.includes('--generate') ? args[args.indexOf('--generate') + 1] : undefined),
    count: parseInt(args.find(arg => arg.startsWith('--count='))?.split('=')[1] || '1'),
};

// Show help if no options provided
if (Object.values(options).every(v => !v)) {
    console.log(`
Migration Management Script

Usage: npm run migrate:manage -- [options]

Options:
  --run, -r              Run pending migrations
  --all, -a              Run all pending migrations (default for --run)
  --revert, --rollback   Revert last migration
  --show, -s             Show migration status
  --create <name>        Create new empty migration
  --generate <name>      Generate migration from entity changes
  --count=<number>       Number of migrations to revert (default: 1)

Examples:
  npm run migrate:manage -- --show
  npm run migrate:manage -- --run
  npm run migrate:manage -- --all
  npm run migrate:manage -- --revert
  npm run migrate:manage -- --revert --count=2
  npm run migrate:manage -- --create AddUserIndex
  npm run migrate:manage -- --generate UpdateUserSchema
    `);
    process.exit(0);
}

manageMigrations(options)
    .then(() => {
        logger.info('Migration management completed');
        process.exit(0);
    })
    .catch((error) => {
        logger.error('Migration management failed:');
        process.exit(1);
    });
