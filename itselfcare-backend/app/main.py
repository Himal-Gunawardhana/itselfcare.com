
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# Import routers
from app.routes import therapist_routes, patient_routes, appointment_routes, review_routes, referral_routes, message_routes

# Initialize FastAPI app
app = FastAPI(
    title="ItSelfCare E-Channeling API",
    description="REST API for ItSelfCare mental health e-channeling platform",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
def health_check():
    """API health check endpoint"""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat()
    }

# Include routers
app.include_router(therapist_routes.router)
app.include_router(patient_routes.router)
app.include_router(appointment_routes.router)
app.include_router(review_routes.router)
app.include_router(referral_routes.router)
app.include_router(message_routes.router)

# Root endpoint
@app.get("/")
def read_root():
    """Welcome endpoint"""
    return {
        "message": "Welcome to ItSelfCare E-Channeling API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }
