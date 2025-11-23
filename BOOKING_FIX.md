# 🔧 Booking Issue Fixed - "Patient Not Found"

## Problem

When trying to book an appointment, users get "Patient not found" error.

## Root Cause

**Mock authentication doesn't store patient_id properly on login.**

### What Happens:

1. **Registration Flow** ✅ Works Correctly

   - User registers → Backend creates patient → Returns `patientId`
   - Frontend stores `patientId` in localStorage
   - Booking works fine

2. **Login Flow** ❌ Issue
   - User logs in → No backend API call (mock auth)
   - Frontend generates mock `patient_id` (e.g., "patient_1234567")
   - This mock ID doesn't exist in DynamoDB
   - Backend validation fails: "Patient not found"

## Solution

### ✅ **For Users: Use REGISTER instead of LOGIN**

If you get "Patient not found" error:

1. Go to `/echanneling/register`
2. Create a new patient account
3. This will store a valid `patientId` from the backend
4. Booking will work correctly

### 🔧 **What We Fixed**

1. **Better Error Messages** in `FindTherapist.tsx`:

   - Checks if `patient_id` exists in localStorage
   - Shows clear message directing users to register
   - Catches "Patient not found" errors and redirects to registration

2. **Updated Login Warning** in `EChannelingLogin.tsx`:
   - Alert message now warns about needing to register
   - Explains the limitation of mock authentication

## How to Test

### ✅ **Working Flow**:

```
1. Register at http://localhost:5173/echanneling/register
2. Fill in patient form (Name, Email, Phone, DOB)
3. Submit → Backend creates patient
4. Auto-logged in with valid patient_id
5. Go to http://localhost:5173/echanneling/find-therapist
6. Click "Book Appointment"
7. Select date/time/type
8. Submit → ✅ Booking succeeds!
```

### ❌ **Issue Flow** (Now Fixed with Better Errors):

```
1. Login at http://localhost:5173/echanneling/login
2. Enter email/password (mock auth)
3. Logged in but NO patient_id in database
4. Try to book appointment
5. Get clear error: "Please register to create patient profile"
6. Redirected to registration
```

## Technical Details

### Backend Validation

`itselfcare-backend/app/services/appointment_service.py:30`

```python
def create_appointment(self, data: BookingRequest) -> Dict:
    # Verify patient exists
    pat_resp = self.patient_table.get_item(Key={"patientId": data.patientId})
    if "Item" not in pat_resp:
        raise HTTPException(status_code=400, detail="Patient not found")
```

### Frontend Storage

**Registration** (Works):

```typescript
const result = await patientAPI.register({ ... });
localStorage.setItem("patient_id", result.patientId); // ✅ Valid ID from backend
```

**Login** (Issue):

```typescript
const mockUserId = "patient_" + Date.now();
localStorage.setItem("patient_id", mockUserId); // ❌ Mock ID, not in database
```

## Future Fix (Production)

For production with real authentication (AWS Cognito):

1. **After login**, fetch user profile from backend:

   ```typescript
   // Login with Cognito
   const session = await Auth.signIn(email, password);
   const token = session.idToken.jwtToken;

   // Fetch patient profile
   const patient = await patientAPI.getByEmail(email); // New endpoint needed

   // Store real IDs
   localStorage.setItem("auth_token", token);
   localStorage.setItem("patient_id", patient.patientId);
   ```

2. **Backend needs new endpoint**:
   ```python
   @router.get("/patients/by-email/{email}")
   def get_patient_by_email(email: str):
       # Query DynamoDB by email
       # Return patient profile with patientId
   ```

## Status

✅ **Fixed**: Better error handling and user guidance  
✅ **Workaround**: Users can register to get valid patient_id  
⏳ **Full Fix**: Requires implementing proper authentication flow with backend lookup

## Testing Checklist

- [x] Register new patient account
- [x] Verify `patient_id` in localStorage
- [x] Book appointment successfully
- [x] Login with mock credentials
- [x] Try to book (should show helpful error)
- [x] Error redirects to registration
- [x] Register and book again (works)

## Files Modified

1. `src/pages/echanneling/FindTherapist.tsx`

   - Added patient_id existence check
   - Better error messages
   - Auto-redirect to registration on patient not found

2. `src/pages/echanneling/EChannelingLogin.tsx`
   - Updated alert message
   - Added warning about registration requirement
   - Added user_email storage

## Summary

**Current Status**: Users must use REGISTER flow to book appointments. LOGIN flow now shows clear guidance to register instead.

**Why**: Mock authentication doesn't create backend patient records.

**Solution**: Use registration page to create valid patient profile in database.
