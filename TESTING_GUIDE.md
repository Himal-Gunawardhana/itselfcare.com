# 🎉 Frontend & Backend - Ready to Test!

**Date**: November 23, 2025  
**Status**: ✅ Both servers running successfully

---

## ✅ Server Status

### Backend (Port 8000)

```
Status: ✅ Running
URL: http://localhost:8000
Health: OK
Database: 9 therapists loaded
```

### Frontend (Port 5173)

```
Status: ✅ Running
URL: http://localhost:5173
Build: Successful
API Integration: Complete
```

---

## 🔗 Quick Access Links

### Frontend

- **Home**: http://localhost:5173/
- **Find Therapist**: http://localhost:5173/echanneling/find-therapist
- **Register**: http://localhost:5173/echanneling/register
- **Login**: http://localhost:5173/echanneling/login

### Backend API

- **Health Check**: http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs (FastAPI auto-generated)
- **Search Therapists**: http://localhost:8000/therapists/nearby/search?lat=6.9271&lng=79.8612&radius=50

---

## 🧪 Testing Workflow

### 1. Test Public Features (No Login Required)

#### A. Browse Therapists

1. Go to: http://localhost:5173/
2. Scroll to "Featured Therapists" section
3. Click "Find Therapists" button
4. **Expected**: See list of 9 therapists from database

#### B. Search Nearby Therapists

1. Go to: http://localhost:5173/echanneling/find-therapist
2. Click "Search Nearby" button
3. Allow location access when prompted
4. **Expected**: Therapists sorted by distance from your location

#### C. View Therapist Details

1. On Find Therapist page
2. Click on any therapist card
3. **Expected**: See full details (specialties, languages, bio, rate)

---

### 2. Test Patient Registration & Login

#### A. Register as Patient

1. Go to: http://localhost:5173/echanneling/register
2. Select "Patient" tab
3. Fill in the form:
   - Name: Test Patient
   - Email: patient@test.com
   - Phone: 0771234567
   - Date of Birth: 1990-01-15
   - Password: password123
4. Click "Register"
5. **Expected**: Registration success, redirected to login

#### B. Login as Patient

1. Go to: http://localhost:5173/echanneling/login
2. Enter credentials:
   - Email: patient@test.com
   - Password: password123
3. **Expected**: Logged in, redirected to Patient Dashboard

---

### 3. Test Booking Appointment

#### A. Book Appointment (Logged in as Patient)

1. Go to: http://localhost:5173/echanneling/find-therapist
2. Click "Book Appointment" on any therapist
3. Fill booking form:
   - Date: Tomorrow's date
   - Time: 10:00
   - Type: Video Consultation
   - Notes: First consultation
4. Click "Confirm Booking"
5. **Expected**: Success message, appointment created

#### B. View Appointments

1. Stay logged in as patient
2. Go to Dashboard (click profile icon)
3. **Expected**: See your booked appointment listed

---

### 4. Test Therapist Registration & Login

#### A. Register as Therapist

1. Open new incognito/private window
2. Go to: http://localhost:5173/echanneling/register
3. Select "Therapist" tab
4. Fill in the form:
   - Name: Dr. Test Therapist
   - Email: therapist@test.com
   - Specialties: Add "Sports Injury", "Rehabilitation"
   - Languages: Add "English", "Sinhala"
   - Hourly Rate: 100
   - Bio: Experienced physiotherapist
   - License Number: LIC12345
   - Years of Experience: 5
   - Password: password123
5. Click "Register"
6. **Expected**: Registration success

#### B. Login as Therapist

1. Login with therapist@test.com / password123
2. **Expected**: Redirected to Therapist Dashboard

---

### 5. Test Therapist Dashboard

#### A. View Appointments

1. Logged in as therapist
2. Go to Dashboard
3. **Expected**: See pending, upcoming, and past appointments

#### B. Manage Appointments

1. Find a pending appointment
2. Click "Accept" or "Decline"
3. **Expected**: Appointment status updates

#### C. Edit Profile

1. Click "Edit Profile" button
2. Update bio or hourly rate
3. Save changes
4. **Expected**: Profile updated successfully

---

### 6. Test Patient Profile

#### A. View Profile

1. Logged in as patient
2. Click profile icon → "Profile"
3. **Expected**: See your patient details

#### B. Edit Profile

1. Click "Edit Profile"
2. Update name or phone number
3. Save changes
4. **Expected**: Profile updated (email cannot be changed)

---

## 🐛 Testing Checklist

### Public Features (No Auth)

- [ ] Homepage loads correctly
- [ ] Featured therapists displayed
- [ ] Find Therapist page shows all therapists
- [ ] Search by name works
- [ ] Search nearby with geolocation works
- [ ] Therapist cards show correct information
- [ ] Registration page accessible

### Patient Features

- [ ] Patient registration works
- [ ] Patient login works
- [ ] Patient dashboard loads
- [ ] Can view appointments
- [ ] Can book new appointment
- [ ] Can cancel appointment
- [ ] Can edit profile (except email)
- [ ] Logout works

### Therapist Features

- [ ] Therapist registration works
- [ ] Therapist login works
- [ ] Therapist dashboard loads
- [ ] Can view pending appointments
- [ ] Can accept/decline appointments
- [ ] Can view upcoming appointments
- [ ] Can edit profile
- [ ] Logout works

### API Integration

- [ ] Search nearby returns results
- [ ] Top-rated therapists displayed
- [ ] Appointment booking creates record
- [ ] Profile updates persist
- [ ] Authentication tokens work
- [ ] Error messages display properly

---

## 🔍 What to Check

### 1. Visual/UI

- ✅ All components render correctly
- ✅ No console errors
- ✅ Responsive design works on mobile
- ✅ Loading states show properly
- ✅ Buttons and links work

### 2. Data Flow

- ✅ Therapists load from backend
- ✅ Appointments save to database
- ✅ Profile updates persist
- ✅ Search filters work
- ✅ Authentication state maintained

### 3. Error Handling

- ✅ Network errors show user-friendly messages
- ✅ Form validation works
- ✅ Invalid credentials rejected
- ✅ Unauthorized access blocked

---

## 🎯 Test Scenarios

### Scenario 1: Patient Books Appointment

```
1. Register/Login as patient
2. Search for therapist
3. Select therapist
4. Book appointment
5. View in dashboard
6. Verify in backend database
```

### Scenario 2: Therapist Manages Appointments

```
1. Register/Login as therapist
2. View pending appointments
3. Accept appointment
4. Check status changed
5. View in upcoming section
```

### Scenario 3: Search & Filter

```
1. Go to Find Therapist
2. Search by name
3. Search by specialty
4. Use geolocation
5. Verify results correct
```

---

## 📊 Expected Data

### Therapists in Database: 9

You should see therapists with:

- Names, specialties, languages
- Hourly rates ($80-$150)
- Bios and experience
- Geo coordinates for distance calculation

### Appointment Statuses

- `requested` - Initial state after booking
- `confirmed` - Therapist accepted
- `cancelled` - Either party cancelled
- `completed` - Session finished

---

## 🔧 Developer Tools

### Check Browser Console

```
Open Chrome DevTools (F12)
Check Console tab for errors
Check Network tab for API calls
```

### Check API Responses

```
Network tab → XHR/Fetch
Click any request
Check Response tab for data
```

### Check localStorage

```
Application tab → Local Storage
Should see: auth_token, patient_id/therapist_id, user_type
```

---

## 🚨 Common Issues & Solutions

### Issue: "Please login to book"

**Solution**: Make sure you're logged in as a patient

### Issue: "Therapists not loading"

**Solution**: Check backend is running: `curl http://localhost:8000/health`

### Issue: "Geolocation not working"

**Solution**: Allow location permission in browser

### Issue: "Booking failed"

**Solution**:

- Check date/time is in future
- Verify you're logged in
- Check browser console for error

### Issue: "Profile won't update"

**Solution**:

- Check you're updating allowed fields only
- Email cannot be changed
- Verify auth token is valid

---

## 📱 Mobile Testing

1. Open: http://192.168.8.200:5173/ on your phone
2. Make sure phone is on same WiFi network
3. Test all features work on mobile

---

## 🎉 Success Criteria

Your integration is working if:

✅ All 9 therapists display correctly  
✅ Can register as patient/therapist  
✅ Can login with correct credentials  
✅ Can book appointment as patient  
✅ Can manage appointments as therapist  
✅ Can update profiles  
✅ Search and filters work  
✅ No console errors  
✅ Data persists after refresh

---

## 📝 Test Account Credentials

### Demo Patient

```
Email: demo_patient@test.com
Password: password123
Token: mock_patient_demo
```

### Demo Therapist

```
Email: demo_therapist@test.com
Password: password123
Token: mock_therapist_demo
```

---

## 🔗 Documentation References

- **API Documentation**: `itselfcare-backend/API_DOCUMENTATION.md`
- **Frontend Integration**: `FRONTEND_INTEGRATION_GUIDE.md`
- **Backend Summary**: `itselfcare-backend/BACKEND_SUMMARY.md`
- **Integration Status**: `INTEGRATION_STATUS.md`

---

## 🎬 Start Testing Now!

1. **Open Browser**: http://localhost:5173/
2. **Start with**: Homepage → Find Therapist
3. **Then test**: Registration → Login → Booking
4. **Check**: Dashboard → Profile → Appointments

---

**Happy Testing! 🚀**

If you find any issues, check the browser console and backend logs:

```bash
# Frontend logs
tail -f /tmp/vite.log

# Backend logs
tail -f /tmp/uvicorn.log
```
