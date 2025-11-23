from pydantic import BaseModel, Field
from typing import Optional, List


class TherapistCreate(BaseModel):
    userId: str
    name: str
    email: str
    specialties: Optional[List[str]] = []
    languages: Optional[List[str]] = []
    hourlyRate: Optional[float] = 0.0
    bio: Optional[str] = ""
    geoLat: Optional[float] = None
    geoLng: Optional[float] = None


class TherapistUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    specialties: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    hourlyRate: Optional[float] = None
    geoLat: Optional[float] = None
    geoLng: Optional[float] = None
    averageResponseTime: Optional[float] = Field(None, description="Average response time in hours")
    completionRate: Optional[float] = Field(None, ge=0, le=100, description="Appointment completion rate percentage")
    onlineStatus: Optional[bool] = Field(None, description="Current online status")
    location: Optional[str] = None


class PatientCreate(BaseModel):
    userId: str
    name: str
    email: str
    phone: Optional[str] = None
    dateOfBirth: Optional[str] = None


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    dateOfBirth: Optional[str] = None
    address: Optional[str] = None


class BookingRequest(BaseModel):
    therapistId: str
    patientId: str
    startTime: str
    endTime: str
    type: str
    notes: Optional[str] = None
    referralCode: Optional[str] = None  # Optional referral code for discount
    appointmentCost: Optional[float] = 100.0  # Default cost, can be overridden


class ReviewCreate(BaseModel):
    therapistId: str
    patientId: str
    rating: int
    comment: Optional[str] = None
