from fastapi import APIRouter, Depends

from app.auth import optional_auth
from app.models.schemas import BookingRequest
from app.services.appointment_service import AppointmentService

router = APIRouter(prefix="/appointments", tags=["Appointments"])
appointment_service = AppointmentService()


@router.post("")
def create_appointment(req: BookingRequest, user=Depends(optional_auth)):
    """Create a new appointment with conflict checking"""
    return appointment_service.create_appointment(req)


@router.get("/{appointment_id}")
def get_appointment(appointment_id: str, user=Depends(optional_auth)):
    """Get appointment by ID"""
    return appointment_service.get_appointment(appointment_id)


@router.get("/patient/{patient_id}")
def get_patient_appointments(patient_id: str, user=Depends(optional_auth)):
    """Get all appointments for a patient"""
    return appointment_service.get_patient_appointments(patient_id)


@router.get("/therapist/{therapist_id}")
def get_therapist_appointments(therapist_id: str, user=Depends(optional_auth)):
    """Get all appointments for a therapist"""
    return appointment_service.get_therapist_appointments(therapist_id)


@router.put("/{appointment_id}")
def update_appointment_status(appointment_id: str, body: dict, user=Depends(optional_auth)):
    """Update appointment status"""
    status = body.get("status", "confirmed")
    return appointment_service.update_appointment(appointment_id, status)


@router.delete("/{appointment_id}")
def cancel_appointment(appointment_id: str, user=Depends(optional_auth)):
    """Cancel/delete an appointment"""
    return appointment_service.delete_appointment(appointment_id)
