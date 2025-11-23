# Postman Testing Guide for ItSelfCare Backend API

## ✅ Backend Status

**Base URL**: `http://localhost:8000`
**Status**: ✅ Running on port 8000

---

## 📋 Postman Collection Setup

### Step 1: Create a New Collection

1. Open Postman
2. Click "New" → "Collection"
3. Name it: **ItSelfCare API**
4. Add Description: "ItSelfCare Backend API Testing"

### Step 2: Set Collection Variables

1. Click on your collection → "Variables" tab
2. Add these variables:
   - `base_url` = `http://localhost:8000`
   - `mock_patient_token` = `mock_patient_123`
   - `mock_therapist_token` = `mock_therapist_456`

---

## 🧪 Test Endpoints in Order

### 1. Health Check (Test First!)

**Method**: `GET`  
**URL**: `{{base_url}}/health`  
**Headers**: None  
**Body**: None

**Expected Response (200 OK)**:

```json
{
  "status": "ok",
  "timestamp": "2025-11-23T05:32:27.915328"
}
```

---

### 2. Search Nearby Therapists

**Method**: `GET`  
**URL**: `{{base_url}}/therapists/nearby/search`  
**Headers**: None  
**Params**:

- `lat` = `6.9271` (Colombo latitude)
- `lng` = `79.8612` (Colombo longitude)
- `radius` = `50` (km)
- `specialties` = `Anxiety,Depression` (optional)

**Full URL**: `{{base_url}}/therapists/nearby/search?lat=6.9271&lng=79.8612&radius=50`

**Expected Response (200 OK)**:

```json
[
  {
    "theraphistId": "0c648432-...",
    "name": "Dr. Sarah Smith",
    "email": "sarah.smith@email.com",
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

**Save theraphistId** from response for later tests!

---

### 3. Get Top Rated Therapists

**Method**: `GET`  
**URL**: `{{base_url}}/therapists/top/rated`  
**Headers**: None  
**Params**:

- `limit` = `6`

**Full URL**: `{{base_url}}/therapists/top/rated?limit=6`

**Expected Response (200 OK)**:

```json
[]
```

_(Empty array if no reviews exist yet - this is normal)_

---

### 4. Create a Patient

**Method**: `POST`  
**URL**: `{{base_url}}/patients`  
**Headers**:

- `Content-Type: application/json`
  **Body** (raw JSON):

```json
{
  "userId": "user-{{$timestamp}}",
  "name": "Test Patient",
  "email": "testpatient@example.com",
  "phone": "0771234567",
  "dateOfBirth": "1990-01-15"
}
```

**Expected Response (200 OK)**:

```json
{
  "patientId": "abc123-def456-..."
}
```

**Save patientId** from response!

**Postman Tip**: Add a test script to save the ID:

```javascript
pm.collectionVariables.set("patient_id", pm.response.json().patientId);
```

---

### 5. Get Patient Profile (With Auth)

**Method**: `GET`  
**URL**: `{{base_url}}/patients/{{patient_id}}`  
**Headers**:

- `Authorization: Bearer {{mock_patient_token}}`

**Expected Response (200 OK)**:

```json
{
  "patientId": "abc123...",
  "userId": "user-123",
  "name": "Test Patient",
  "email": "testpatient@example.com",
  "phone": "0771234567",
  "dateOfBirth": "1990-01-15",
  "createdAt": "2025-11-23T...",
  "updatedAt": "2025-11-23T..."
}
```

---

### 6. Update Patient Profile (With Auth)

**Method**: `PUT`  
**URL**: `{{base_url}}/patients/{{patient_id}}`  
**Headers**:

- `Authorization: Bearer {{mock_patient_token}}`
- `Content-Type: application/json`

**Body** (raw JSON):

```json
{
  "name": "Test Patient Updated",
  "phone": "0779876543",
  "address": "123 Main Street, Colombo 07"
}
```

**Expected Response (200 OK)**:

```json
{
  "message": "Patient updated successfully"
}
```

**Note**: Email cannot be updated (security restriction)

---

### 7. Get Therapist Profile (With Auth)

**Method**: `GET`  
**URL**: `{{base_url}}/therapists/{{therapist_id}}`  
**Headers**:

- `Authorization: Bearer {{mock_therapist_token}}`

**Use a therapist_id from search results**

**Expected Response (200 OK)**:

```json
{
  "theraphistId": "0c648432-...",
  "name": "Dr. Sarah Smith",
  "email": "sarah.smith@email.com",
  "specialties": ["Anxiety"],
  "languages": ["English"],
  "hourlyRate": 100.0,
  "bio": "Experienced therapist...",
  "geoLat": 6.9271,
  "geoLng": 79.8612,
  "createdAt": "2025-11-23T...",
  "updatedAt": "2025-11-23T..."
}
```

---

### 8. Create an Appointment

**Method**: `POST`  
**URL**: `{{base_url}}/appointments`  
**Headers**:

- `Content-Type: application/json`

**Body** (raw JSON):

```json
{
  "therapistId": "{{therapist_id}}",
  "patientId": "{{patient_id}}",
  "startTime": "2025-11-25T10:00:00",
  "endTime": "2025-11-25T11:00:00",
  "type": "video",
  "notes": "First consultation - anxiety management"
}
```

**Expected Response (200 OK)**:

```json
{
  "appointmentId": "xyz789-...",
  "status": "requested"
}
```

**Save appointmentId** from response!

**Postman Tip**: Add a test script:

```javascript
pm.collectionVariables.set("appointment_id", pm.response.json().appointmentId);
```

**Valid types**: `video`, `home`, `clinic`

---

### 9. Get Appointment by ID

**Method**: `GET`  
**URL**: `{{base_url}}/appointments/{{appointment_id}}`  
**Headers**: None (optional auth)

**Expected Response (200 OK)**:

```json
{
  "appointmentId": "xyz789-...",
  "appointmentDate": "2025-11-25T10:00:00",
  "theraphistId": "0c648432-...",
  "patientId": "abc123-...",
  "startTime": "2025-11-25T10:00:00",
  "endTime": "2025-11-25T11:00:00",
  "type": "video",
  "status": "requested",
  "notes": "First consultation - anxiety management",
  "createdAt": "2025-11-23T...",
  "updatedAt": "2025-11-23T..."
}
```

---

### 10. Update Appointment Status

**Method**: `PUT`  
**URL**: `{{base_url}}/appointments/{{appointment_id}}`  
**Headers**:

- `Content-Type: application/json`

**Body** (raw JSON):

```json
{
  "status": "confirmed"
}
```

**Expected Response (200 OK)**:

```json
{
  "message": "Appointment confirmed"
}
```

**Valid statuses**:

- `requested` - Initial state
- `confirmed` - Therapist accepted
- `cancelled` - Declined or cancelled
- `completed` - Session finished

---

### 11. Get Patient's Appointments

**Method**: `GET`  
**URL**: `{{base_url}}/appointments/patient/{{patient_id}}`  
**Headers**: None (optional auth)

**Expected Response (200 OK)**:

```json
[
  {
    "appointmentId": "xyz789-...",
    "theraphistId": "0c648432-...",
    "patientId": "abc123-...",
    "startTime": "2025-11-25T10:00:00",
    "endTime": "2025-11-25T11:00:00",
    "type": "video",
    "status": "confirmed",
    "notes": "First consultation",
    "createdAt": "2025-11-23T...",
    "updatedAt": "2025-11-23T..."
  }
]
```

---

### 12. Get Therapist's Appointments

**Method**: `GET`  
**URL**: `{{base_url}}/appointments/therapist/{{therapist_id}}`  
**Headers**: None (optional auth)

**Expected Response**: Same structure as patient appointments

---

### 13. Create a Review

**Method**: `POST`  
**URL**: `{{base_url}}/reviews`  
**Headers**:

- `Content-Type: application/json`

**Body** (raw JSON):

```json
{
  "therapistId": "{{therapist_id}}",
  "patientId": "{{patient_id}}",
  "rating": 5,
  "comment": "Excellent therapist! Very helpful and professional. Highly recommended."
}
```

**Expected Response (200 OK)**:

```json
{
  "reviewId": "review123-..."
}
```

**Rating**: Must be between 1-5

---

### 14. Get Therapist Reviews

**Method**: `GET`  
**URL**: `{{base_url}}/reviews/therapist/{{therapist_id}}`  
**Headers**: None

**Expected Response (200 OK)**:

```json
[
  {
    "reviewId": "review123-...",
    "therapistId": "0c648432-...",
    "patientId": "abc123-...",
    "rating": 5,
    "comment": "Excellent therapist!",
    "createdAt": "2025-11-23T..."
  }
]
```

---

### 15. Delete an Appointment

**Method**: `DELETE`  
**URL**: `{{base_url}}/appointments/{{appointment_id}}`  
**Headers**: None (optional auth)

**Expected Response (200 OK)**:

```json
{
  "message": "Appointment deleted"
}
```

---

## 🔧 Postman Environment Variables

Create these variables to make testing easier:

| Variable               | Initial Value           | Current Value                |
| ---------------------- | ----------------------- | ---------------------------- |
| `base_url`             | `http://localhost:8000` | -                            |
| `mock_patient_token`   | `mock_patient_123`      | -                            |
| `mock_therapist_token` | `mock_therapist_456`    | -                            |
| `patient_id`           | -                       | _(set via test script)_      |
| `therapist_id`         | -                       | _(set manually from search)_ |
| `appointment_id`       | -                       | _(set via test script)_      |

---

## 📝 Postman Test Scripts

Add these test scripts to automatically save IDs:

### For "Create Patient" Request:

```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.collectionVariables.set("patient_id", response.patientId);
  console.log("Patient ID saved:", response.patientId);
}
```

### For "Create Appointment" Request:

```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.collectionVariables.set("appointment_id", response.appointmentId);
  console.log("Appointment ID saved:", response.appointmentId);
}
```

### For "Search Nearby" Request:

```javascript
if (pm.response.code === 200) {
  const therapists = pm.response.json();
  if (therapists.length > 0) {
    pm.collectionVariables.set("therapist_id", therapists[0].theraphistId);
    console.log("Therapist ID saved:", therapists[0].theraphistId);
  }
}
```

---

## ⚠️ Common Errors and Solutions

### Error: Connection refused

**Solution**: Backend not running

```bash
cd itselfcare-backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Error: 403 Forbidden

**Solution**: Missing or invalid auth token

- Add: `Authorization: Bearer mock_patient_123`

### Error: 404 Not Found

**Solution**: Wrong endpoint or missing ID

- Check URL structure
- Verify variable is set: `{{patient_id}}`

### Error: 422 Unprocessable Entity

**Solution**: Invalid request body

- Check JSON syntax
- Verify all required fields
- Check data types (string vs number)

### Error: 409 Conflict

**Solution**: Time slot already booked

- Use different date/time for appointment

---

## 🎯 Testing Checklist

Test these scenarios:

### Public Endpoints (No Auth)

- [ ] Health check returns OK
- [ ] Search therapists by location
- [ ] Get top-rated therapists
- [ ] Create a patient account
- [ ] Create a review

### Protected Endpoints (With Auth)

- [ ] Get patient profile (patient token)
- [ ] Update patient profile (patient token)
- [ ] Get therapist profile (therapist token)
- [ ] Test with wrong token → 403 error

### Appointment Flow

- [ ] Create appointment → status "requested"
- [ ] Get appointment by ID
- [ ] Update status to "confirmed"
- [ ] Get patient's appointments list
- [ ] Get therapist's appointments list
- [ ] Delete appointment

### Review Flow

- [ ] Create a review with rating 1-5
- [ ] Get therapist reviews
- [ ] Verify top-rated endpoint shows reviewed therapists

---

## 📊 Expected Test Results

| Test                     | Expected Result                            |
| ------------------------ | ------------------------------------------ |
| Health Check             | ✅ Status 200, returns timestamp           |
| Search (Colombo)         | ✅ Status 200, returns 9 therapists        |
| Top Rated (no reviews)   | ✅ Status 200, returns empty array         |
| Create Patient           | ✅ Status 200, returns patientId           |
| Get Patient (no auth)    | ❌ Status 403 Forbidden                    |
| Get Patient (with auth)  | ✅ Status 200, returns profile             |
| Update Patient (email)   | ❌ Email field ignored (security)          |
| Create Appointment       | ✅ Status 200, returns appointmentId       |
| Duplicate Appointment    | ❌ Status 409 Conflict                     |
| Update Appointment       | ✅ Status 200, confirms update             |
| Create Review            | ✅ Status 200, returns reviewId            |
| Top Rated (after review) | ✅ Status 200, includes reviewed therapist |

---

## 🚀 Quick Start in Postman

1. **Import Collection** (optional - or create manually)
2. **Set Base URL**: `http://localhost:8000`
3. **Test Health**: `GET {{base_url}}/health`
4. **Search Therapists**: `GET {{base_url}}/therapists/nearby/search?lat=6.9271&lng=79.8612&radius=50`
5. **Copy therapist ID** from response
6. **Create Patient**: `POST {{base_url}}/patients` with JSON body
7. **Create Appointment**: `POST {{base_url}}/appointments` with therapist + patient IDs
8. **Create Review**: `POST {{base_url}}/reviews` with rating 1-5

---

## 📞 Need Help?

- **API Documentation**: See `API_DOCUMENTATION.md`
- **Quick Commands**: See `QUICK_REFERENCE.md`
- **Backend Status**: Run `curl http://localhost:8000/health`

**Current Backend Status**: ✅ Running on http://localhost:8000
