/**
 * Mock data for frontend testing without AWS backend
 * This data matches the structure from populate_sample_data.py
 */

export const mockTherapists = [
  {
    theraphistId: "therapist-1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@itselfcare.com",
    specialties: ["Sports Injury", "Rehabilitation", "Post-Surgery Recovery"],
    languages: ["English", "Sinhala"],
    hourlyRate: 50.0,
    geoLat: 6.927079,
    geoLng: 79.861244,
    bio: "15 years of experience in sports physiotherapy. Specialized in helping athletes recover from injuries and improve performance.",
    certifications: [
      "MSc in Sports Medicine",
      "Certified Sports Physiotherapist",
    ],
    averageRating: 4.7,
    totalReviews: 3,
    createdAt: new Date().toISOString(),
  },
  {
    theraphistId: "therapist-2",
    name: "Dr. Michael Chen",
    email: "michael.chen@itselfcare.com",
    specialties: [
      "Orthopedic Physiotherapy",
      "Manual Therapy",
      "Pain Management",
    ],
    languages: ["English", "Tamil", "Chinese"],
    hourlyRate: 45.0,
    geoLat: 6.905977,
    geoLng: 79.851934,
    bio: "Expert in orthopedic conditions and chronic pain management. Over 12 years helping patients regain mobility.",
    certifications: ["PhD in Physiotherapy", "Orthopedic Specialist"],
    averageRating: 5.0,
    totalReviews: 2,
    createdAt: new Date().toISOString(),
  },
  {
    theraphistId: "therapist-3",
    name: "Dr. Priya Perera",
    email: "priya.perera@itselfcare.com",
    specialties: ["Pediatric Physiotherapy", "Neurological Rehabilitation"],
    languages: ["English", "Sinhala", "Tamil"],
    hourlyRate: 40.0,
    geoLat: 6.934167,
    geoLng: 79.849722,
    bio: "Specialized in treating children with developmental delays and neurological conditions. 10 years of dedicated service.",
    certifications: [
      "Pediatric Physiotherapy Specialist",
      "Neuro-Rehabilitation Certified",
    ],
    averageRating: 4.7,
    totalReviews: 3,
    createdAt: new Date().toISOString(),
  },
  {
    theraphistId: "therapist-4",
    name: "Dr. James Anderson",
    email: "james.anderson@itselfcare.com",
    specialties: ["Geriatric Care", "Balance Training", "Fall Prevention"],
    languages: ["English"],
    hourlyRate: 55.0,
    geoLat: 6.915977,
    geoLng: 79.871234,
    bio: "Helping elderly patients maintain independence through specialized balance and mobility training.",
    certifications: [
      "Geriatric Physiotherapy Specialist",
      "Balance Disorder Expert",
    ],
    averageRating: 4.5,
    totalReviews: 2,
    createdAt: new Date().toISOString(),
  },
  {
    theraphistId: "therapist-5",
    name: "Dr. Anjali Sharma",
    email: "anjali.sharma@itselfcare.com",
    specialties: [
      "Women's Health",
      "Pre/Post-natal Care",
      "Pelvic Floor Therapy",
    ],
    languages: ["English", "Hindi", "Sinhala"],
    hourlyRate: 48.0,
    geoLat: 6.918977,
    geoLng: 79.855934,
    bio: "Dedicated to women's health physiotherapy with focus on pre-natal and post-natal care.",
    certifications: [
      "Women's Health Specialist",
      "Pelvic Floor Rehabilitation Expert",
    ],
    averageRating: 5.0,
    totalReviews: 2,
    createdAt: new Date().toISOString(),
  },
  {
    theraphistId: "therapist-6",
    name: "Dr. Robert Williams",
    email: "robert.williams@itselfcare.com",
    specialties: ["Cardiovascular Rehabilitation", "Respiratory Therapy"],
    languages: ["English", "Sinhala"],
    hourlyRate: 52.0,
    geoLat: 6.912077,
    geoLng: 79.868244,
    bio: "Specializing in cardiac and pulmonary rehabilitation programs for optimal recovery.",
    certifications: [
      "Cardiopulmonary Specialist",
      "Advanced Respiratory Therapist",
    ],
    averageRating: 4.5,
    totalReviews: 2,
    createdAt: new Date().toISOString(),
  },
];

export const mockReviews = [
  {
    reviewId: "review-1",
    theraphistId: "therapist-1",
    patientId: "patient-1",
    rating: 5,
    comment:
      "Excellent therapist! Helped me recover from my knee injury in record time.",
    patientName: "John Doe",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    reviewId: "review-2",
    theraphistId: "therapist-1",
    patientId: "patient-2",
    rating: 5,
    comment:
      "Very professional and knowledgeable. Highly recommend for sports injuries.",
    patientName: "Jane Smith",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    reviewId: "review-3",
    theraphistId: "therapist-2",
    patientId: "patient-1",
    rating: 5,
    comment:
      "Amazing results with my back pain. Dr. Chen is very skilled in manual therapy.",
    patientName: "John Doe",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Feature flag to switch between mock and real API
export const USE_MOCK_DATA =
  !import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_USE_MOCK_DATA === "true";
