# ItSelfCare Backend API Documentation

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: TBD

## Authentication
The API uses JWT Bearer tokens for authentication.
- For testing, use mock tokens: `mock_patient_{timestamp}` or `mock_therapist_{timestamp}`
- Include in header: `Authorization: Bearer {token}`

---

## API Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-23T05:16:31.436520"
}
```

---

## Therapist Endpoints

### POST /therapists
Register a new therapist (Public endpoint).

**Request Body:**
```json
{
  "userId": "string",
  "name": "string",
  "email": "string",
  "specialties": ["string"],
  "languages": ["string"],
  "hourlyRate": 100.0,
  "bio": "string",
  "geoLat": 6.9271,
  "geoLng": 79.8612
}
```

**Response:**
```json
{
  "theraphistId": "uuid-string"
}
```

---

### GET /therapists/nearby/search
Search for therapists near a location (Public endpoint).

**Query Parameters:**
- `lat` (required): Latitude (float)
- `lng` (required): Longitude (float)
- `radius` (optional): Search radius in kilometers (default: 50)
- `specialties` (optional): Comma-separated specialties filter

**Example:**
```
GET /therapists/nearby/search?lat=6.9271&lng=79.8612&radius=50&specialties=Anxiety,Depression
```

**Response:**
```json
[
  {
    "theraphistId": "uuid",
    "name": "Dr. John Doe",
    "email": "john@example.com",
    "specialties": ["Anxiety", "Depression"],
    "languages": ["English", "Sinhala"],
    "hourlyRate": 100.0,
    "bio": "Experienced therapist...",
    "geoLat": 6.9271,
    "geoLng": 79.8612,
    "distance": 0.5,
    "createdAt": "2025-11-23T04:25:29.130051",
    "updatedAt": "2025-11-23T04:25:29.130070"
  }
]
```

---

### GET /therapists/top/rated
Get top-rated therapists (Public endpoint).

**Query Parameters:**
- `limit` (optional): Number of therapists to return (default: 10)

**Response:**
```json
[
  {
    "theraphistId": "uuid",
    "name": "Dr. Jane Smith",
    "averageRating": 4.8,
    "reviewCount": 25,
    "specialties": ["Stress", "Anxiety"],
    "hourlyRate": 120.0,
    "bio": "...",
    "...": "other fields"
  }
]
```

---

### GET /therapists/{therapist_id}
Get therapist details by ID (Requires JWT - therapist role).

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "theraphistId": "uuid",
  "name": "Dr. John Doe",
  "email": "john@example.com",
  "specialties": ["Anxiety"],
  "languages": ["English"],
  "hourlyRate": 100.0,
  "bio": "...",
  "geoLat": 6.9271,
  "geoLng": 79.8612,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### PUT /therapists/{therapist_id}
Update therapist profile (Requires JWT - therapist role).

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "name": "Dr. John Updated",
  "bio": "Updated bio...",
  "specialties": ["Anxiety", "Depression"],
  "languages": ["English", "Tamil"],
  "hourlyRate": 150.0,
  "geoLat": 6.9271,
  "geoLng": 79.8612
}
```

**Response:**
```json
{
  "message": "Therapist updated successfully"
}
```

---

## Patient Endpoints

### POST /patients
Register a new patient (Public endpoint).

**Request Body:**
```json
{
  "userId": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "dateOfBirth": "1990-01-15"
}
```

**Response:**
```json
{
  "patientId": "uuid-string"
}
```

---

### GET /patients/{patient_id}
Get patient details (Requires JWT - patient role).

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "patientId": "uuid",
  "userId": "string",
  "name": "John Patient",
  "email": "patient@example.com",
  "phone": "1234567890",
  "dateOfBirth": "1990-01-15",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### PUT /patients/{patient_id}
Update patient profile (Requires JWT - patient role).

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "9876543210",
  "dateOfBirth": "1990-01-15",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "message": "Patient updated successfully"
}
```

**Note:** Email cannot be updated for security reasons.

---

## Appointment Endpoints

### POST /appointments
Create a new appointment (Optional auth).

**Request Body:**
```json
{
  "therapistId": "uuid",
  "patientId": "uuid",
  "startTime": "2025-11-25T10:00:00",
  "endTime": "2025-11-25T11:00:00",
  "type": "video",
  "notes": "First consultation"
}
```

**Response:**
```json
{
  "appointmentId": "uuid",
  "status": "requested"
}
```

**Notes:**
- `type` can be: "video", "home", or "clinic"
- System checks for conflicts before creating
- Initial status is "requested"

---

### GET /appointments/{appointment_id}
Get appointment by ID (Optional auth).

**Response:**
```json
{
  "appointmentId": "uuid",
  "appointmentDate": "2025-11-25T10:00:00",
  "theraphistId": "uuid",
  "patientId": "uuid",
  "startTime": "2025-11-25T10:00:00",
  "endTime": "2025-11-25T11:00:00",
  "type": "video",
  "status": "requested",
  "notes": "First consultation",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### GET /appointments/patient/{patient_id}
Get all appointments for a patient (Optional auth).

**Response:**
```json
[
  {
    "appointmentId": "uuid",
    "theraphistId": "uuid",
    "patientId": "uuid",
    "startTime": "...",
    "endTime": "...",
    "type": "video",
    "status": "confirmed",
    "...": "other fields"
  }
]
```

---

### GET /appointments/therapist/{therapist_id}
Get all appointments for a therapist (Optional auth).

**Response:** Same structure as patient appointments.

---

### PUT /appointments/{appointment_id}
Update appointment status (Optional auth).

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Response:**
```json
{
  "message": "Appointment confirmed"
}
```

**Status values:**
- `requested` - Initial state
- `confirmed` - Therapist accepted
- `cancelled` - Declined or cancelled
- `completed` - Session finished

---

### DELETE /appointments/{appointment_id}
Delete/cancel an appointment (Optional auth).

**Response:**
```json
{
  "message": "Appointment deleted"
}
```

---

## Review Endpoints

### POST /reviews
Create a review for a therapist (Public endpoint).

**Request Body:**
```json
{
  "therapistId": "uuid",
  "patientId": "uuid",
  "rating": 5,
  "comment": "Excellent service!"
}
```

**Response:**
```json
{
  "reviewId": "uuid"
}
```

**Notes:**
- `rating` must be between 1-5

---

### GET /reviews/therapist/{therapist_id}
Get all reviews for a therapist (Public endpoint).

**Response:**
```json
[
  {
    "reviewId": "uuid",
    "therapistId": "uuid",
    "patientId": "uuid",
    "rating": 5,
    "comment": "Great therapist!",
    "createdAt": "2025-11-23T..."
  }
]
```

---

## Database Schema

### Tables in DynamoDB (eu-north-1)

1. **itselfcare_theraphists**
   - Primary Key: `theraphistId` (String)
   - Fields: userId, name, email, specialties, languages, hourlyRate, bio, geoLat, geoLng, createdAt, updatedAt

2. **itselfcare_patients**
   - Primary Key: `patientId` (String)
   - Fields: userId, name, email, phone, dateOfBirth, address, createdAt, updatedAt

3. **itselfcare_appointments**
   - Primary Key: `appointmentId` (String)
   - Sort Key: `appointmentDate` (String)
   - Fields: theraphistId, patientId, startTime, endTime, type, status, notes, createdAt, updatedAt

4. **itselfcare_reviews**
   - Primary Key: `reviewId` (String)
   - Fields: therapistId, patientId, rating, comment, createdAt

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "detail": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `403` - Forbidden (authorization failed)
- `404` - Not Found
- `409` - Conflict (e.g., time slot already booked)
- `500` - Internal Server Error

---

## Architecture

### File Structure
```
itselfcare-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app initialization
│   ├── auth.py              # JWT authentication
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py       # Pydantic models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── therapist_service.py
│   │   ├── patient_service.py
│   │   ├── appointment_service.py
│   │   └── review_service.py
│   └── routes/
│       ├── __init__.py
│       ├── therapist_routes.py
│       ├── patient_routes.py
│       ├── appointment_routes.py
│       └── review_routes.py
├── requirements.txt
├── .env.example
└── README.md
```

### Design Pattern
- **Service Layer Pattern**: Business logic separated into service classes
- **Route Handlers**: Thin controllers that delegate to services
- **Data Models**: Pydantic schemas for request/response validation
- **Authentication**: JWT-based with role checking (patient/therapist)

---

## Running the Backend

### Prerequisites
- Python 3.6+
- pip
- AWS credentials configured (for DynamoDB access)

### Setup
```bash
cd itselfcare-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Start Server
```bash
uvicorn app.main:app --reload --port 8000
```

### Test
```bash
curl http://localhost:8000/health
```

---

## Notes

1. **Field Naming**: Note the inconsistency `theraphistId` (with 'h') is used throughout - this matches the DynamoDB table structure
2. **Mock Authentication**: For development, tokens like `mock_patient_123` or `mock_therapist_456` are accepted
3. **CORS**: Configured to allow `http://localhost:5173` (frontend dev server)
4. **Decimal Handling**: All numeric values from DynamoDB are automatically converted to float

