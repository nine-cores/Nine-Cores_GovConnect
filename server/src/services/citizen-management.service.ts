import { AppDataSource } from '@/database';
import { Citizen, CitizenGender, CitizenVerificationStatus, CitizenAccountStatus } from '@/database/entities/citizen.entity';
import { Division } from '@/database/entities/division.entity';
import { BadRequest, NotFound, Conflict } from '@/core/errors';
import * as fs from 'fs';
import * as path from 'path';
import log from '@/core/logger';

// Interfaces for the adapter response
interface CitizenName {
    sinhala: string;
    english: string;
    tamil: string;
}

interface CitizenAddress {
    street: string;
    city: string;
    postal_code: string;
}

interface AdapterCitizenData {
    NIC: string;
    name: CitizenName;
    birthday: string;
    grama_sewa_division_code: string;
    district: string;
    gender: 'Male' | 'Female' | 'Other';
    address: CitizenAddress;
}

interface AdapterResponse {
    citizen: AdapterCitizenData;
}

// Input interface for GN officer
export interface CreateCitizenInput {
    nic: string;
    displayName: string;
    phoneNumber: string;
    email?: string;
    address: string;
}

// External data adapter interface
export interface CitizenDataAdapter {
    getCitizenDataByNIC(nic: string): Promise<AdapterResponse>;
}

// JSON file adapter implementation
class JsonFileCitizenDataAdapter implements CitizenDataAdapter {
    private citizensData: AdapterResponse[] = [];
    private dataLoaded = false;

    constructor() {
        this.loadCitizensFromJson();
    }

    private loadCitizensFromJson(): void {
        try {
            const jsonFilePath = path.join(process.cwd(), 'citizens.json');
            
            if (!fs.existsSync(jsonFilePath)) {
                log.warn('citizens.json file not found, falling back to mock data');
                return;
            }

            const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');
            this.citizensData = JSON.parse(jsonData);
            this.dataLoaded = true;
            
            log.info(`Loaded ${this.citizensData.length} citizens from citizens.json`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            log.error(`Failed to load citizens from JSON file: ${errorMessage}`);
            throw new Error('Failed to load citizens data from JSON file');
        }
    }

    async getCitizenDataByNIC(nic: string): Promise<AdapterResponse> {
        // Find citizen by NIC in loaded JSON data
        const citizenRecord = this.citizensData.find(record => 
            record.citizen.NIC === nic
        );

        if (!citizenRecord) {
            throw new NotFound(`Citizen with NIC ${nic} not found in data source`);
        }

        return citizenRecord;
    }

    // Method to get all citizens for bulk operations
    getAllCitizens(): AdapterResponse[] {
        return this.citizensData;
    }

    // Method to reload data from file
    reloadData(): void {
        this.dataLoaded = false;
        this.citizensData = [];
        this.loadCitizensFromJson();
    }
}

export class CitizenManagementService {
    private citizenRepository = AppDataSource.getRepository(Citizen);
    private divisionRepository = AppDataSource.getRepository(Division);
    private dataAdapter: CitizenDataAdapter;

    constructor(adapter?: CitizenDataAdapter) {
        this.dataAdapter = adapter || new JsonFileCitizenDataAdapter();
    }

    /**
     * Add a new citizen to the system
     * GN officer provides: NIC, displayName, phoneNumber, email, address
     * System fetches: gender, divisionId from external adapter
     */
    async addCitizen(input: CreateCitizenInput): Promise<Citizen> {
        // Validate NIC format
        this.validateNIC(input.nic);

        // Check if citizen already exists
        const existingCitizen = await this.citizenRepository.findOne({
            where: { nic: input.nic }
        });

        if (existingCitizen) {
            throw new Conflict(`Citizen with NIC ${input.nic} already exists`);
        }

        // Fetch external data using adapter
        let externalData: AdapterResponse;
        try {
            externalData = await this.dataAdapter.getCitizenDataByNIC(input.nic);
        } catch (error) {
            throw new BadRequest(`Failed to fetch citizen data from external source: ${error}`);
        }

        // Validate that division exists in our system
        const division = await this.divisionRepository.findOne({
            where: { divisionId: externalData.citizen.grama_sewa_division_code }
        });

        if (!division) {
            throw new BadRequest(`Division ${externalData.citizen.grama_sewa_division_code} not found in system`);
        }

        // Combine manual input with external data
        const fullAddress = this.combineAddress(input.address, externalData.citizen.address);

        // Create citizen entity
        const citizen = this.citizenRepository.create({
            nic: input.nic,
            displayName: input.displayName, // Use GN officer's input
            phoneNumber: input.phoneNumber,
            email: input.email,
            gender: externalData.citizen.gender as CitizenGender,
            address: fullAddress,
            divisionId: externalData.citizen.grama_sewa_division_code,
            verificationStatus: CitizenVerificationStatus.PENDING,
            accountStatus: CitizenAccountStatus.ACTIVE
        });

        // Save to database
        const savedCitizen = await this.citizenRepository.save(citizen);

        // Return citizen with division relation
        return await this.citizenRepository.findOne({
            where: { nic: savedCitizen.nic },
            relations: ['division']
        }) as Citizen;
    }

    /**
     * Bulk load all citizens from JSON file
     */
    async bulkLoadCitizensFromJson(): Promise<{
        loaded: number;
        skipped: number;
        errors: string[];
    }> {
        if (!(this.dataAdapter instanceof JsonFileCitizenDataAdapter)) {
            throw new BadRequest('Bulk load is only available when using JsonFileCitizenDataAdapter');
        }

        const allCitizens = this.dataAdapter.getAllCitizens();
        let loaded = 0;
        let skipped = 0;
        const errors: string[] = [];

        log.info(`Starting bulk load of ${allCitizens.length} citizens from JSON file`);

        for (const citizenRecord of allCitizens) {
            try {
                const citizenData = citizenRecord.citizen;
                
                // Check if citizen already exists
                const existing = await this.citizenRepository.findOne({
                    where: { nic: citizenData.NIC }
                });

                if (existing) {
                    log.info(`Citizen ${citizenData.NIC} already exists, skipping`);
                    skipped++;
                    continue;
                }

                // Validate that division exists in our system
                const division = await this.divisionRepository.findOne({
                    where: { divisionId: citizenData.grama_sewa_division_code }
                });

                if (!division) {
                    errors.push(`Division ${citizenData.grama_sewa_division_code} not found for citizen ${citizenData.NIC}`);
                    continue;
                }

                // Create full address
                const fullAddress = `${citizenData.address.street}, ${citizenData.address.city}, ${citizenData.address.postal_code}`;
                
                // Determine display name (prefer English, fallback to Sinhala, then Tamil)
                let displayName = citizenData.name.english;
                if (!displayName && citizenData.name.sinhala) {
                    displayName = citizenData.name.sinhala;
                } else if (!displayName && citizenData.name.tamil) {
                    displayName = citizenData.name.tamil;
                }

                if (!displayName) {
                    displayName = `Citizen ${citizenData.NIC}`;
                }

                // Create citizen entity
                const citizen = this.citizenRepository.create({
                    nic: citizenData.NIC,
                    displayName: displayName,
                    phoneNumber: null, // Not available in JSON
                    email: null, // Not available in JSON
                    gender: citizenData.gender as CitizenGender,
                    address: fullAddress,
                    divisionId: citizenData.grama_sewa_division_code,
                    verificationStatus: CitizenVerificationStatus.PENDING,
                    accountStatus: CitizenAccountStatus.ACTIVE
                });

                await this.citizenRepository.save(citizen);
                loaded++;

                log.info(`Loaded citizen: ${citizenData.NIC} - ${displayName}`);

            } catch (error) {
                const errorMsg = `Failed to load citizen ${citizenRecord.citizen.NIC}: ${error}`;
                errors.push(errorMsg);
                log.error(errorMsg);
            }
        }

        log.info(`Bulk load completed: ${loaded} loaded, ${skipped} skipped, ${errors.length} errors`);

        return {
            loaded,
            skipped,
            errors
        };
    }

    /**
     * Get citizen by NIC
     */
    async getCitizenByNIC(nic: string): Promise<Citizen> {
        const citizen = await this.citizenRepository.findOne({
            where: { nic },
            relations: ['division']
        });

        if (!citizen) {
            throw new NotFound(`Citizen with NIC ${nic} not found`);
        }

        return citizen;
    }

    /**
     * Update citizen information
     */
    async updateCitizen(nic: string, updates: Partial<CreateCitizenInput>): Promise<Citizen> {
        const citizen = await this.getCitizenByNIC(nic);

        // Update allowed fields
        if (updates.displayName) citizen.displayName = updates.displayName;
        if (updates.phoneNumber) citizen.phoneNumber = updates.phoneNumber;
        if (updates.email !== undefined) citizen.email = updates.email;
        if (updates.address) citizen.address = updates.address;

        await this.citizenRepository.save(citizen);

        return await this.getCitizenByNIC(nic);
    }

    /**
     * Verify citizen (update verification status)
     */
    async verifyCitizen(nic: string, verificationStatus: CitizenVerificationStatus): Promise<Citizen> {
        const citizen = await this.getCitizenByNIC(nic);

        citizen.verificationStatus = verificationStatus;
        citizen.verificationDate = new Date();

        await this.citizenRepository.save(citizen);

        return await this.getCitizenByNIC(nic);
    }

    /**
     * Get citizens by division (for GN officers)
     */
    async getCitizensByDivision(divisionId: string, page: number = 1, limit: number = 20): Promise<{
        citizens: Citizen[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const [citizens, total] = await this.citizenRepository.findAndCount({
            where: { divisionId },
            relations: ['division'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' }
        });

        return {
            citizens,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Search citizens by name or NIC
     */
    async searchCitizens(query: string, page: number = 1, limit: number = 20): Promise<{
        citizens: Citizen[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const queryBuilder = this.citizenRepository
            .createQueryBuilder('citizen')
            .leftJoinAndSelect('citizen.division', 'division')
            .where('citizen.nic ILIKE :query', { query: `%${query}%` })
            .orWhere('citizen.displayName ILIKE :query', { query: `%${query}%` })
            .orderBy('citizen.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [citizens, total] = await queryBuilder.getManyAndCount();

        return {
            citizens,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Get external citizen data preview (before adding to system)
     */
    async previewCitizenData(nic: string): Promise<AdapterResponse> {
        this.validateNIC(nic);
        
        try {
            return await this.dataAdapter.getCitizenDataByNIC(nic);
        } catch (error) {
            throw new BadRequest(`Failed to fetch citizen data preview: ${error}`);
        }
    }

    // Private helper methods
    private validateNIC(nic: string): void {
        // Validate NIC format (10 or 12 digits)
        const nicPattern = /^(\d{9}[vVxX]|\d{12})$/;
        
        if (!nicPattern.test(nic)) {
            throw new BadRequest('Invalid NIC format. Must be 10 digits ending with V/X or 12 digits');
        }
    }

    private combineAddress(manualAddress: string, externalAddress: CitizenAddress): string {
        // Combine manual address with external address data
        return `${manualAddress}, ${externalAddress.city}, ${externalAddress.postal_code}`;
    }
}