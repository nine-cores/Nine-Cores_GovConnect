import { createConnection, AppDataSource } from '@/database';
import { createAdminUser } from './admin-user';
import { createSampleData } from './sample-data';

async function seed() {
    try {
        console.log('🚀 Starting database seeding...');
        await createConnection();
        console.log('✅ Database connected successfully');
        
        console.log('👤 Creating admin user...');
        await createAdminUser();
        
        console.log('📊 Creating sample data...');
        await createSampleData();
        
        console.log('🎉 Seeding completed successfully!');
        await AppDataSource.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
        process.exit(1);
    }
}

seed();
