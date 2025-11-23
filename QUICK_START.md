# ItselfCare E-Channeling Platform - Quick Start Guide

Complete guide to running the ItselfCare E-Channeling platform with Python FastAPI backend and React frontend.

## 📋 Prerequisites

- **Python 3.12+** installed
- **Node.js 18+** and npm installed
- **AWS Account** with:
  - DynamoDB tables created
  - Cognito User Pool configured
  - IAM user with appropriate permissions
- **Git** installed

## 🏗️ Architecture Overview

```
itselfcare.com/
├── itselfcare-backend/     # Python FastAPI backend
│   └── app/                # API endpoints & business logic
└── src/                    # React frontend
    ├── services/api.ts     # Backend API client
    ├── components/         # UI components
    └── pages/              # Application pages
```

## 🚀 Step 1: Backend Setup

### 1.1 Navigate to Backend Directory

```bash
cd itselfcare-backend
```

### 1.2 Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# OR
.\venv\Scripts\activate  # On Windows
```

### 1.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 1.4 Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your AWS credentials:

```env
AWS_REGION=ap-south-1
THERAPISTS_TABLE=itselfcare_theraphists
PATIENTS_TABLE=itselfcare_patients
APPOINTMENTS_TABLE=itselfcare_appointments
REVIEWS_TABLE=itselfcare_reviews

COGNITO_REGION=ap-south-1
COGNITO_USERPOOL_ID=your_actual_user_pool_id
COGNITO_APP_CLIENT_ID=your_actual_app_client_id

CHIME_REGION=us-east-1
CORS_ORIGINS=http://localhost:5173
```

### 1.5 Start Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```

✅ Backend will be running at: **http://localhost:8000**

Test it: `curl http://localhost:8000/health`

## 🎨 Step 2: Frontend Setup

### 2.1 Return to Root Directory

```bash
cd ..  # Back to itselfcare.com root
```

### 2.2 Install Frontend Dependencies

```bash
npm install
```

### 2.3 Configure Frontend Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 2.4 Start Frontend Dev Server

```bash
npm run dev
```

✅ Frontend will be running at: **http://localhost:5173**

## 🗄️ Step 3: DynamoDB Setup

### 3.1 Ensure Tables Exist

Check that these tables are created in your AWS account:

1. **itselfcare_theraphists**
   - PK: `theraphistId` (String)
2. **itselfcare_patients**
   - PK: `patientId` (String)
3. **itselfcare_appointments**
   - PK: `appointmentId` (String)
   - SK: `appointmentDate` (String)
   - **GSI**: `GSI_TherapistSchedule`
     - PK: `theraphistId`
     - SK: `appointmentDate`
4. **itselfcare_reviews**
   - PK: `reviewId` (String)

### 3.2 Create GSI for Appointments (Important!)

The `GSI_TherapistSchedule` is required for conflict checking:

```bash
aws dynamodb update-table \
  --table-name itselfcare_appointments \
  --attribute-definitions \
    AttributeName=theraphistId,AttributeType=S \
    AttributeName=appointmentDate,AttributeType=S \
  --global-secondary-index-updates \
    "[{\"Create\":{\"IndexName\":\"GSI_TherapistSchedule\",\"KeySchema\":[{\"AttributeName\":\"theraphistId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"appointmentDate\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}}]"
```

## 🧪 Step 4: Test the Platform

### 4.1 Open Browser

Navigate to: **http://localhost:5173**

### 4.2 Test Features

1. **View Top Therapists** (Home page)

   - Should load 3 top-rated therapists from backend
   - If tables are empty, section will show no data

2. **Register as Patient**

   - Click "E-Channeling" in navigation
   - Click "Join as Therapist" or navigate to `/echanneling/register`
   - Fill patient form and register

3. **Register as Therapist**

   - Go to `/echanneling/register`
   - Switch to "Therapist" tab
   - Fill therapist form with specialties, rate, location

4. **Login**

   - Go to `/echanneling/login`
   - Choose patient or therapist
   - Login with registered credentials (mock auth for now)

5. **Search Therapists**

   - Go to `/echanneling/find-therapist`
   - Click "Search Nearby" to use geolocation
   - Or search by specialty/name

6. **Book Appointment**
   - Click "Book Appointment" on any therapist
   - Select date, time, session type
   - Confirm booking

## 📊 Step 5: Populate Sample Data

To test with real data, create sample therapists:

```bash
curl -X POST http://localhost:8000/therapists \
  -H "Authorization: Bearer mock_token" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "therapist_001",
    "name": "Dr. Sarah Johnson",
    "email": "sarah@itselfcare.com",
    "specialties": ["Sports Injury", "Rehabilitation"],
    "languages": ["English", "Sinhala"],
    "geoLat": 6.927079,
    "geoLng": 79.861244,
    "hourlyRate": 50,
    "bio": "10 years experience in sports physiotherapy"
  }'
```

## 🔧 Common Issues & Solutions

### Issue: Backend returns CORS errors

**Solution:** Check `CORS_ORIGINS` in backend `.env` includes `http://localhost:5173`

### Issue: Frontend can't connect to backend

**Solution:** Verify `VITE_API_BASE_URL` in frontend `.env` is `http://localhost:8000`

### Issue: DynamoDB access denied

**Solution:** Check AWS credentials in `~/.aws/credentials` and IAM permissions

### Issue: GSI_TherapistSchedule not found

**Solution:** Create the GSI using the AWS CLI command in Step 3.2

### Issue: Cognito JWT validation fails

**Solution:** For development, you can temporarily disable auth checks or use mock tokens

## 📝 Key Changes from Original Request

✅ **Fixed**: Changed `appointmentsId` → `appointmentId` throughout codebase
✅ **Added**: E-Channeling section on home page with top therapists
✅ **Added**: Full therapist search and booking UI
✅ **Added**: Patient and therapist registration/login pages
✅ **Added**: Integration with backend API via `src/services/api.ts`

## 🚀 Production Deployment

### Backend (AWS Lambda with SAM)

```bash
cd itselfcare-backend
sam build
sam deploy --guided
```

### Frontend (Vercel)

```bash
# Already configured in vercel.json
vercel --prod
```

Update frontend `.env.production`:

```env
VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/prod
```

## 📚 API Documentation

Once backend is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🎯 Next Steps

1. **Implement Real Cognito Auth** - Replace mock authentication
2. **Add Payment Integration** - Stripe or similar
3. **Implement Video Calls** - Amazon Chime SDK integration
4. **Add Email Notifications** - AWS SES for booking confirmations
5. **Add Therapist Dashboard** - Schedule management, appointments
6. **Add Patient Dashboard** - View bookings, history, reviews

## 💡 Development Tips

- Use **Postman** or **Thunder Client** to test API endpoints
- Check backend logs for debugging: `tail -f app.log`
- Use React DevTools for frontend debugging
- Monitor DynamoDB in AWS Console for data verification

## 📞 Support

For issues:

1. Check backend logs in terminal
2. Check browser console for frontend errors
3. Verify AWS credentials and permissions
4. Ensure all environment variables are set

---

**Happy Coding! 🎉**
