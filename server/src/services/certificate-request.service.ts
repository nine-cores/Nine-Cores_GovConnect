import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { AppDataSource } from '../database';
import { CertificateRequest, CertificateType, RequestStatus, Citizen, Document, GNAppointment } from '../database/entities';
import { BadRequest, NotFound, Conflict } from '../core/errors';

export interface CertificateRequestData {
  certificateType: CertificateType;
  purpose: string;
  personalDetails: {
    fullName?: string;
    address?: string;
    dateOfBirth?: string;
    contactNumber?: string;
    fatherName?: string;
    motherName?: string;
    occupation?: string;
    married?: string;
    sriLankan?: string;
    residencePeriod?: string;
    fatherAddress?: string;
    [key: string]: any;
  };
  documents: string[]; // Array of document IDs or object with document types
  appointmentId?: string;
}

export class CertificateRequestService {
  private certificateRequestRepository: Repository<CertificateRequest>;
  private citizenRepository: Repository<Citizen>;
  private gnAppointmentRepository: Repository<GNAppointment>;

  constructor() {
    this.certificateRequestRepository = AppDataSource.getRepository(CertificateRequest);
    this.citizenRepository = AppDataSource.getRepository(Citizen);
    this.gnAppointmentRepository = AppDataSource.getRepository(GNAppointment);
  }

  /**
   * Create a new certificate request
   */
  async createCertificateRequest(citizenId: string, requestData: CertificateRequestData): Promise<CertificateRequest> {
    try {
      // Validate citizen exists
      const citizen = await this.citizenRepository.findOne({
        where: { nic: citizenId }
      });

      if (!citizen) {
        throw new NotFound('Citizen not found');
      }

      // Convert documents array to object format if needed
      let documentsObj: any = {};
      if (Array.isArray(requestData.documents)) {
        // Convert array to object format - assuming they are document IDs
        requestData.documents.forEach((docId, index) => {
          if (index === 0) documentsObj.birthCertificate = docId;
          else if (index === 1) documentsObj.nic = docId;
          else documentsObj[`document_${index}`] = docId;
        });
      } else {
        documentsObj = requestData.documents;
      }

      // Validate appointment if provided
      let appointment: GNAppointment | undefined;
      if (requestData.appointmentId) {
        appointment = await this.gnAppointmentRepository.findOne({
          where: { 
            gnAppointmentId: parseInt(requestData.appointmentId),
            citizenNic: citizenId
          }
        });

        if (!appointment) {
          throw new BadRequest('Appointment not found or does not belong to the citizen');
        }
      }

      // Validate required personal details based on certificate type
      this.validatePersonalDetails(requestData.certificateType, requestData.personalDetails);

      // Create certificate request
      const certificateRequest = new CertificateRequest();
      certificateRequest.citizenNic = citizenId;
      certificateRequest.certificateType = requestData.certificateType;
      certificateRequest.purpose = requestData.purpose;
      certificateRequest.personalDetails = requestData.personalDetails;
      certificateRequest.documents = documentsObj;
      certificateRequest.status = RequestStatus.PENDING;
      
      if (appointment) {
        certificateRequest.appointmentId = appointment.gnAppointmentId.toString();
      }

      const savedRequest = await this.certificateRequestRepository.save(certificateRequest);

      // Return with relations loaded
      return await this.getCertificateRequestById(savedRequest.id);

    } catch (error) {
      if (error instanceof BadRequest || error instanceof NotFound) {
        throw error;
      }
      throw new Error(`Failed to create certificate request: ${error.message}`);
    }
  }

  /**
   * Get certificate request by ID
   */
  async getCertificateRequestById(requestId: string): Promise<CertificateRequest> {
    const certificateRequest = await this.certificateRequestRepository.findOne({
      where: { id: requestId },
      relations: ['citizen', 'appointment']
    });

    if (!certificateRequest) {
      throw new NotFound('Certificate request not found');
    }

    return certificateRequest;
  }

  /**
   * Get certificate requests for a citizen
   */
  async getCertificateRequestsByCitizen(citizenId: string): Promise<CertificateRequest[]> {
    return await this.certificateRequestRepository.find({
      where: { citizenNic: citizenId },
      relations: ['citizen', 'appointment'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get all certificate requests (for admin)
   */
  async getAllCertificateRequests(options?: {
    status?: RequestStatus;
    certificateType?: CertificateType;
    page?: number;
    limit?: number;
  }): Promise<{ requests: CertificateRequest[], total: number }> {
    const { status, certificateType, page = 1, limit = 20 } = options || {};

    const queryBuilder = this.certificateRequestRepository.createQueryBuilder('request')
      .leftJoinAndSelect('request.citizen', 'citizen')
      .leftJoinAndSelect('request.appointment', 'appointment');

    if (status) {
      queryBuilder.andWhere('request.status = :status', { status });
    }

    if (certificateType) {
      queryBuilder.andWhere('request.certificateType = :certificateType', { certificateType });
    }

    queryBuilder
      .orderBy('request.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [requests, total] = await queryBuilder.getManyAndCount();

    return { requests, total };
  }

  /**
   * Update certificate request status
   */
  async updateRequestStatus(requestId: string, status: RequestStatus, notes?: string): Promise<CertificateRequest> {
    const certificateRequest = await this.getCertificateRequestById(requestId);

    certificateRequest.status = status;
    if (notes) {
      certificateRequest.notes = notes;
    }

    // Set processedAt timestamp for completed requests
    if (status === RequestStatus.COMPLETED) {
      certificateRequest.processedAt = new Date();
    }

    await this.certificateRequestRepository.save(certificateRequest);

    return await this.getCertificateRequestById(requestId);
  }

  /**
   * Delete certificate request (only if pending)
   */
  async deleteCertificateRequest(requestId: string, citizenId?: string): Promise<void> {
    const certificateRequest = await this.getCertificateRequestById(requestId);

    // If citizenId provided, ensure request belongs to citizen
    if (citizenId && certificateRequest.citizen.nic !== citizenId) {
      throw new BadRequest('Certificate request does not belong to the citizen');
    }

    // Only allow deletion if request is pending
    if (certificateRequest.status !== RequestStatus.PENDING) {
      throw new Conflict('Cannot delete certificate request that is not pending');
    }

    await this.certificateRequestRepository.remove(certificateRequest);
  }

  /**
   * Generate unique request number
   */
  private async generateRequestNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Count existing requests for this month
    const count = await this.certificateRequestRepository
      .createQueryBuilder('request')
      .where('EXTRACT(YEAR FROM request.createdAt) = :year', { year })
      .andWhere('EXTRACT(MONTH FROM request.createdAt) = :month', { month: new Date().getMonth() + 1 })
      .getCount();

    const sequence = String(count + 1).padStart(4, '0');
    return `CCR${year}${month}${sequence}`;
  }

  /**
   * Validate personal details based on certificate type
   */
  private validatePersonalDetails(certificateType: CertificateType, personalDetails: any): void {
    const required = ['fullName', 'address', 'dateOfBirth'];

    // Additional requirements for character certificate
    if (certificateType === CertificateType.CHARACTER) {
      required.push('fatherName', 'motherName', 'occupation');
    }

    for (const field of required) {
      if (!personalDetails[field] || personalDetails[field].trim() === '') {
        throw new BadRequest(`${field} is required for ${certificateType} certificate`);
      }
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(personalDetails.dateOfBirth)) {
      throw new BadRequest('Date of birth must be in YYYY-MM-DD format');
    }

    // Validate contact number if provided
    if (personalDetails.contactNumber) {
      const phoneRegex = /^[\d+\-\s()]+$/;
      if (!phoneRegex.test(personalDetails.contactNumber)) {
        throw new BadRequest('Invalid contact number format');
      }
    }
  }
}
