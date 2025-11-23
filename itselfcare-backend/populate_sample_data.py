#!/usr/bin/env python3
"""
Populate DynamoDB with sample data for ItselfCare E-Channeling
"""
import boto3
import uuid
from datetime import datetime, timedelta
import random

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb', region_name='eu-north-1')

# Table references
therapists_table = dynamodb.Table('itselfcare_theraphists')
patients_table = dynamodb.Table('itselfcare_patients')
appointments_table = dynamodb.Table('itselfcare_appointments')
reviews_table = dynamodb.Table('itselfcare_reviews')

print("🚀 Starting to populate sample data...\n")

# Sample Therapists Data
therapists_data = [
    {
        "name": "Dr. Sarah Johnson",
        "email": "sarah.johnson@itselfcare.com",
        "specialties": ["Sports Injury", "Rehabilitation", "Post-Surgery Recovery"],
        "languages": ["English", "Sinhala"],
        "geoLat": 6.927079,
        "geoLng": 79.861244,
        "hourlyRate": 50.0,
        "bio": "15 years of experience in sports physiotherapy. Specialized in helping athletes recover from injuries and improve performance.",
        "certifications": ["MSc in Sports Medicine", "Certified Sports Physiotherapist"]
    },
    {
        "name": "Dr. Michael Chen",
        "email": "michael.chen@itselfcare.com",
        "specialties": ["Orthopedic Physiotherapy", "Manual Therapy", "Pain Management"],
        "languages": ["English", "Tamil", "Chinese"],
        "geoLat": 6.905977,
        "geoLng": 79.851934,
        "hourlyRate": 45.0,
        "bio": "Expert in orthopedic conditions and chronic pain management. Over 12 years helping patients regain mobility.",
        "certifications": ["PhD in Physiotherapy", "Orthopedic Specialist"]
    },
    {
        "name": "Dr. Priya Perera",
        "email": "priya.perera@itselfcare.com",
        "specialties": ["Pediatric Physiotherapy", "Neurological Rehabilitation"],
        "languages": ["English", "Sinhala", "Tamil"],
        "geoLat": 6.934167,
        "geoLng": 79.849722,
        "hourlyRate": 40.0,
        "bio": "Specialized in treating children with developmental delays and neurological conditions. 10 years of dedicated service.",
        "certifications": ["Pediatric Physiotherapy Specialist", "Neuro-Rehabilitation Certified"]
    },
    {
        "name": "Dr. James Anderson",
        "email": "james.anderson@itselfcare.com",
        "specialties": ["Geriatric Care", "Balance Training", "Fall Prevention"],
        "languages": ["English"],
        "geoLat": 6.915977,
        "geoLng": 79.871234,
        "hourlyRate": 55.0,
        "bio": "Helping elderly patients maintain independence through specialized balance and mobility training.",
        "certifications": ["Geriatric Physiotherapy Specialist", "Balance Disorder Expert"]
    },
    {
        "name": "Dr. Anjali Sharma",
        "email": "anjali.sharma@itselfcare.com",
        "specialties": ["Women's Health", "Pre/Post-natal Care", "Pelvic Floor Therapy"],
        "languages": ["English", "Hindi", "Sinhala"],
        "geoLat": 6.918977,
        "geoLng": 79.855934,
        "hourlyRate": 48.0,
        "bio": "Dedicated to women's health physiotherapy with focus on pre-natal and post-natal care.",
        "certifications": ["Women's Health Specialist", "Pelvic Floor Rehabilitation Expert"]
    },
    {
        "name": "Dr. Robert Williams",
        "email": "robert.williams@itselfcare.com",
        "specialties": ["Cardiovascular Rehabilitation", "Respiratory Therapy"],
        "languages": ["English", "Sinhala"],
        "geoLat": 6.912077,
        "geoLng": 79.868244,
        "hourlyRate": 52.0,
        "bio": "Specializing in cardiac and pulmonary rehabilitation programs for optimal recovery.",
        "certifications": ["Cardiopulmonary Specialist", "Advanced Respiratory Therapist"]
    }
]

# Create therapists
therapist_ids = []
print("👨‍⚕️ Creating therapists...")
for i, therapist in enumerate(therapists_data):
    therapist_id = str(uuid.uuid4())
    therapist_ids.append(therapist_id)
    
    # Calculate geohash (simplified - using first 6 chars)
    import geohash
    full_geohash = geohash.encode(therapist["geoLat"], therapist["geoLng"], precision=9)
    geo_prefix = full_geohash[:6]
    
    item = {
        "theraphistId": therapist_id,
        "userId": f"cognito_therapist_{i}",
        "name": therapist["name"],
        "email": therapist["email"],
        "specialties": therapist["specialties"],
        "languages": therapist["languages"],
        "hourlyRate": str(therapist["hourlyRate"]),
        "geoLat": str(therapist["geoLat"]),
        "geoLng": str(therapist["geoLng"]),
        "geohash": full_geohash,
        "geoPrefix": geo_prefix,
        "bio": therapist["bio"],
        "certifications": therapist.get("certifications", []),
        "totalReviews": "0",
        "averageRating": "0",
        "createdAt": datetime.utcnow().isoformat()
    }
    
    therapists_table.put_item(Item=item)
    print(f"   ✅ Created: {therapist['name']} (ID: {therapist_id[:8]}...)")

print(f"\n✅ Created {len(therapist_ids)} therapists\n")

# Sample Patients Data
patients_data = [
    {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+94771234567",
        "dateOfBirth": "1985-05-15"
    },
    {
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "+94772345678",
        "dateOfBirth": "1990-08-22"
    },
    {
        "name": "Rajesh Kumar",
        "email": "rajesh.kumar@example.com",
        "phone": "+94773456789",
        "dateOfBirth": "1988-03-10"
    },
    {
        "name": "Emily Watson",
        "email": "emily.watson@example.com",
        "phone": "+94774567890",
        "dateOfBirth": "1992-11-05"
    }
]

# Create patients
patient_ids = []
print("👤 Creating patients...")
for i, patient in enumerate(patients_data):
    patient_id = str(uuid.uuid4())
    patient_ids.append(patient_id)
    
    item = {
        "patientId": patient_id,
        "userId": f"cognito_patient_{i}",
        "name": patient["name"],
        "email": patient["email"],
        "phone": patient["phone"],
        "dateOfBirth": patient["dateOfBirth"],
        "address": {"city": "Colombo", "country": "Sri Lanka"},
        "createdAt": datetime.utcnow().isoformat()
    }
    
    patients_table.put_item(Item=item)
    print(f"   ✅ Created: {patient['name']} (ID: {patient_id[:8]}...)")

print(f"\n✅ Created {len(patient_ids)} patients\n")

# Create sample reviews
print("⭐ Creating reviews...")
reviews_data = [
    # Reviews for Dr. Sarah Johnson
    {"therapist_idx": 0, "patient_idx": 0, "rating": 5, "comment": "Excellent therapist! Helped me recover from my knee injury in record time."},
    {"therapist_idx": 0, "patient_idx": 1, "rating": 5, "comment": "Very professional and knowledgeable. Highly recommend for sports injuries."},
    {"therapist_idx": 0, "patient_idx": 2, "rating": 4, "comment": "Great experience, very thorough in her assessments."},
    
    # Reviews for Dr. Michael Chen
    {"therapist_idx": 1, "patient_idx": 0, "rating": 5, "comment": "Amazing results with my back pain. Dr. Chen is very skilled in manual therapy."},
    {"therapist_idx": 1, "patient_idx": 3, "rating": 5, "comment": "Best physiotherapist I've ever worked with. Truly life-changing treatment."},
    
    # Reviews for Dr. Priya Perera
    {"therapist_idx": 2, "patient_idx": 1, "rating": 5, "comment": "Wonderful with children! My son's progress has been remarkable."},
    {"therapist_idx": 2, "patient_idx": 2, "rating": 5, "comment": "Very patient and caring. Excellent pediatric specialist."},
    {"therapist_idx": 2, "patient_idx": 3, "rating": 4, "comment": "Great with kids, very gentle approach."},
    
    # Reviews for Dr. James Anderson
    {"therapist_idx": 3, "patient_idx": 0, "rating": 5, "comment": "Helped my mother regain her confidence in walking. Excellent geriatric care."},
    {"therapist_idx": 3, "patient_idx": 1, "rating": 4, "comment": "Very experienced with elderly patients. Highly professional."},
    
    # Reviews for Dr. Anjali Sharma
    {"therapist_idx": 4, "patient_idx": 1, "rating": 5, "comment": "Best pre-natal physiotherapist! Made my pregnancy much more comfortable."},
    {"therapist_idx": 4, "patient_idx": 3, "rating": 5, "comment": "Exceptional care during and after pregnancy. Cannot recommend enough!"},
    
    # Reviews for Dr. Robert Williams
    {"therapist_idx": 5, "patient_idx": 0, "rating": 4, "comment": "Great cardiac rehabilitation program. Very supportive therapist."},
    {"therapist_idx": 5, "patient_idx": 2, "rating": 5, "comment": "Excellent respiratory therapy. Dr. Williams is highly skilled."},
]

for review in reviews_data:
    review_id = str(uuid.uuid4())
    therapist_id = therapist_ids[review["therapist_idx"]]
    patient_id = patient_ids[review["patient_idx"]]
    
    item = {
        "reviewId": review_id,
        "theraphistId": therapist_id,
        "patientId": patient_id,
        "appointmentId": str(uuid.uuid4()),  # Mock appointment ID
        "rating": str(review["rating"]),
        "comment": review["comment"],
        "createdAt": (datetime.utcnow() - timedelta(days=random.randint(1, 90))).isoformat()
    }
    
    reviews_table.put_item(Item=item)

print(f"   ✅ Created {len(reviews_data)} reviews")
print("\n✅ Created reviews\n")

# Update therapist ratings based on reviews
print("📊 Updating therapist ratings...")
for i, therapist_id in enumerate(therapist_ids):
    # Get all reviews for this therapist
    therapist_reviews = [r for r in reviews_data if r["therapist_idx"] == i]
    
    if therapist_reviews:
        total_rating = sum(r["rating"] for r in therapist_reviews)
        avg_rating = total_rating / len(therapist_reviews)
        
        therapists_table.update_item(
            Key={"theraphistId": therapist_id},
            UpdateExpression="SET averageRating = :avg, totalReviews = :total",
            ExpressionAttributeValues={
                ":avg": str(round(avg_rating, 2)),
                ":total": str(len(therapist_reviews))
            }
        )
        print(f"   ✅ Updated {therapists_data[i]['name']}: {avg_rating:.1f} stars ({len(therapist_reviews)} reviews)")

print("\n" + "="*60)
print("✅ Sample data population complete!")
print("="*60)
print("\n📊 Summary:")
print(f"   • {len(therapist_ids)} Therapists created")
print(f"   • {len(patient_ids)} Patients created")
print(f"   • {len(reviews_data)} Reviews created")
print(f"   • All therapist ratings updated")
print("\n🌐 You can now visit:")
print("   • http://localhost:5173 - Main website")
print("   • http://localhost:5173/echanneling - E-Channeling section")
print("   • http://localhost:5173/echanneling/find-therapist - Find therapists")
print("\n🔍 Backend API:")
print("   • http://localhost:8000/docs - API Documentation")
print("   • http://localhost:8000/therapists/top/rated?limit=10 - Get top therapists")
print("\n" + "="*60)
