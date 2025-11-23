# ItSelfCare Backend - Quick Reference

## 🚀 Start/Stop Servers

### Backend (Port 8000)

```bash
# Start
cd itselfcare-backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Start in background
nohup uvicorn app.main:app --reload --port 8000 > /tmp/uvicorn.log 2>&1 &

# Check status
curl http://localhost:8000/health

# View logs
tail -f /tmp/uvicorn.log

# Stop
lsof -ti:8000 | xargs kill -9
```

### Frontend (Port 5173)

```bash
# Start
npm run dev

# Start in background
nohup npm run dev > /tmp/vite.log 2>&1 &

# Check status
lsof -ti:5173

# Stop
lsof -ti:5173 | xargs kill -9
```

## 📋 API Quick Test Commands

### Health Check

```bash
curl http://localhost:8000/health
```

### Search Therapists (Colombo area)

```bash
curl 'http://localhost:8000/therapists/nearby/search?lat=6.9271&lng=79.8612&radius=50'
```

### Top Rated Therapists

```bash
curl 'http://localhost:8000/therapists/top/rated?limit=6'
```

### Create Patient

```bash
curl -X POST http://localhost:8000/patients \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "dateOfBirth": "1990-01-15"
  }'
```

### Get Patient (with Auth)

```bash
curl -H "Authorization: Bearer mock_patient_123" \
  http://localhost:8000/patients/{patient_id}
```

### Create Appointment

```bash
curl -X POST http://localhost:8000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "therapistId": "therapist-uuid",
    "patientId": "patient-uuid",
    "startTime": "2025-11-25T10:00:00",
    "endTime": "2025-11-25T11:00:00",
    "type": "video",
    "notes": "First consultation"
  }'
```

## 🧪 Automated Testing

### Run All Tests

```bash
cd itselfcare-backend
./test_endpoints.sh
```

## 📚 Documentation Files

- **API_DOCUMENTATION.md** - Complete API reference with all endpoints
- **BACKEND_SUMMARY.md** - Architecture overview and setup guide
- **QUICK_REFERENCE.md** - This file (quick commands)
- **test_endpoints.sh** - Automated test script

## 🗂️ Project Structure

```
app/
├── main.py                   # FastAPI app initialization
├── auth.py                   # JWT authentication
├── models/schemas.py         # Pydantic data models
├── services/                 # Business logic layer
│   ├── therapist_service.py
│   ├── patient_service.py
│   ├── appointment_service.py
│   └── review_service.py
└── routes/                   # API endpoints
    ├── therapist_routes.py
    ├── patient_routes.py
    ├── appointment_routes.py
    └── review_routes.py
```

## 🔑 Mock Authentication Tokens

For development/testing:

- Patient: `mock_patient_123` (or any suffix)
- Therapist: `mock_therapist_456` (or any suffix)

## 📊 API Endpoint Count

- **Therapist Endpoints**: 5
- **Patient Endpoints**: 3
- **Appointment Endpoints**: 6
- **Review Endpoints**: 2
- **Total**: 16 endpoints

## ⚠️ Important Notes

1. **Field Naming**: `theraphistId` (with 'h') - intentional for DynamoDB consistency
2. **CORS**: Configured for `http://localhost:5173`
3. **Mock Auth**: Development mode - accepts mock tokens
4. **Decimal Handling**: All DynamoDB Decimals auto-converted to float

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

### Module Not Found Error

```bash
# Make sure virtual environment is activated
cd itselfcare-backend
source venv/bin/activate
```

### AWS Credentials

```bash
# Check AWS config
aws configure list

# Test DynamoDB access
aws dynamodb list-tables --region eu-north-1
```

### Check Backend Logs

```bash
# If running in background
tail -f /tmp/uvicorn.log

# Or backend.log in project directory
tail -f backend.log
```

## 📈 Next Steps

1. ✅ Backend finalized and documented
2. ⏳ Test all endpoints (run `./test_endpoints.sh`)
3. ⏳ Review API documentation
4. ⏳ Fix frontend integration
5. ⏳ End-to-end testing

---

**Quick Links:**

- Full API Docs: `API_DOCUMENTATION.md`
- Architecture: `BACKEND_SUMMARY.md`
- Test Script: `./test_endpoints.sh`
