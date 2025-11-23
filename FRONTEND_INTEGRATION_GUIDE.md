# Frontend Integration Guide

## ✅ What's Been Updated

The frontend API service has been completely rewritten to match the backend structure with **16 endpoints across 4 domains**.

### Files Changed:

- `src/services/api.ts` - **Completely rewritten** ✅
- `src/services/api-old-backup.ts` - Backup of old version

---

## 📋 New API Service Structure

### Import Patterns

```typescript
// Import everything
import api from "@/services/api";

// Or import specific APIs
import {
  therapistAPI,
  patientAPI,
  appointmentAPI,
  reviewAPI,
  authHelpers,
} from "@/services/api";

// Or import types
import type { Therapist, Patient, Appointment, Review } from "@/services/api";
```

---

## 🔑 Authentication

### Setting Up Authentication

```typescript
import { authHelpers } from "@/services/api";

// Login - set token
authHelpers.setToken("mock_patient_123"); // For development
// authHelpers.setToken(realJWTToken); // For production

// Check authentication
if (authHelpers.isAuthenticated()) {
  console.log("User is logged in");
}

// Get user type
const userType = authHelpers.getUserType(); // 'patient' | 'therapist' | null

// Logout
authHelpers.removeToken();
```

### Mock Tokens for Development

- Patient: `mock_patient_123` (or any suffix)
- Therapist: `mock_therapist_456` (or any suffix)

---

## 🏥 Therapist API Usage

### 1. Register Therapist (Public)

```typescript
import { therapistAPI } from "@/services/api";

const registerTherapist = async () => {
  try {
    const result = await therapistAPI.register({
      userId: "user-123",
      name: "Dr. Jane Smith",
      email: "jane@example.com",
      specialties: ["Anxiety", "Depression"],
      languages: ["English", "Sinhala"],
      hourlyRate: 100.0,
      bio: "Experienced clinical psychologist...",
      geoLat: 6.9271,
      geoLng: 79.8612,
    });

    console.log("Therapist registered:", result.theraphistId);
  } catch (error) {
    console.error("Registration failed:", error.message);
  }
};
```

### 2. Search Nearby Therapists (Public)

```typescript
const searchTherapists = async () => {
  try {
    const therapists = await therapistAPI.searchNearby({
      lat: 6.9271,
      lng: 79.8612,
      radius: 50, // kilometers
      specialties: ["Anxiety", "Depression"], // optional filter
    });

    console.log(`Found ${therapists.length} therapists`);
    therapists.forEach((t) => {
      console.log(`${t.name} - ${t.distance?.toFixed(2)} km away`);
    });
  } catch (error) {
    console.error("Search failed:", error.message);
  }
};
```

### 3. Get Top Rated Therapists (Public)

```typescript
const getTopTherapists = async () => {
  try {
    const topTherapists = await therapistAPI.getTopRated(10);

    topTherapists.forEach((t) => {
      console.log(
        `${t.name} - Rating: ${t.averageRating} (${t.reviewCount} reviews)`
      );
    });
  } catch (error) {
    console.error("Failed to get top therapists:", error.message);
  }
};
```

### 4. Get Therapist Profile (Requires Auth)

```typescript
const getTherapistProfile = async (therapistId: string) => {
  // Make sure token is set first
  authHelpers.setToken("mock_therapist_456");

  try {
    const therapist = await therapistAPI.getById(therapistId);
    console.log("Therapist:", therapist);
  } catch (error) {
    console.error("Failed to get profile:", error.message);
  }
};
```

### 5. Update Therapist Profile (Requires Auth)

```typescript
const updateProfile = async (therapistId: string) => {
  authHelpers.setToken("mock_therapist_456");

  try {
    const result = await therapistAPI.update(therapistId, {
      bio: "Updated bio...",
      hourlyRate: 150.0,
      specialties: ["Anxiety", "Depression", "Stress"],
    });

    console.log(result.message); // "Therapist updated successfully"
  } catch (error) {
    console.error("Update failed:", error.message);
  }
};
```

---

## 👤 Patient API Usage

### 1. Register Patient (Public)

```typescript
import { patientAPI } from "@/services/api";

const registerPatient = async () => {
  try {
    const result = await patientAPI.register({
      userId: "user-456",
      name: "John Doe",
      email: "john@example.com",
      phone: "0771234567",
      dateOfBirth: "1990-01-15",
    });

    console.log("Patient registered:", result.patientId);
  } catch (error) {
    console.error("Registration failed:", error.message);
  }
};
```

### 2. Get Patient Profile (Requires Auth)

```typescript
const getPatientProfile = async (patientId: string) => {
  authHelpers.setToken("mock_patient_123");

  try {
    const patient = await patientAPI.getById(patientId);
    console.log("Patient:", patient);
  } catch (error) {
    console.error("Failed to get profile:", error.message);
  }
};
```

### 3. Update Patient Profile (Requires Auth)

```typescript
const updatePatientProfile = async (patientId: string) => {
  authHelpers.setToken("mock_patient_123");

  try {
    const result = await patientAPI.update(patientId, {
      name: "John Doe Updated",
      phone: "0779876543",
      address: "123 Main St, Colombo",
    });

    console.log(result.message); // "Patient updated successfully"
  } catch (error) {
    console.error("Update failed:", error.message);
  }
};
```

**Note:** Email cannot be updated for security reasons.

---

## 📅 Appointment API Usage

### 1. Create Appointment

```typescript
import { appointmentAPI } from "@/services/api";

const bookAppointment = async () => {
  try {
    const result = await appointmentAPI.create({
      therapistId: "therapist-uuid-here",
      patientId: "patient-uuid-here",
      startTime: "2025-11-25T10:00:00",
      endTime: "2025-11-25T11:00:00",
      type: "video", // 'video' | 'home' | 'clinic'
      notes: "First consultation for anxiety issues",
    });

    console.log("Appointment created:", result.appointmentId);
    console.log("Status:", result.status); // 'requested'
  } catch (error) {
    console.error("Booking failed:", error.message);
  }
};
```

### 2. Get Appointment by ID

```typescript
const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await appointmentAPI.getById(appointmentId);
    console.log("Appointment:", appointment);
  } catch (error) {
    console.error("Failed to get appointment:", error.message);
  }
};
```

### 3. Get Patient's Appointments

```typescript
const getPatientAppointments = async (patientId: string) => {
  try {
    const appointments = await appointmentAPI.getByPatient(patientId);

    console.log(`Patient has ${appointments.length} appointments`);
    appointments.forEach((apt) => {
      console.log(`${apt.startTime} - Status: ${apt.status}`);
    });
  } catch (error) {
    console.error("Failed to get appointments:", error.message);
  }
};
```

### 4. Get Therapist's Appointments

```typescript
const getTherapistAppointments = async (therapistId: string) => {
  try {
    const appointments = await appointmentAPI.getByTherapist(therapistId);

    console.log(`Therapist has ${appointments.length} appointments`);
  } catch (error) {
    console.error("Failed to get appointments:", error.message);
  }
};
```

### 5. Update Appointment Status

```typescript
const confirmAppointment = async (appointmentId: string) => {
  try {
    const result = await appointmentAPI.updateStatus(
      appointmentId,
      "confirmed"
    );
    console.log(result.message); // "Appointment confirmed"
  } catch (error) {
    console.error("Update failed:", error.message);
  }
};

// Status options: 'requested' | 'confirmed' | 'cancelled' | 'completed'
```

### 6. Cancel Appointment

```typescript
const cancelAppointment = async (appointmentId: string) => {
  try {
    const result = await appointmentAPI.delete(appointmentId);
    console.log(result.message); // "Appointment deleted"
  } catch (error) {
    console.error("Cancellation failed:", error.message);
  }
};
```

---

## ⭐ Review API Usage

### 1. Create Review (Public)

```typescript
import { reviewAPI } from "@/services/api";

const leaveReview = async () => {
  try {
    const result = await reviewAPI.create({
      therapistId: "therapist-uuid-here",
      patientId: "patient-uuid-here",
      rating: 5, // 1-5
      comment: "Excellent therapist! Very helpful and professional.",
    });

    console.log("Review created:", result.reviewId);
  } catch (error) {
    console.error("Review failed:", error.message);
  }
};
```

### 2. Get Therapist Reviews (Public)

```typescript
const getTherapistReviews = async (therapistId: string) => {
  try {
    const reviews = await reviewAPI.getByTherapist(therapistId);

    console.log(`Therapist has ${reviews.length} reviews`);
    reviews.forEach((review) => {
      console.log(`Rating: ${review.rating}/5 - ${review.comment}`);
    });
  } catch (error) {
    console.error("Failed to get reviews:", error.message);
  }
};
```

---

## 🎯 React Component Examples

### Example 1: Find Therapist Component

```typescript
import React, { useState, useEffect } from "react";
import { therapistAPI, type Therapist } from "@/services/api";

export const FindTherapist: React.FC = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchNearby = async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await therapistAPI.searchNearby({
        lat: 6.9271,
        lng: 79.8612,
        radius: 50,
        specialties: ["Anxiety"],
      });

      setTherapists(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchNearby();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Nearby Therapists</h2>
      {therapists.map((therapist) => (
        <div key={therapist.theraphistId}>
          <h3>{therapist.name}</h3>
          <p>{therapist.bio}</p>
          <p>Distance: {therapist.distance?.toFixed(2)} km</p>
          <p>Rate: ${therapist.hourlyRate}/hour</p>
          {therapist.averageRating && (
            <p>
              Rating: {therapist.averageRating} ({therapist.reviewCount}{" "}
              reviews)
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
```

### Example 2: Patient Dashboard Component

```typescript
import React, { useState, useEffect } from "react";
import { appointmentAPI, authHelpers, type Appointment } from "@/services/api";

export const PatientDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppointments = async () => {
      const patientId = authHelpers.getUserId();
      if (!patientId) return;

      try {
        const data = await appointmentAPI.getByPatient(patientId);
        setAppointments(data);
      } catch (error) {
        console.error("Failed to load appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const cancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentAPI.delete(appointmentId);
      // Refresh list
      setAppointments((prev) =>
        prev.filter((apt) => apt.appointmentId !== appointmentId)
      );
    } catch (error) {
      console.error("Failed to cancel:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>My Appointments</h2>
      {appointments.map((appointment) => (
        <div key={appointment.appointmentId}>
          <p>Time: {appointment.startTime}</p>
          <p>Type: {appointment.type}</p>
          <p>Status: {appointment.status}</p>
          <button onClick={() => cancelAppointment(appointment.appointmentId)}>
            Cancel
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Example 3: Booking Component

```typescript
import React, { useState } from "react";
import { appointmentAPI, authHelpers } from "@/services/api";

interface BookingFormProps {
  therapistId: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({ therapistId }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [type, setType] = useState<"video" | "home" | "clinic">("video");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const patientId = authHelpers.getUserId();
    if (!patientId) {
      alert("Please log in first");
      return;
    }

    try {
      // Combine date and time
      const startDateTime = `${selectedDate}T${selectedTime}:00`;
      const startTime = new Date(startDateTime);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour

      const result = await appointmentAPI.create({
        therapistId,
        patientId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        type,
        notes,
      });

      alert(`Appointment booked! ID: ${result.appointmentId}`);
    } catch (error) {
      alert(
        `Booking failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleBooking}>
      <h3>Book Appointment</h3>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        required
      />

      <input
        type="time"
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
        required
      />

      <select value={type} onChange={(e) => setType(e.target.value as any)}>
        <option value="video">Video Call</option>
        <option value="home">Home Visit</option>
        <option value="clinic">Clinic Visit</option>
      </select>

      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Booking..." : "Book Appointment"}
      </button>
    </form>
  );
};
```

---

## 🔧 Environment Configuration

Create a `.env` file in your project root:

```env
VITE_API_URL=http://localhost:8000
```

For production:

```env
VITE_API_URL=https://your-api-domain.com
```

---

## ⚠️ Important Notes

### 1. Field Naming Convention

- Backend uses `theraphistId` (with 'h') - this is intentional
- All frontend code should use `theraphistId` not `therapistId`

### 2. Authentication

- Development: Use mock tokens (`mock_patient_123`, `mock_therapist_456`)
- Production: Replace with real AWS Cognito JWT tokens

### 3. Date/Time Format

- Use ISO 8601 format: `2025-11-25T10:00:00`
- Backend expects this exact format

### 4. Appointment Types

- Valid values: `'video'`, `'home'`, `'clinic'`

### 5. Appointment Status Flow

```
requested → confirmed → completed
          ↓
       cancelled
```

### 6. Rating Range

- Reviews must have rating between 1-5

---

## 🐛 Error Handling

All API calls can throw errors. Always wrap in try-catch:

```typescript
try {
  const result = await therapistAPI.searchNearby({ lat: 6.9271, lng: 79.8612 });
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    console.error("Error:", error.message);
    // Show error to user
  }
}
```

Common error messages:

- `"Therapist not found"` - Invalid therapist ID
- `"Time slot already booked"` - Appointment conflict
- `"Authorization failed"` - Invalid or missing JWT token
- `"HTTP 403: Forbidden"` - Wrong user role for endpoint

---

## ✅ Testing Checklist

Before going to production, test:

- [ ] Therapist registration
- [ ] Patient registration
- [ ] Search therapists by location
- [ ] Get top-rated therapists
- [ ] View therapist profile
- [ ] Update therapist profile (as therapist)
- [ ] View patient profile
- [ ] Update patient profile (as patient)
- [ ] Create appointment
- [ ] View appointments (patient & therapist)
- [ ] Update appointment status
- [ ] Cancel appointment
- [ ] Create review
- [ ] View therapist reviews
- [ ] Authentication flow
- [ ] Error handling

---

## 📚 Additional Resources

- **API Documentation**: See `API_DOCUMENTATION.md` in backend folder
- **Backend Summary**: See `BACKEND_SUMMARY.md` in backend folder
- **Quick Reference**: See `QUICK_REFERENCE.md` in backend folder
- **Postman Guide**: See `POSTMAN_TESTING_GUIDE.md` in backend folder

---

## 🚀 Next Steps

1. Update existing React components to use the new API service
2. Test all endpoints with your UI
3. Replace mock tokens with real authentication
4. Add proper error handling and loading states
5. Test end-to-end user flows

---

**Status**: ✅ Frontend API service ready for integration
