import { AppDataSource } from '@/database';
import { 
    Division, 
    ServiceUnit, 
    GNService, 
    MTService, 
    User, 
    UserRole, 
    UserAccountStatus 
} from '@/database/entities';

export const createSampleData = async () => {
    console.log('  🏢 Creating divisions...');

    // Create Divisions
    const divisionRepository = AppDataSource.getRepository(Division);
    const divisions = [
        { divisionId: 'DIV001', divisionName: 'Colombo Central' },
        { divisionId: 'DIV002', divisionName: 'Kandy North' },
        { divisionId: 'DIV003', divisionName: 'Galle South' },
        { divisionId: 'DIV004', divisionName: 'Jaffna East' },
        { divisionId: 'DIV005', divisionName: 'Kurunegala West' }
    ];

    for (const div of divisions) {
        const existing = await divisionRepository.findOne({ where: { divisionId: div.divisionId } });
        if (!existing) {
            await divisionRepository.save(divisionRepository.create(div));
            console.log(`    ✅ Created division: ${div.divisionName}`);
        } else {
            console.log(`    ℹ️  Division already exists: ${div.divisionName}`);
        }
    }

    console.log('  🏬 Creating service units...');
    // Create Service Units
    const serviceUnitRepository = AppDataSource.getRepository(ServiceUnit);
    const serviceUnits = [
        { serviceUnitId: 'SU001', serviceUnitName: 'Grama Niladhari Office' },
        { serviceUnitId: 'SU002', serviceUnitName: 'Motor Traffic Service Unit' },
        { serviceUnitId: 'SU003', serviceUnitName: 'Registrar of Persons Service Unit' },
        { serviceUnitId: 'SU004', serviceUnitName: 'Immigration Service Unit' }
    ];

    for (const unit of serviceUnits) {
        const existing = await serviceUnitRepository.findOne({ where: { serviceUnitId: unit.serviceUnitId } });
        if (!existing) {
            await serviceUnitRepository.save(serviceUnitRepository.create(unit));
            console.log(`    ✅ Created service unit: ${unit.serviceUnitName}`);
        } else {
            console.log(`    ℹ️  Service unit already exists: ${unit.serviceUnitName}`);
        }
    }

    console.log('  🛂 Creating GN services...');
    // Create GN Services
    const gnServiceRepository = AppDataSource.getRepository(GNService);
    const gnServices = [
        { 
            gnServiceId: 'GNS001', 
            serviceName: 'Identity Verification', 
            description: 'Verify citizen identity for official documents',
            isEnabled: true,
            serviceUnitId: 'SU001'
        },
        { 
            gnServiceId: 'GNS002', 
            serviceName: 'Address Verification', 
            description: 'Verify citizen residential address',
            isEnabled: true,
            serviceUnitId: 'SU001'
        },
        { 
            gnServiceId: 'GNS003', 
            serviceName: 'Character Certificate', 
            description: 'Issue character certificate for employment',
            isEnabled: true,
            serviceUnitId: 'SU001'
        },
        { 
            gnServiceId: 'GNS004', 
            serviceName: 'Income Certificate', 
            description: 'Issue income certificate for various purposes',
            isEnabled: false,
            serviceUnitId: 'SU001'
        }
    ];

    for (const service of gnServices) {
        const existing = await gnServiceRepository.findOne({ where: { gnServiceId: service.gnServiceId } });
        if (!existing) {
            await gnServiceRepository.save(gnServiceRepository.create(service));
            console.log(`    ✅ Created GN service: ${service.serviceName}`);
        } else {
            console.log(`    ℹ️  GN service already exists: ${service.serviceName}`);
        }
    }

    console.log('  🚗 Creating MT services...');
    // Create MT Services
    const mtServiceRepository = AppDataSource.getRepository(MTService);
    const mtServices = [
        { 
            mtServiceId: 'MTS001', 
            serviceName: 'Driving License Application', 
            description: 'Apply for new driving license',
            isEnabled: true,
            serviceUnitId: 'SU002'
        },
        { 
            mtServiceId: 'MTS002', 
            serviceName: 'License Renewal', 
            description: 'Renew existing driving license',
            isEnabled: true,
            serviceUnitId: 'SU002'
        },
        { 
            mtServiceId: 'MTS003', 
            serviceName: 'Vehicle Registration', 
            description: 'Register new vehicle',
            isEnabled: true,
            serviceUnitId: 'SU002'
        },
        { 
            mtServiceId: 'MTS004', 
            serviceName: 'Revenue License', 
            description: 'Apply for vehicle revenue license',
            isEnabled: false,
            serviceUnitId: 'SU002'
        }
    ];

    for (const service of mtServices) {
        const existing = await mtServiceRepository.findOne({ where: { mtServiceId: service.mtServiceId } });
        if (!existing) {
            await mtServiceRepository.save(mtServiceRepository.create(service));
            console.log(`    ✅ Created MT service: ${service.serviceName}`);
        } else {
            console.log(`    ℹ️  MT service already exists: ${service.serviceName}`);
        }
    }

    console.log('  👥 Creating sample users...');
    // Create Sample Users
    const userRepository = AppDataSource.getRepository(User);
    const users = [
        {
            userId: 'GN0001',
            displayName: 'Rajesh Kumar',
            phoneNumber: '+94771234567',
            email: 'rajesh.gn@gov.lk',
            passwordHash: 'GN123!@#',
            role: UserRole.GN,
            accountStatus: UserAccountStatus.ACTIVE
        },
        {
            userId: 'GN0002',
            displayName: 'Priya Fernando',
            phoneNumber: '+94772345678',
            email: 'priya.gn@gov.lk',
            passwordHash: 'GN123!@#',
            role: UserRole.GN,
            accountStatus: UserAccountStatus.ACTIVE
        },
        {
            userId: 'GN0003',
            displayName: 'Nuwan Jayasinghe',
            phoneNumber: '+94775555555',
            email: 'nuwan.gn@gov.lk',
            passwordHash: 'GN123!@#',
            role: UserRole.GN,
            accountStatus: UserAccountStatus.ACTIVE
        },
        {
            userId: 'MT0001',
            displayName: 'Sunil Perera',
            phoneNumber: '+94773456789',
            email: 'sunil.mt@gov.lk',
            passwordHash: 'MT123!@#',
            role: UserRole.STAFF_MT,
            serviceUnitId: 'SU002',
            accountStatus: UserAccountStatus.ACTIVE
        },
        {
            userId: 'MT0002',
            displayName: 'Kamala Silva',
            phoneNumber: '+94774567890',
            email: 'kamala.mt@gov.lk',
            passwordHash: 'MT123!@#',
            role: UserRole.STAFF_MT,
            serviceUnitId: 'SU002',
            accountStatus: UserAccountStatus.ACTIVE
        }
    ];

    for (const user of users) {
        const existing = await userRepository.findOne({ where: { userId: user.userId } });
        if (!existing) {
            await userRepository.save(userRepository.create(user));
            console.log(`    ✅ Created user: ${user.displayName} (${user.role})`);
        } else {
            console.log(`    ℹ️  User already exists: ${user.displayName}`);
        }
    }

    console.log('  🔗 Assigning GNs to divisions...');
    // Assign GNs to divisions
    const gnAssignments = [
        { divisionId: 'DIV001', gnUserId: 'GN0001' },
        { divisionId: 'DIV002', gnUserId: 'GN0002' },
        { divisionId: 'DIV003', gnUserId: 'GN0003' }
    ];

    for (const assignment of gnAssignments) {
        const division = await divisionRepository.findOne({ 
            where: { divisionId: assignment.divisionId } 
        });
        
        if (division && !division.gnUserId) {
            division.gnUserId = assignment.gnUserId;
            await divisionRepository.save(division);
            console.log(`    ✅ Assigned GN ${assignment.gnUserId} to division ${assignment.divisionId}`);
        } else if (division?.gnUserId) {
            console.log(`    ℹ️  Division ${assignment.divisionId} already has assigned GN: ${division.gnUserId}`);
        }
    }

    console.log('  🎯 Sample data creation completed!');
};
