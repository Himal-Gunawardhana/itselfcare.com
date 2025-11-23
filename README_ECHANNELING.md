# 🏥 ItselfCare E-Channeling Platform

Complete physiotherapy e-channeling platform with Python FastAPI backend and React frontend.

## 🎯 What's Implemented

✅ **Full-Stack E-Channeling System**

- Python FastAPI backend with DynamoDB
- React + TypeScript frontend
- AWS Cognito authentication ready
- Amazon Chime video session integration
- Geospatial therapist search
- Real-time appointment booking with conflict detection
- Review and rating system

## 📁 Project Structure

```
itselfcare.com/
├── itselfcare-backend/          # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py              # API endpoints (✅ appointmentId fixed)
│   │   ├── db.py                # DynamoDB connection
│   │   ├── auth.py              # JWT authentication
│   │   ├── geoutils.py          # Geospatial utilities
│   │   ├── chime_client.py      # Video session creation
│   │   └── models.py            # Pydantic models
│   ├── requirements.txt
│   ├── .env.example
│   ├── start.sh                 # Quick start script
│   └── README.md
├── src/                         # React Frontend
│   ├── services/
│   │   └── api.ts               # Backend API client
│   ├── components/
│   │   ├── Hero.tsx             # ✅ With top therapists
│   │   └── EChanneling.tsx      # ✅ With featured therapists
│   └── pages/
│       └── echanneling/
│           ├── FindTherapist.tsx         # ✅ Search & booking
│           ├── EChannelingLogin.tsx      # ✅ Dual login
│           └── EChannelingRegister.tsx   # ✅ Dual registration
├── QUICK_START.md               # Detailed setup guide
├── IMPLEMENTATION_SUMMARY.md    # What was built
└── README.md                    # This file
```

## 🚀 Quick Start

### Option 1: Automated (Recommended)

#### Backend

```bash
cd itselfcare-backend
./start.sh
```

#### Frontend

```bash
npm install
cp .env.example .env
npm run dev
```

### Option 2: Manual Setup

See [QUICK_START.md](QUICK_START.md) for detailed instructions.

## 🗄️ DynamoDB Tables Required

Create these 4 tables in your AWS account:

1. **itselfcare_theraphists** (PK: theraphistId)
2. **itselfcare_patients** (PK: patientId)
3. **itselfcare_appointments** (PK: appointmentId, SK: appointmentDate)
   - ⚠️ **Requires GSI**: `GSI_TherapistSchedule` (PK: theraphistId, SK: appointmentDate)
4. **itselfcare_reviews** (PK: reviewId)

## 🎨 Frontend Pages

### Home Page

- Hero section with 3 top-rated therapists from backend
- E-Channeling platform overview
- Featured therapists section

### E-Channeling Pages

- **`/echanneling`** - Platform overview with featured therapists
- **`/echanneling/find-therapist`** - Search & book therapists
- **`/echanneling/login`** - Patient/Therapist login
- **`/echanneling/register`** - Patient/Therapist registration

## 📡 Backend API Endpoints

### Public Endpoints

- `GET /` - API info
- `GET /health` - Health check
- `GET /therapists/top/rated` - Top therapists
- `GET /therapists/nearby/search` - Geospatial search
- `GET /therapists/{id}` - Therapist details
- `GET /reviews/therapist/{id}` - Therapist reviews

### Protected Endpoints (Require JWT)

- `POST /therapists` - Create therapist profile
- `PUT /therapists/{id}` - Update therapist
- `POST /patients` - Create patient profile
- `GET /patients/{id}` - Get patient details
- `POST /appointments` - Book appointment (with conflict check)
- `GET /appointments/{id}` - Get appointment
- `PUT /appointments/{id}` - Update appointment
- `GET /appointments/patient/{id}` - Patient's appointments
- `GET /appointments/therapist/{id}` - Therapist's schedule
- `POST /reviews` - Create review
- `POST /video/session` - Create Chime video session

## 🔐 Authentication

**Current**: Mock authentication for development
**Production**: AWS Cognito (code is ready, just needs credentials)

### Mock Login Flow

1. Register at `/echanneling/register`
2. Login at `/echanneling/login`
3. Token stored in localStorage
4. Use token for protected endpoints

## 🧪 Testing

### Test Backend

```bash
# Health check
curl http://localhost:8000/health

# Get top therapists
curl http://localhost:8000/therapists/top/rated?limit=5

# Search nearby (requires auth token)
curl "http://localhost:8000/therapists/nearby/search?lat=6.927&lng=79.861&radius_m=5000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Frontend

1. Open http://localhost:5173
2. Scroll to E-Channeling section on home page
3. Click "View All Therapists"
4. Register as patient
5. Search and book appointment

## 📝 Environment Variables

### Backend (.env)

```env
AWS_REGION=ap-south-1
THERAPISTS_TABLE=itselfcare_theraphists
PATIENTS_TABLE=itselfcare_patients
APPOINTMENTS_TABLE=itselfcare_appointments
REVIEWS_TABLE=itselfcare_reviews
COGNITO_USERPOOL_ID=your_pool_id
COGNITO_APP_CLIENT_ID=your_client_id
CORS_ORIGINS=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🎯 Key Features

### Geospatial Search

- Search therapists by location (latitude/longitude)
- Configurable search radius
- Distance calculation in meters/km
- Uses geohash for efficient querying

### Appointment Booking

- Date/time selection
- Session type (video/home/clinic)
- Conflict detection via DynamoDB GSI
- Automatic 45-minute session duration
- Optional notes field

### Review System

- 1-5 star rating
- Optional comment
- Automatic therapist rating calculation
- Displays average rating and total reviews

### Video Sessions

- Amazon Chime SDK integration
- Creates meeting and attendee IDs
- Ready for frontend video UI implementation

## 🚀 Deployment

### Backend (AWS Lambda)

```bash
cd itselfcare-backend
sam build
sam deploy --guided
```

### Frontend (Vercel)

```bash
vercel --prod
```

Update `.env.production` with Lambda API Gateway URL.

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Complete setup guide with troubleshooting
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What was built and how it works
- **[itselfcare-backend/README.md](itselfcare-backend/README.md)** - Backend API documentation

## ✅ Critical Notes

### appointmentId (FIXED)

- ✅ Changed from `appointmentsId` to `appointmentId` throughout
- ✅ Updated in backend (main.py, models.py)
- ✅ Updated in frontend (api.ts)
- ✅ Updated in all documentation

### GSI Requirement

- ⚠️ `GSI_TherapistSchedule` must be created on appointments table
- Required for appointment conflict checking
- See QUICK_START.md for creation command

## 🛠️ Tech Stack

### Backend

- Python 3.12
- FastAPI
- boto3 (AWS SDK)
- python-geohash
- python-jose (JWT)
- Pydantic

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- React Router

### AWS Services

- DynamoDB
- Cognito
- Chime SDK
- Lambda (deployment)
- API Gateway (deployment)

## 📊 Database Schema

See [QUICK_START.md](QUICK_START.md#-step-3-dynamodb-setup) for complete schema details.

## 🎯 Next Steps

1. **Configure AWS credentials** in backend `.env`
2. **Create DynamoDB tables** (especially GSI!)
3. **Run backend**: `cd itselfcare-backend && ./start.sh`
4. **Run frontend**: `npm run dev`
5. **Test the flow**: Register → Login → Search → Book

## 💡 Tips

- Use `http://localhost:8000/docs` for interactive API docs
- Check browser console for frontend errors
- Check terminal for backend logs
- Verify AWS credentials if getting access denied
- Ensure CORS_ORIGINS includes your frontend URL

## 🐛 Troubleshooting

### Backend won't start

- Check Python version: `python3 --version` (need 3.12+)
- Check .env file exists with AWS credentials
- Check AWS credentials: `aws sts get-caller-identity`

### Frontend can't connect to backend

- Verify backend is running on port 8000
- Check VITE_API_BASE_URL in frontend .env
- Check CORS_ORIGINS in backend .env

### DynamoDB access denied

- Verify AWS credentials
- Check IAM permissions for DynamoDB
- Verify table names match .env configuration

## 📞 Support

Review the implementation details in:

1. [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
2. [QUICK_START.md](QUICK_START.md)
3. Backend logs in terminal
4. Browser console for frontend errors

---

**Built with ❤️ for ItselfCare**
**Status**: ✅ Ready for testing
**Date**: November 22, 2025
