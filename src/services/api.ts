// ItSelfCare API Service
// Updated to match backend structure

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Therapist {
  theraphistId: string;
  userId: string;
  name: string;
  email: string;
  specialties: string[];
  languages: string[];
  hourlyRate: number;
  bio: string;
  geoLat: number;
  geoLng: number;
  distance?: number;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TherapistCreate {
  userId: string;
  name: string;
  email: string;
  specialties: string[];
  languages: string[];
  hourlyRate: number;
  bio: string;
  geoLat: number;
  geoLng: number;
}

export interface TherapistUpdate {
  name?: string;
  bio?: string;
  specialties?: string[];
  languages?: string[];
  hourlyRate?: number;
  geoLat?: number;
  geoLng?: number;
}

export interface Patient {
  patientId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientCreate {
  userId: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

export interface PatientUpdate {
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface Appointment {
  appointmentId: string;
  appointmentDate: string;
  theraphistId: string;
  patientId: string;
  patientName?: string;
  therapistName?: string;
  startTime: string;
  endTime: string;
  type: "video" | "home" | "clinic";
  status: "requested" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingRequest {
  therapistId: string;
  patientId: string;
  startTime: string;
  endTime: string;
  type: "video" | "home" | "clinic";
  notes?: string;
  referralCode?: string;
  appointmentCost?: number;
}

export interface Review {
  reviewId: string;
  therapistId: string;
  patientId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewCreate {
  therapistId: string;
  patientId: string;
  rating: number;
  comment: string;
}

export interface ReferralValidation {
  valid: boolean;
  referrerPatientId: string;
  referrerName: string;
  completedReferrals: number;
  discountPercentage: number;
  maxDiscount: number;
  referralCode: string;
}

export interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalCreditsEarned: number;
  currentRehabXCredits: number;
  totalDiscountsGiven: number;
  referrals: Array<{
    referralId: string;
    referredPatientId: string;
    referredPatientName: string;
    status: "pending" | "completed" | "expired";
    discountGiven: number;
    creditsEarned: number;
    createdAt: string;
    completedAt?: string;
    appointmentId: string;
  }>;
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  rehabXCredits: number;
  totalDiscountsGiven: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Request failed" }));
    throw new Error(
      error.detail || `HTTP ${response.status}: ${response.statusText}`
    );
  }
  return response.json();
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthCheck = async (): Promise<{
  status: string;
  timestamp: string;
}> => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(response);
};

// ============================================================================
// THERAPIST API
// ============================================================================

export const therapistAPI = {
  /**
   * Register a new therapist (Public)
   */
  register: async (
    data: TherapistCreate
  ): Promise<{ theraphistId: string }> => {
    const response = await fetch(`${API_BASE_URL}/therapists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Search for therapists near a location (Public)
   */
  searchNearby: async (params: {
    lat: number;
    lng: number;
    radius?: number;
    specialties?: string[];
  }): Promise<Therapist[]> => {
    const queryParams = new URLSearchParams({
      lat: params.lat.toString(),
      lng: params.lng.toString(),
    });

    if (params.radius) {
      queryParams.append("radius", params.radius.toString());
    }

    if (params.specialties && params.specialties.length > 0) {
      queryParams.append("specialties", params.specialties.join(","));
    }

    const response = await fetch(
      `${API_BASE_URL}/therapists/nearby/search?${queryParams.toString()}`
    );
    return handleResponse(response);
  },

  /**
   * Get top-rated therapists (Public)
   */
  getTopRated: async (limit: number = 10): Promise<Therapist[]> => {
    const response = await fetch(
      `${API_BASE_URL}/therapists/top/rated?limit=${limit}`
    );
    return handleResponse(response);
  },

  /**
   * Get therapist by ID (Requires therapist JWT)
   */
  getById: async (therapistId: string): Promise<Therapist> => {
    const response = await fetch(`${API_BASE_URL}/therapists/${therapistId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  /**
   * Update therapist profile (Requires therapist JWT)
   */
  update: async (
    therapistId: string,
    data: TherapistUpdate
  ): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/therapists/${therapistId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// ============================================================================
// PATIENT API
// ============================================================================

export const patientAPI = {
  /**
   * Register a new patient (Public)
   */
  register: async (data: PatientCreate): Promise<{ patientId: string }> => {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Get patient by ID (Requires patient JWT)
   */
  getById: async (patientId: string): Promise<Patient> => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  /**
   * Update patient profile (Requires patient JWT)
   */
  update: async (
    patientId: string,
    data: PatientUpdate
  ): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// ============================================================================
// APPOINTMENT API
// ============================================================================

export const appointmentAPI = {
  /**
   * Create a new appointment
   */
  create: async (
    data: BookingRequest
  ): Promise<{ appointmentId: string; status: string }> => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Get appointment by ID
   */
  getById: async (appointmentId: string): Promise<Appointment> => {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}`,
      {
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },

  /**
   * Get all appointments for a patient
   */
  getByPatient: async (patientId: string): Promise<Appointment[]> => {
    const response = await fetch(
      `${API_BASE_URL}/appointments/patient/${patientId}`,
      {
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },

  /**
   * Get all appointments for a therapist
   */
  getByTherapist: async (therapistId: string): Promise<Appointment[]> => {
    const response = await fetch(
      `${API_BASE_URL}/appointments/therapist/${therapistId}`,
      {
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },

  /**
   * Update appointment status
   */
  updateStatus: async (
    appointmentId: string,
    status: "requested" | "confirmed" | "cancelled" | "completed"
  ): Promise<{ message: string }> => {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status }),
      }
    );
    return handleResponse(response);
  },

  /**
   * Delete/cancel an appointment
   */
  delete: async (appointmentId: string): Promise<{ message: string }> => {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}`,
      {
        method: "DELETE",
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },
};

// ============================================================================
// REVIEW API
// ============================================================================

export const reviewAPI = {
  /**
   * Create a review for a therapist (Public)
   */
  create: async (data: ReviewCreate): Promise<{ reviewId: string }> => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Get all reviews for a therapist (Public)
   */
  getByTherapist: async (therapistId: string): Promise<Review[]> => {
    const response = await fetch(
      `${API_BASE_URL}/reviews/therapist/${therapistId}`
    );
    return handleResponse(response);
  },
};

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export const authHelpers = {
  /**
   * Set authentication token
   */
  setToken: (token: string): void => {
    localStorage.setItem("token", token);
  },

  /**
   * Get current token
   */
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  /**
   * Remove authentication token
   */
  removeToken: (): void => {
    localStorage.removeItem("token");
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },

  /**
   * Parse user type from mock token
   */
  getUserType: (): "patient" | "therapist" | null => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    if (token.startsWith("mock_patient_")) return "patient";
    if (token.startsWith("mock_therapist_")) return "therapist";

    // For real JWT tokens, you'd decode and check claims
    return null;
  },

  /**
   * Get user ID from token (for mock tokens)
   */
  getUserId: (): string | null => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    // For mock tokens, extract the suffix
    const match = token.match(/mock_(patient|therapist)_(.+)/);
    return match ? match[2] : null;
  },
};

// ============================================================================
// REFERRAL API
// ============================================================================

export const referralAPI = {
  /**
   * Generate or get referral code for a patient
   */
  generateCode: async (
    patientId: string
  ): Promise<{
    referralCode: string;
    patientId: string;
    expiresAt: string;
  }> => {
    const response = await fetch(`${API_BASE_URL}/referrals/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ patientId }),
    });
    return handleResponse(response);
  },

  /**
   * Validate referral code and get discount info
   */
  validate: async (
    referralCode: string,
    patientId: string
  ): Promise<ReferralValidation> => {
    const response = await fetch(`${API_BASE_URL}/referrals/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ referralCode, patientId }),
    });
    return handleResponse(response);
  },

  /**
   * Get all referrals for a patient
   */
  getByPatient: async (patientId: string): Promise<ReferralData> => {
    const response = await fetch(
      `${API_BASE_URL}/referrals/patient/${patientId}`,
      {
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },

  /**
   * Get referral stats for dashboard
   */
  getStats: async (patientId: string): Promise<ReferralStats> => {
    const response = await fetch(
      `${API_BASE_URL}/referrals/patient/${patientId}/stats`,
      {
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },

  /**
   * Calculate discount preview
   */
  calculateDiscount: async (
    appointmentCost: number,
    discountPercentage: number
  ): Promise<any> => {
    const response = await fetch(
      `${API_BASE_URL}/referrals/calculate-discount?appointment_cost=${appointmentCost}&discount_percentage=${discountPercentage}`,
      {
        method: "POST",
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },
};

// ============================================================================
// MESSAGING API
// ============================================================================

export interface MessageData {
  senderId: string;
  senderType: "patient" | "therapist";
  receiverId: string;
  receiverType: "patient" | "therapist";
  content: string;
  conversationId?: string;
}

export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderType: string;
  receiverId: string;
  receiverType: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationData {
  conversationId: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export const messagingAPI = {
  /**
   * Send a message
   */
  send: async (data: MessageData): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/messages/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Get all conversations for a user
   */
  getConversations: async (
    userId: string,
    userType: "patient" | "therapist"
  ): Promise<{ conversations: ConversationData[]; totalCount: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/messages/conversations/${userId}/${userType}`,
      {
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },

  /**
   * Get messages in a conversation
   */
  getMessages: async (
    conversationId: string,
    limit: number = 50
  ): Promise<{
    messages: Message[];
    conversationId: string;
    totalCount: number;
  }> => {
    const response = await fetch(
      `${API_BASE_URL}/messages/conversation/${conversationId}?limit=${limit}`,
      {
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (
    conversationId: string,
    userId: string,
    userType: "patient" | "therapist"
  ): Promise<{ success: boolean; markedCount: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/messages/conversation/${conversationId}/read?user_id=${userId}&user_type=${userType}`,
      {
        method: "POST",
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (
    userId: string,
    userType: "patient" | "therapist"
  ): Promise<{ unreadCount: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/messages/unread/${userId}/${userType}`,
      {
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },

  /**
   * Create or get conversation
   */
  createConversation: async (
    patientId: string,
    therapistId: string,
    patientName: string,
    therapistName: string
  ): Promise<ConversationData> => {
    const response = await fetch(
      `${API_BASE_URL}/messages/conversation/create?patient_id=${patientId}&therapist_id=${therapistId}&patient_name=${encodeURIComponent(
        patientName
      )}&therapist_name=${encodeURIComponent(therapistName)}`,
      {
        method: "POST",
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },

  /**
   * Delete conversation
   */
  deleteConversation: async (
    conversationId: string
  ): Promise<{ success: boolean; deletedMessages: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/messages/conversation/${conversationId}`,
      {
        method: "DELETE",
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },
};

// ============================================================================
// EXPORTED API OBJECT (Backward Compatibility)
// ============================================================================

export default {
  health: healthCheck,
  therapist: therapistAPI,
  patient: patientAPI,
  appointment: appointmentAPI,
  review: reviewAPI,
  referral: referralAPI,
  messaging: messagingAPI,
  auth: authHelpers,
};
