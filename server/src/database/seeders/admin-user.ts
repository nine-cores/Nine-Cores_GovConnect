import { AppDataSource } from '@/database';
import { User, UserRole, UserAccountStatus } from '@/database/entities/user.entity';

export const createAdminUser = async () => {
    console.log('  🔍 Checking for existing admin user...');
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if admin user already exists
    const existingAdmin = await userRepository.findOne({
        where: { email: 'admin@example.com' }
    });

    if (existingAdmin) {
        console.log('  ℹ️  Admin user already exists');
        return;
    }

    console.log('  ➕ Creating new admin user...');
    // Create admin user
    const adminUser = userRepository.create({
        userId: 'ADM001',
        displayName: 'System Administrator',
        phoneNumber: '+94771234567',
        email: 'admin@example.com',
        passwordHash: 'Admin123!@#', // This will be hashed automatically
        role: UserRole.ADMIN,
        accountStatus: UserAccountStatus.ACTIVE
    });

    await userRepository.save(adminUser);
    console.log('  ✅ Admin user created successfully');
    console.log('  📧 Email: admin@example.com');
    console.log('  🔑 Password: Admin123!@#');
};
