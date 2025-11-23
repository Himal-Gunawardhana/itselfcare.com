// src/services/api.ts
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Types
export interface Therapist {
  theraphistId: string;
  name: string;
  email: string;
  specialties: string[];
  languages: string[];
  hourlyRate: number;
  geoLat: number;
  geoLng: number;
  averageRating: number;
  totalReviews: number;
  bio: string;
  distance?: number;
  reviewCount?: number;
}

export interface Patient {
  patientId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: Record<string, any>;
}

export interface Appointment {
  appointmentId: string;
  appointmentDate: string;
  theraphistId: string;
  patientId: string;
  type: "video" | "home" | "clinic";
  scheduledStart: string;
  scheduledEnd: string;
  status: "requested" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  price: string;
  location?: Record<string, any>;
  notes?: string;
  meetingInfo?: any;
}

export interface Review {
  reviewId: string;
  theraphistId: string;
  patientId: string;
  appointmentId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BookingRequest {
  therapistId: string;
  patientId: string;
  startTime: string;
  endTime: string;
  type: string;
  notes?: string;
}

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

// Helper for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// ========== THERAPIST API ==========

export const therapistAPI = {
  getTopRated: async (limit = 10): Promise<Therapist[]> => {
    return apiRequest(`/therapists/top/rated?limit=${limit}`);
  },

  getById: async (id: string): Promise<Therapist> => {
    return apiRequest(`/therapists/${id}`);
  },

  searchNearby: async (
    lat: number,
    lng: number,
    radiusKm = 50,
    specialties?: string[]
  ): Promise<Therapist[]> => {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radiusKm.toString(),
    });
    if (specialties && specialties.length > 0) {
      params.append("specialties", specialties.join(","));
    }
    return apiRequest(`/therapists/nearby/search?${params}`);
  },

  create: async (data: {
    userId: string;
    name: string;
    email: string;
    specialties: string[];
    languages?: string[];
    geoLat: number;
    geoLng: number;
    hourlyRate: number;
    bio?: string;
    certifications?: string[];
  }): Promise<{ theraphistId: string }> => {
    return apiRequest("/therapists", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: Partial<Omit<Therapist, "theraphistId">>
  ): Promise<Therapist> => {
    return apiRequest(`/therapists/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// ========== PATIENT API ==========

export const patientAPI = {
  create: async (data: {
    userId: string;
    name: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    address?: Record<string, any>;
  }): Promise<{ patientId: string }> => {
    return apiRequest("/patients", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getById: async (id: string): Promise<Patient> => {
    return apiRequest(`/patients/${id}`);
  },
};

// ========== APPOINTMENT API ==========

export const appointmentAPI = {
  create: async (
    data: BookingRequest
  ): Promise<{ appointmentId: string; status: string }> => {
    return apiRequest("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getById: async (id: string): Promise<Appointment> => {
    return apiRequest(`/appointments/${id}`);
  },

  update: async (
    id: string,
    data: {
      status?: string;
      paymentStatus?: string;
      meetingInfo?: any;
      notes?: string;
    }
  ): Promise<Appointment> => {
    return apiRequest(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getPatientAppointments: async (patientId: string): Promise<Appointment[]> => {
    return apiRequest(`/appointments/patient/${patientId}`);
  },

  getTherapistAppointments: async (
    therapistId: string
  ): Promise<Appointment[]> => {
    return apiRequest(`/appointments/therapist/${therapistId}`);
  },
};

// ========== REVIEW API ==========

export const reviewAPI = {
  create: async (data: {
    therapistId: string;
    patientId: string;
    appointmentId: string;
    rating: number;
    comment?: string;
  }): Promise<{ reviewId: string }> => {
    return apiRequest("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getTherapistReviews: async (
    therapistId: string,
    limit = 50
  ): Promise<Review[]> => {
    return apiRequest(`/reviews/therapist/${therapistId}?limit=${limit}`);
  },
};

// ========== VIDEO SESSION API ==========

export const videoAPI = {
  createSession: async (data: {
    appointmentId: string;
    therapistId: string;
    patientId: string;
  }): Promise<{ meeting: any; attendees: any[] }> => {
    return apiRequest("/video/session", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ========== HEALTH CHECK ==========

export const healthCheck = async (): Promise<{ status: string }> => {
  return apiRequest("/health");
};

export default {
  therapist: therapistAPI,
  patient: patientAPI,
  appointment: appointmentAPI,
  review: reviewAPI,
  video: videoAPI,
  healthCheck,
};
