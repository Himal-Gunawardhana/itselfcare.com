"""
Referral Routes
API endpoints for referral management, validation, and discount calculation
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.referral_service import ReferralService

router = APIRouter(prefix="/referrals", tags=["referrals"])
referral_service = ReferralService()


class GenerateReferralRequest(BaseModel):
    patientId: str


class ValidateReferralRequest(BaseModel):
    referralCode: str
    patientId: str  # The patient who is using the code (referred patient)


class ApplyReferralRequest(BaseModel):
    referralCode: str
    referredPatientId: str
    appointmentId: str
    appointmentCost: float


class CompleteReferralRequest(BaseModel):
    appointmentId: str


@router.post("/generate")
def generate_referral_code(request: GenerateReferralRequest):
    """
    Generate or retrieve referral code for a patient
    """
    try:
        result = referral_service.get_or_create_referral_code(request.patientId)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate")
def validate_referral_code(request: ValidateReferralRequest):
    """
    Validate referral code and calculate discount percentage
    """
    try:
        result = referral_service.validate_referral_code(
            request.referralCode,
            request.patientId
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/apply")
def apply_referral(request: ApplyReferralRequest):
    """
    Apply referral code to appointment and create referral record
    """
    try:
        result = referral_service.create_referral(
            request.referralCode,
            request.referredPatientId,
            request.appointmentId,
            request.appointmentCost
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{referral_id}/complete")
def complete_referral(referral_id: str):
    """
    Complete referral and award RehabX credits
    (Called after appointment is completed)
    """
    try:
        # Note: This is called via appointment completion
        # We use appointment_id to find referral, so referral_id param not used
        # Keeping for API consistency
        raise HTTPException(
            status_code=400,
            detail="Use POST /referrals/complete with appointmentId instead"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/complete")
def complete_referral_by_appointment(request: CompleteReferralRequest):
    """
    Complete referral by appointment ID and award RehabX credits
    """
    try:
        result = referral_service.complete_referral(request.appointmentId)
        if result is None:
            return {
                "message": "No pending referral found for this appointment",
                "completed": False
            }
        return {
            **result,
            "completed": True
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patient/{patient_id}")
def get_patient_referrals(patient_id: str):
    """
    Get all referrals for a patient (as referrer)
    Includes referral code, stats, and list of referrals
    """
    try:
        result = referral_service.get_patient_referrals(patient_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patient/{patient_id}/stats")
def get_referral_stats(patient_id: str):
    """
    Get quick referral stats for dashboard
    """
    try:
        result = referral_service.get_referral_stats(patient_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/calculate-discount")
def calculate_discount(appointment_cost: float, discount_percentage: int):
    """
    Calculate discount with platform fee cap (for preview)
    """
    try:
        result = referral_service.calculate_discount(appointment_cost, discount_percentage)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
