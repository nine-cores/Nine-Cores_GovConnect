import { Request, Response, NextFunction } from 'express';
import { CertificateRequestService, CertificateRequestData } from '../../services/certificate-request.service';
import { CitizenManagementService } from '../../services/citizen-management.service';
import { dataResponse, messageResponse } from '../../core/responses';
import { BadRequest, NotFound } from '../../core/errors';
import { CertificateType, RequestStatus } from '../../database/entities';
import log from '../../core/logger';

export class CertificateRequestController {
  private certificateRequestService: CertificateRequestService;
  private citizenManagementService: CitizenManagementService;

  constructor() {
    this.certificateRequestService = new CertificateRequestService();
    this.citizenManagementService = new CitizenManagementService();
  }

  /**
   * Create a new certificate request
   * POST /api/v1/certificate-requests
   */
  createCertificateRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const citizenId = req.citizen?.nic;
      if (!citizenId) {
        throw new BadRequest('Citizen authentication required');
      }

      // Validate request body
      const { certificateType, purpose, personalDetails, documents, appointmentId } = req.body;

      if (!certificateType || !purpose || !documents) {
        throw new BadRequest('certificateType, purpose, and documents are required');
      }

      // Validate certificate type
      if (!Object.values(CertificateType).includes(certificateType)) {
        throw new BadRequest('Invalid certificate type');
      }

      // Validate documents - accept both array and object formats
      let documentIds: string[] = [];
      if (Array.isArray(documents)) {
        documentIds = documents;
      } else if (typeof documents === 'object' && documents !== null) {
        // Convert object to array of document IDs
        documentIds = Object.values(documents).filter(id => typeof id === 'string') as string[];
      }

      if (documentIds.length === 0) {
        throw new BadRequest('At least one document is required');
      }

      // Get citizen data to populate required personal details
      const citizen = req.citizen;
      if (!citizen) {
        throw new BadRequest('Citizen data not found');
      }

      // Get full citizen data from JSON file to access birthday and other details
      let citizenJsonData;
      try {
        const adapterResponse = await this.citizenManagementService.previewCitizenData(citizenId);
        citizenJsonData = adapterResponse.citizen;
      } catch (error) {
        // Fallback to database citizen data if JSON data not available
        citizenJsonData = null;
      }

      // Build complete personal details by merging citizen data with request data
      const completePersonalDetails = {
        fullName: citizenJsonData?.name?.english || citizenJsonData?.name?.sinhala || citizen.displayName || '',
        address: citizenJsonData?.address ? `${citizenJsonData.address.street}, ${citizenJsonData.address.city}, ${citizenJsonData.address.postal_code}` : citizen.address || '',
        dateOfBirth: citizenJsonData?.birthday || '', // Get birthday from JSON data
        ...personalDetails // Additional details from request override defaults
      };

      const requestData: CertificateRequestData = {
        certificateType,
        purpose,
        personalDetails: completePersonalDetails,
        documents: documentIds,
        appointmentId
      };

      const certificateRequest = await this.certificateRequestService.createCertificateRequest(citizenId, requestData);

      dataResponse(res, certificateRequest, 'Certificate request created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get certificate request by ID
   * GET /api/v1/certificate-requests/:id
   */
  getCertificateRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const citizenId = req.citizen?.nic;

      const certificateRequest = await this.certificateRequestService.getCertificateRequestById(id);

      // Ensure request belongs to the authenticated citizen (unless admin)
      if (citizenId && certificateRequest.citizen.nic !== citizenId) {
        throw new BadRequest('Access denied to this certificate request');
      }

      dataResponse(res, certificateRequest, 'Certificate request retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get certificate requests for authenticated citizen
   * GET /api/v1/certificate-requests
   */
  getMyCertificateRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const citizenId = req.citizen?.nic;
      if (!citizenId) {
        throw new BadRequest('Citizen authentication required');
      }

      const certificateRequests = await this.certificateRequestService.getCertificateRequestsByCitizen(citizenId);

      dataResponse(res, certificateRequests, 'Certificate requests retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all certificate requests (Admin only)
   * GET /api/v1/admin/certificate-requests
   */
  getAllCertificateRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, certificateType, page = '1', limit = '20' } = req.query;

      const options = {
        status: status as RequestStatus,
        certificateType: certificateType as CertificateType,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
      };

      // Validate query parameters
      if (status && !Object.values(RequestStatus).includes(status as RequestStatus)) {
        throw new BadRequest('Invalid status filter');
      }

      if (certificateType && !Object.values(CertificateType).includes(certificateType as CertificateType)) {
        throw new BadRequest('Invalid certificate type filter');
      }

      const result = await this.certificateRequestService.getAllCertificateRequests(options);

      const responseData = {
        requests: result.requests,
        pagination: {
          total: result.total,
          page: options.page,
          limit: options.limit,
          totalPages: Math.ceil(result.total / options.limit)
        }
      };

      dataResponse(res, responseData, 'Certificate requests retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update certificate request status (Admin only)
   * PUT /api/v1/admin/certificate-requests/:id/status
   */
  updateRequestStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        throw new BadRequest('Status is required');
      }

      if (!Object.values(RequestStatus).includes(status)) {
        throw new BadRequest('Invalid status value');
      }

      const updatedRequest = await this.certificateRequestService.updateRequestStatus(id, status, notes);

      dataResponse(res, updatedRequest, 'Certificate request status updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete certificate request
   * DELETE /api/v1/certificate-requests/:id
   */
  deleteCertificateRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const citizenId = req.citizen?.nic;

      await this.certificateRequestService.deleteCertificateRequest(id, citizenId);

      messageResponse(res, 'Certificate request deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get certificate types
   * GET /api/v1/certificate-types
   */
  getCertificateTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const certificateTypes = Object.values(CertificateType).map(type => ({
        value: type,
        label: type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
      }));

      dataResponse(res, certificateTypes, 'Certificate types retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get request statuses
   * GET /api/v1/certificate-request-statuses
   */
  getRequestStatuses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestStatuses = Object.values(RequestStatus).map(status => ({
        value: status,
        label: status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
      }));

      dataResponse(res, requestStatuses, 'Request statuses retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
