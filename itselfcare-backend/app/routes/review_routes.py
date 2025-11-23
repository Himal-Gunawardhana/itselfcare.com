from fastapi import APIRouter

from app.models.schemas import ReviewCreate
from app.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["Reviews"])
review_service = ReviewService()


@router.post("")
def create_review(body: ReviewCreate):
    """Create a new review"""
    return review_service.create_review(body)


@router.get("/therapist/{therapist_id}")
def get_therapist_reviews(therapist_id: str):
    """Get all reviews for a therapist"""
    return review_service.get_therapist_reviews(therapist_id)
