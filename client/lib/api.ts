// API service functions for government services backend
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";

// Helper function to create fetch options with proper CORS handling
const createFetchOptions = (options: RequestInit = {}): RequestInit => {
  return {
    ...options,
    mode: "cors",
    referrerPolicy: "strict-origin-when-cross-origin",
  };
};

// Store JWT token
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem("authToken", token);
};

export const getAuthToken = () => {
  if (!authToken) {
    authToken = localStorage.getItem("authToken");
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem("authToken");
  // Also clear user data when clearing auth token
  localStorage.removeItem("userData");
};

// API request helper
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${BASE_URL}${endpoint}`,
    createFetchOptions({
      ...options,
      headers,
    })
  );

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Authentication APIs
export const authAPI = {
  // Staff login (Admin, GN, MT)
  staffLogin: async (email: string, password: string) => {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return response;
  },

  // Citizen OTP request
  requestCitizenOTP: async (email: string) => {
    const response = await apiRequest("/citizen-auth/request-login-otp", {
      method: "POST",
      body: JSON.stringify({ email, type: "Login" }),
    });
    return response;
  },

  // Citizen OTP login
  citizenOTPLogin: async (email: string, otpCode: string) => {
    const response = await apiRequest("/citizen-auth/login/otp", {
      method: "POST",
      body: JSON.stringify({ email, otpCode, loginMethod: "otp" }),
    });
    return response;
  },

  // Logout (clear local storage)
  logout: async () => {
    // Note: Add server-side logout endpoint if needed
    clearAuthToken();
    return { success: true };
  },
};

// Citizen Management APIs
export const citizenAPI = {
  // Create citizen (GN only)
  createCitizen: async (citizenData: {
    nic: string;
    displayName: string;
    phoneNumber: string;
    email: string;
    address: string;
  }) => {
    const response = await apiRequest("/citizens", {
      method: "POST",
      body: JSON.stringify(citizenData),
    });
    return response;
  },

  // Get citizen by NIC
  getCitizen: async (nic: string) => {
    const response = await apiRequest(`/citizens/${nic}`);
    return response;
  },

  // Search citizens
  searchCitizens: async (query: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    queryParams.append('query', query);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await apiRequest(`/citizens/search?${queryParams.toString()}`);
    return response;
  },

  // Get citizens in GN's division
  getMyDivisionCitizens: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/citizens/my-division?${queryString}` : '/citizens/my-division';
    
    const response = await apiRequest(endpoint);
    return response;
  },

  // Verify citizen
  verifyCitizen: async (
    nic: string,
    verificationStatus: "Verified" | "Rejected"
  ) => {
    const response = await apiRequest(`/citizens/${nic}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ verificationStatus }),
    });
    return response;
  },

  // Update citizen
  updateCitizen: async (
    nic: string,
    updateData: {
      phoneNumber?: string;
      address?: string;
    }
  ) => {
    const response = await apiRequest(`/citizens/${nic}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
    return response;
  },
};

// Appointment Management APIs
export const appointmentAPI = {
  // Set GN availability (GN only)
  setAvailability: async (availabilityData: {
    availableDate: string;
    startTime: string;
    endTime: string;
    slotDuration: number;
  }) => {
    const response = await apiRequest("/gn-availability/", {
      method: "POST",
      body: JSON.stringify(availabilityData),
    });
    return response;
  },

  // Update availability status (GN only)
  updateAvailability: async (availabilityId: number, status: string) => {
    const response = await apiRequest(`/gn-availability/${availabilityId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return response;
  },

  // Get GN's availability
  getAvailability: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/gn-availability/my-availability?${queryString}` : '/gn-availability/my-availability';
    
    const response = await apiRequest(endpoint);
    return response;
  },

  getAvailabileDates: async () => {
    const response = await apiRequest("/gn-availability/my-availabile-dates");
    return response;
  },

  // Get available slots (Citizens)
  getAvailableSlots: async () => {
    const response = await apiRequest("/citizen-appointments/available-slots");
    return response;
  },

  // Make appointment (Citizens)
  makeAppointment: async (appointmentData: {
    gnServiceId: string;
    purpose: string;
    availabilityId: number;
  }) => {
    const response = await apiRequest("/citizen-appointments/appointments", {
      method: "POST",
      body: JSON.stringify(appointmentData),
    });
    return response;
  },

  removeAvalibility: async (date: number) => {
    const response = await apiRequest(`/gn-availability/my-availability/${date}`, {
      method: "DELETE",
    });
    return response;
  }
};

// Document API
export const documentAPI = {
  // Upload document (Citizens)
  uploadDocument: async (
    citizenNic: string,
    file: File,
    documentType?: string
  ) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("document", file);
    if (documentType) {
      formData.append("documentType", documentType);
    }

    const response = await fetch(
      `${BASE_URL}/documents/upload/${citizenNic}`,
      createFetchOptions({
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
    );

    if (!response.ok) {
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  },

  // Get citizen's documents
  getCitizenDocuments: async (citizenNic: string) => {
    const response = await apiRequest(`/documents/citizen/${citizenNic}`);
    return response;
  },

  // Download document
  downloadDocument: async (documentId: string) => {
    const token = getAuthToken();
    const response = await fetch(
      `${BASE_URL}/documents/download/${documentId}`,
      createFetchOptions({
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );

    if (!response.ok) {
      throw new Error(
        `Download failed: ${response.status} ${response.statusText}`
      );
    }

    return response.blob();
  },

  // Delete document
  deleteDocument: async (documentId: string) => {
    const response = await apiRequest(`/documents/${documentId}`, {
      method: "DELETE",
    });
    return response;
  },

  // Get file URL for direct access
  getFileUrl: (filename: string) => {
    return `${BASE_URL}/documents/files/${filename}`;
  },
};
