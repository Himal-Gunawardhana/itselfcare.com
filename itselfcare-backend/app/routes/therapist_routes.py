from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List

from app.auth import verify_jwt_token
from app.models.schemas import TherapistCreate, TherapistUpdate
from app.services.therapist_service import TherapistService

router = APIRouter(prefix="/therapists", tags=["Therapists"])
therapist_service = TherapistService()


@router.post("")
def create_therapist(body: TherapistCreate):
    """Register a new therapist (public endpoint)"""
    return therapist_service.create_therapist(body)


@router.get("/nearby/search")
def search_nearby_therapists(
    lat: float,
    lng: float,
    radius: Optional[float] = 50,
    specialties: Optional[str] = None
):
    """Search for therapists near a location"""
    spec_list = specialties.split(",") if specialties else None
    return therapist_service.search_nearby(lat, lng, radius, spec_list)


@router.get("/top/rated")
def get_top_rated_therapists(limit: Optional[int] = 10):
    """Get top-rated therapists"""
    return therapist_service.get_top_rated(limit)


@router.get("/{therapist_id}", dependencies=[Depends(verify_jwt_token)])
def get_therapist(therapist_id: str, user=Depends(verify_jwt_token)):
    """Get therapist by ID"""
    # Verify the user is requesting their own data
    if user.get("user_type") != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can access therapist data")
    
    return therapist_service.get_therapist(therapist_id)


@router.put("/{therapist_id}", dependencies=[Depends(verify_jwt_token)])
def update_therapist(therapist_id: str, body: TherapistUpdate, user=Depends(verify_jwt_token)):
    """Update therapist profile"""
    # Verify the user is updating their own data
    if user.get("user_type") != "therapist":
        raise HTTPException(status_code=403, detail="Only therapists can update therapist data")
    
    return therapist_service.update_therapist(therapist_id, body)
