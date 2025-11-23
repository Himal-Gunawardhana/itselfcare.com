# ItselfCare Backend - FastAPI + DynamoDB

Complete backend implementation for ItselfCare physiotherapy e-channeling platform.

## Features

- 🔐 **JWT Authentication** via AWS Cognito
- 👨‍⚕️ **Therapist Management** - CRUD operations for therapist profiles
- 👤 **Patient Management** - Patient registration and profile management
- 📅 **Appointment Booking** - With conflict detection using DynamoDB GSI
- ⭐ **Reviews & Ratings** - Patient reviews with automatic rating calculation
- 📍 **Geospatial Search** - Find nearby therapists using geohash
- 📹 **Video Sessions** - Amazon Chime integration for virtual appointments
- 🚀 **Production Ready** - Deployable to AWS Lambda with SAM

## Project Structure

```
itselfcare-backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI app & endpoints
│   ├── auth.py          # Cognito JWT verification
│   ├── db.py            # DynamoDB connection
│   ├── geoutils.py      # Geospatial utilities
│   ├── chime_client.py  # Amazon Chime video
│   └── models.py        # Pydantic models
├── requirements.txt
├── .env.example
├── sam-template.yaml
└── README.md
```

## Prerequisites

- Python 3.12+
- AWS Account with:
  - DynamoDB tables created (itselfcare_theraphists, itselfcare_patients, itselfcare_appointments, itselfcare_reviews)
  - Cognito User Pool configured
  - IAM permissions for DynamoDB, Cognito, and Chime

## DynamoDB Table Setup

Ensure your tables have the following schema:

### itselfcare_theraphists

- **PK**: `theraphistId` (String)
- Attributes: userId, name, email, specialties, geoLat, geoLng, geohash, geoPrefix, hourlyRate, averageRating, totalReviews

### itselfcare_patients

- **PK**: `patientId` (String)
- Attributes: userId, name, email, phone, dateOfBirth, address

### itselfcare_appointments

- **PK**: `appointmentId` (String)
- **SK**: `appointmentDate` (String)
- **GSI**: `GSI_TherapistSchedule` (PK: theraphistId, SK: appointmentDate)
- Attributes: patientId, theraphistId, type, scheduledStart, scheduledEnd, status, paymentStatus, location

### itselfcare_reviews

- **PK**: `reviewId` (String)
- Attributes: theraphistId, patientId, appointmentId, rating, comment

## Installation

1. **Clone and navigate to backend**:

```bash
cd itselfcare-backend
```

2. **Install dependencies**:

```bash
pip install -r requirements.txt
```

3. **Configure environment**:

```bash
cp .env.example .env
# Edit .env with your AWS credentials and Cognito details
```

4. **Run locally**:

```bash
uvicorn app.main:app --reload --port 8000
```

API will be available at `http://localhost:8000`

## API Endpoints

### Public Endpoints

- `GET /` - API info
- `GET /health` - Health check
- `GET /therapists/{id}` - Get therapist details
- `GET /therapists/nearby/search` - Search nearby therapists
- `GET /therapists/top/rated` - Get top-rated therapists
- `GET /reviews/therapist/{id}` - Get therapist reviews

### Protected Endpoints (Require JWT)

#### Therapists

- `POST /therapists` - Create therapist profile
- `PUT /therapists/{id}` - Update therapist profile

#### Patients

- `POST /patients` - Create patient profile
- `GET /patients/{id}` - Get patient details

#### Appointments

- `POST /appointments` - Create appointment (with conflict check)
- `GET /appointments/{id}` - Get appointment details
- `PUT /appointments/{id}` - Update appointment
- `GET /appointments/patient/{id}` - Get patient appointments
- `GET /appointments/therapist/{id}` - Get therapist schedule

#### Reviews

- `POST /reviews` - Create review

#### Video

- `POST /video/session` - Create Chime meeting

## Testing with cURL

### Get top-rated therapists:

```bash
curl http://localhost:8000/therapists/top/rated?limit=5
```

### Create therapist (with auth):

```bash
curl -X POST http://localhost:8000/therapists \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "cognito-sub-123",
    "name": "Dr. Sarah Johnson",
    "email": "sarah@example.com",
    "specialties": ["Sports Injury", "Rehabilitation"],
    "languages": ["English", "Sinhala"],
    "geoLat": 6.927079,
    "geoLng": 79.861244,
    "hourlyRate": 25.0,
    "bio": "Experienced physiotherapist specializing in sports injuries"
  }'
```

### Search nearby therapists:

```bash
curl "http://localhost:8000/therapists/nearby/search?lat=6.927079&lng=79.861244&radius_m=5000&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create appointment:

```bash
curl -X POST http://localhost:8000/appointments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "therapistId": "therapist-uuid",
    "patientId": "patient-uuid",
    "startIso": "2025-12-01T10:00:00Z",
    "endIso": "2025-12-01T10:45:00Z",
    "type": "video",
    "notes": "First consultation"
  }'
```

## AWS Deployment with SAM

1. **Build**:

```bash
sam build
```

2. **Deploy**:

```bash
sam deploy --guided
```

3. **Required IAM Permissions**:

- `dynamodb:PutItem`, `GetItem`, `Query`, `Scan`, `UpdateItem` on all 4 tables
- `chime-sdk-meetings:CreateMeeting`
- `chime-sdk-meetings:CreateAttendee`
- `logs:CreateLogGroup`, `CreateLogStream`, `PutLogEvents`

## Important Notes

### appointmentId vs appointmentsId

⚠️ **Fixed**: Changed `appointmentsId` to `appointmentId` throughout the codebase as requested.

### GSI Requirement

The appointments table **must** have a GSI named `GSI_TherapistSchedule`:

- **PK**: `theraphistId`
- **SK**: `appointmentDate`

This enables efficient conflict checking when booking appointments.

### Geospatial Search

Current implementation uses `scan` with `geoPrefix` filter. For production scale:

- Consider redesigning therapist table with `PK=GH#<prefix>` for efficient queries
- Use precision 6 for ~1.2km x 0.6km cells

### Security Considerations

- Always validate JWT tokens on protected endpoints
- Implement rate limiting (API Gateway throttling)
- Use AWS Secrets Manager for sensitive configuration
- Enable CloudWatch logging and alarms

## Environment Variables

| Variable                | Description                            | Default                   |
| ----------------------- | -------------------------------------- | ------------------------- |
| `AWS_REGION`            | AWS region for DynamoDB                | `ap-south-1`              |
| `THERAPISTS_TABLE`      | Therapists table name                  | `itselfcare_theraphists`  |
| `PATIENTS_TABLE`        | Patients table name                    | `itselfcare_patients`     |
| `APPOINTMENTS_TABLE`    | Appointments table name                | `itselfcare_appointments` |
| `REVIEWS_TABLE`         | Reviews table name                     | `itselfcare_reviews`      |
| `COGNITO_REGION`        | Cognito region                         | `ap-south-1`              |
| `COGNITO_USERPOOL_ID`   | Cognito User Pool ID                   | Required                  |
| `COGNITO_APP_CLIENT_ID` | Cognito App Client ID                  | Required                  |
| `CHIME_REGION`          | Chime service region                   | `us-east-1`               |
| `CORS_ORIGINS`          | Allowed CORS origins (comma-separated) | `http://localhost:5173`   |

## Production Improvements

- [ ] Implement pagination for list endpoints
- [ ] Add Redis caching for therapist search
- [ ] Use DynamoDB Streams for real-time updates
- [ ] Implement transaction-based booking with `TransactWriteItems`
- [ ] Add CloudWatch metrics and alarms
- [ ] Implement SQS for async notifications
- [ ] Add API Gateway request validation
- [ ] Implement rate limiting per user
- [ ] Store Chime recordings in S3

## Support

For issues or questions, contact: support@itselfcare.com

## License

Proprietary - ItselfCare Platform
