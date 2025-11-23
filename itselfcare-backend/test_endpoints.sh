#!/bin/bash

# Backend API Test Script
BASE_URL="http://localhost:8000"

echo "================================"
echo "ITSELFCARE BACKEND API TESTS"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Health Check
echo "1. TESTING HEALTH CHECK"
echo "   GET /health"
curl -s "$BASE_URL/health" | python -m json.tool
echo ""
echo ""

# Test Search Nearby Therapists
echo "2. TESTING SEARCH NEARBY THERAPISTS"
echo "   GET /therapists/nearby/search?lat=6.9271&lng=79.8612&radius=50"
curl -s "$BASE_URL/therapists/nearby/search?lat=6.9271&lng=79.8612&radius=50" | python -m json.tool | head -50
echo "   ... (showing first 50 lines)"
echo ""
echo ""

# Test Top Rated Therapists
echo "3. TESTING TOP RATED THERAPISTS"
echo "   GET /therapists/top/rated?limit=6"
curl -s "$BASE_URL/therapists/top/rated?limit=6" | python -m json.tool
echo ""
echo ""

# Test Get Specific Therapist (using first therapist from search)
echo "4. TESTING GET SPECIFIC THERAPIST"
THERAPIST_ID=$(curl -s "$BASE_URL/therapists/nearby/search?lat=6.9271&lng=79.8612&radius=50" | python -c "import sys, json; data=json.load(sys.stdin); print(data[0]['theraphistId'] if data else '')")
if [ -n "$THERAPIST_ID" ]; then
    echo "   GET /therapists/$THERAPIST_ID (with mock auth)"
    curl -s -H "Authorization: Bearer mock_therapist_123" "$BASE_URL/therapists/$THERAPIST_ID" | python -m json.tool
else
    echo -e "${RED}   No therapists found in database${NC}"
fi
echo ""
echo ""

# Test Create Review
echo "5. TESTING CREATE REVIEW"
if [ -n "$THERAPIST_ID" ]; then
    echo "   POST /reviews"
    curl -s -X POST "$BASE_URL/reviews" \
        -H "Content-Type: application/json" \
        -d '{
            "therapistId": "'$THERAPIST_ID'",
            "patientId": "test-patient-123",
            "rating": 5,
            "comment": "Excellent therapist! Very helpful and professional."
        }' | python -m json.tool
else
    echo -e "${RED}   Skipped (no therapist ID)${NC}"
fi
echo ""
echo ""

# Test Get Reviews for Therapist
echo "6. TESTING GET THERAPIST REVIEWS"
if [ -n "$THERAPIST_ID" ]; then
    echo "   GET /reviews/therapist/$THERAPIST_ID"
    curl -s "$BASE_URL/reviews/therapist/$THERAPIST_ID" | python -m json.tool
else
    echo -e "${RED}   Skipped (no therapist ID)${NC}"
fi
echo ""
echo ""

# Test Create Patient
echo "7. TESTING CREATE PATIENT"
echo "   POST /patients"
PATIENT_RESPONSE=$(curl -s -X POST "$BASE_URL/patients" \
    -H "Content-Type: application/json" \
    -d '{
        "userId": "test-user-'$(date +%s)'",
        "name": "Test Patient",
        "email": "testpatient@example.com",
        "phone": "1234567890",
        "dateOfBirth": "1990-01-15"
    }')
echo "$PATIENT_RESPONSE" | python -m json.tool
PATIENT_ID=$(echo "$PATIENT_RESPONSE" | python -c "import sys, json; data=json.load(sys.stdin); print(data.get('patientId', ''))")
echo ""
echo ""

# Test Get Patient
echo "8. TESTING GET PATIENT"
if [ -n "$PATIENT_ID" ]; then
    echo "   GET /patients/$PATIENT_ID (with mock auth)"
    curl -s -H "Authorization: Bearer mock_patient_123" "$BASE_URL/patients/$PATIENT_ID" | python -m json.tool
else
    echo -e "${RED}   Skipped (patient creation failed)${NC}"
fi
echo ""
echo ""

# Test Update Patient
echo "9. TESTING UPDATE PATIENT"
if [ -n "$PATIENT_ID" ]; then
    echo "   PUT /patients/$PATIENT_ID"
    curl -s -X PUT "$BASE_URL/patients/$PATIENT_ID" \
        -H "Authorization: Bearer mock_patient_123" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Patient Updated",
            "phone": "9876543210",
            "address": "123 Test Street, Colombo"
        }' | python -m json.tool
else
    echo -e "${RED}   Skipped (no patient ID)${NC}"
fi
echo ""
echo ""

# Test Create Appointment
echo "10. TESTING CREATE APPOINTMENT"
if [ -n "$THERAPIST_ID" ] && [ -n "$PATIENT_ID" ]; then
    echo "   POST /appointments"
    APPOINTMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/appointments" \
        -H "Content-Type: application/json" \
        -d '{
            "therapistId": "'$THERAPIST_ID'",
            "patientId": "'$PATIENT_ID'",
            "startTime": "2025-11-25T10:00:00",
            "endTime": "2025-11-25T11:00:00",
            "type": "video",
            "notes": "First consultation - test appointment"
        }')
    echo "$APPOINTMENT_RESPONSE" | python -m json.tool
    APPOINTMENT_ID=$(echo "$APPOINTMENT_RESPONSE" | python -c "import sys, json; data=json.load(sys.stdin); print(data.get('appointmentId', ''))")
else
    echo -e "${RED}   Skipped (missing therapist or patient ID)${NC}"
fi
echo ""
echo ""

# Test Get Appointment
echo "11. TESTING GET APPOINTMENT"
if [ -n "$APPOINTMENT_ID" ]; then
    echo "   GET /appointments/$APPOINTMENT_ID"
    curl -s "$BASE_URL/appointments/$APPOINTMENT_ID" | python -m json.tool
else
    echo -e "${RED}   Skipped (appointment creation failed)${NC}"
fi
echo ""
echo ""

# Test Update Appointment Status
echo "12. TESTING UPDATE APPOINTMENT STATUS"
if [ -n "$APPOINTMENT_ID" ]; then
    echo "   PUT /appointments/$APPOINTMENT_ID"
    curl -s -X PUT "$BASE_URL/appointments/$APPOINTMENT_ID" \
        -H "Content-Type: application/json" \
        -d '{"status": "confirmed"}' | python -m json.tool
else
    echo -e "${RED}   Skipped (no appointment ID)${NC}"
fi
echo ""
echo ""

# Test Get Patient Appointments
echo "13. TESTING GET PATIENT APPOINTMENTS"
if [ -n "$PATIENT_ID" ]; then
    echo "   GET /appointments/patient/$PATIENT_ID"
    curl -s "$BASE_URL/appointments/patient/$PATIENT_ID" | python -m json.tool
else
    echo -e "${RED}   Skipped (no patient ID)${NC}"
fi
echo ""
echo ""

# Test Get Therapist Appointments
echo "14. TESTING GET THERAPIST APPOINTMENTS"
if [ -n "$THERAPIST_ID" ]; then
    echo "   GET /appointments/therapist/$THERAPIST_ID"
    curl -s "$BASE_URL/appointments/therapist/$THERAPIST_ID" | python -m json.tool
else
    echo -e "${RED}   Skipped (no therapist ID)${NC}"
fi
echo ""
echo ""

echo "================================"
echo "TEST SUMMARY"
echo "================================"
echo -e "${GREEN}All available endpoints tested${NC}"
echo ""
echo "IDs used in tests:"
[ -n "$THERAPIST_ID" ] && echo "  Therapist ID: $THERAPIST_ID"
[ -n "$PATIENT_ID" ] && echo "  Patient ID: $PATIENT_ID"
[ -n "$APPOINTMENT_ID" ] && echo "  Appointment ID: $APPOINTMENT_ID"
echo ""
echo "Note: Some tests may have been skipped if prerequisites weren't met."
echo ""

