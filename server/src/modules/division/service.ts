import { AppDataSource } from '@/database';
import { Division } from '@/database/entities/division.entity';
import { User, UserRole } from '@/database/entities/user.entity';
import { BadRequest, NotFound, Conflict } from '@/core/errors';
import { Not, IsNull } from 'typeorm';

export interface AssignGNInput {
    divisionId: string;
    gnUserId: string;
}

export interface CreateDivisionInput {
    divisionId: string;
    divisionName: string;
    gnUserId?: string;
}

export interface UpdateDivisionInput {
    divisionName?: string;
    gnUserId?: string;
}

export class DivisionService {
    private divisionRepository = AppDataSource.getRepository(Division);
    private userRepository = AppDataSource.getRepository(User);

    /**
     * Create a new division
     */
    async createDivision(divisionData: CreateDivisionInput): Promise<Division> {
        // Check if division already exists
        const existingDivision = await this.divisionRepository.findOne({
            where: { divisionId: divisionData.divisionId }
        });

        if (existingDivision) {
            throw new Conflict('Division with this ID already exists');
        }

        // If GN user is provided, validate it
        if (divisionData.gnUserId) {
            await this.validateGNUser(divisionData.gnUserId);
        }

        const division = this.divisionRepository.create(divisionData);
        return await this.divisionRepository.save(division);
    }

    /**
     * Get all divisions
     */
    async getAllDivisions(): Promise<Division[]> {
        return await this.divisionRepository.find({
            relations: ['gramaNiladhari'],
            order: { divisionName: 'ASC' }
        });
    }

    /**
     * Get division by ID
     */
    async getDivisionById(divisionId: string): Promise<Division> {
        const division = await this.divisionRepository.findOne({
            where: { divisionId },
            relations: ['gramaNiladhari', 'citizens']
        });

        if (!division) {
            throw new NotFound('Division not found');
        }

        return division;
    }

    /**
     * Update division
     */
    async updateDivision(divisionId: string, updateData: UpdateDivisionInput): Promise<Division> {
        const division = await this.getDivisionById(divisionId);

        // If updating GN user, validate it
        if (updateData.gnUserId !== undefined) {
            if (updateData.gnUserId) {
                await this.validateGNUser(updateData.gnUserId);
            }
        }

        Object.assign(division, updateData);
        return await this.divisionRepository.save(division);
    }

    /**
     * Assign GN to division
     */
    async assignGNToDivision(assignData: AssignGNInput): Promise<Division> {
        const { divisionId, gnUserId } = assignData;

        // Validate division exists
        const division = await this.getDivisionById(divisionId);

        // Validate GN user
        await this.validateGNUser(gnUserId);

        // Check if GN is already assigned to another division
        const existingAssignment = await this.divisionRepository.findOne({
            where: { gnUserId }
        });

        if (existingAssignment && existingAssignment.divisionId !== divisionId) {
            throw new Conflict(`GN user is already assigned to division: ${existingAssignment.divisionName}`);
        }

        // Assign GN to division
        division.gnUserId = gnUserId;
        return await this.divisionRepository.save(division);
    }

    /**
     * Remove GN from division
     */
    async removeGNFromDivision(divisionId: string): Promise<Division> {
        const division = await this.getDivisionById(divisionId);
        
        division.gnUserId = null;
        return await this.divisionRepository.save(division);
    }

    /**
     * Get division by GN user ID
     */
    async getDivisionByGNUserId(gnUserId: string): Promise<Division | null> {
        return await this.divisionRepository.findOne({
            where: { gnUserId },
            relations: ['gramaNiladhari']
        });
    }

    /**
     * Get divisions without assigned GN
     */
    async getDivisionsWithoutGN(): Promise<Division[]> {
        return await this.divisionRepository.find({
            where: { gnUserId: null },
            order: { divisionName: 'ASC' }
        });
    }

    /**
     * Get available GN users (not assigned to any division)
     */
    async getAvailableGNUsers(): Promise<User[]> {
        // Get all GN users
        const allGNUsers = await this.userRepository.find({
            where: { role: UserRole.GN }
        });

        // Get divisions with assigned GNs
        const assignedDivisions = await this.divisionRepository.find({
            where: { gnUserId: Not(IsNull()) },
            select: ['gnUserId']
        });

        const assignedGNUserIds = assignedDivisions
            .map(div => div.gnUserId)
            .filter(id => id !== null) as string[];

        // Filter out assigned GN users
        return allGNUsers.filter(user => !assignedGNUserIds.includes(user.userId));
    }

    /**
     * Delete division
     */
    async deleteDivision(divisionId: string): Promise<void> {
        const division = await this.getDivisionById(divisionId);

        // Check if division has citizens
        const citizenCount = await this.divisionRepository
            .createQueryBuilder('division')
            .leftJoin('division.citizens', 'citizen')
            .where('division.divisionId = :divisionId', { divisionId })
            .getCount();

        if (citizenCount > 0) {
            throw new BadRequest('Cannot delete division with registered citizens');
        }

        await this.divisionRepository.remove(division);
    }

    // Helper methods
    private async validateGNUser(gnUserId: string): Promise<User> {
        const gnUser = await this.userRepository.findOne({
            where: { userId: gnUserId, role: UserRole.GN }
        });

        if (!gnUser) {
            throw new NotFound('GN user not found');
        }

        return gnUser;
    }
}
