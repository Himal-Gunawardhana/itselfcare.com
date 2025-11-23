from fastapi import APIRouter, Depends, HTTPException

from app.auth import verify_jwt_token
from app.models.schemas import PatientCreate
from app.services.patient_service import PatientService

router = APIRouter(prefix="/patients", tags=["Patients"])
patient_service = PatientService()


@router.post("")
def create_patient(body: PatientCreate):
    """Register a new patient (public endpoint)"""
    return patient_service.create_patient(body)


@router.get("/{patient_id}", dependencies=[Depends(verify_jwt_token)])
def get_patient(patient_id: str, user=Depends(verify_jwt_token)):
    """Get patient by ID"""
    # Verify the user is requesting their own data
    if user.get("user_type") != "patient":
        raise HTTPException(status_code=403, detail="Only patients can access patient data")
    
    return patient_service.get_patient(patient_id)


@router.put("/{patient_id}", dependencies=[Depends(verify_jwt_token)])
def update_patient(patient_id: str, body: dict, user=Depends(verify_jwt_token)):
    """Update patient profile"""
    # Verify the user is updating their own data
    if user.get("user_type") != "patient":
        raise HTTPException(status_code=403, detail="Only patients can update patient data")
    
    return patient_service.update_patient(patient_id, body)
