import boto3
from datetime import datetime
from typing import Optional, List, Dict
from fastapi import HTTPException
import json
from decimal import Decimal
import uuid
from boto3.dynamodb.conditions import Attr

from app.models.schemas import BookingRequest
from app.services.referral_service import ReferralService


def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


class AppointmentService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='eu-north-1')
        self.table = self.dynamodb.Table('itselfcare_appointments')
        self.patient_table = self.dynamodb.Table('itselfcare_patients')
        self.therapist_table = self.dynamodb.Table('itselfcare_theraphists')
        self.referral_service = ReferralService()
    
    def create_appointment(self, data: BookingRequest) -> Dict:
        """Create a new appointment with conflict checking"""
        # Verify patient exists
        pat_resp = self.patient_table.get_item(Key={"patientId": data.patientId})
        if "Item" not in pat_resp:
            raise HTTPException(status_code=400, detail="Patient not found")
        
        # Verify therapist exists
        t_resp = self.therapist_table.get_item(Key={"theraphistId": data.therapistId})
        if "Item" not in t_resp:
            raise HTTPException(status_code=400, detail="Therapist not found")
        
        # Check for conflicts
        existing = self.table.scan(
            FilterExpression=Attr("theraphistId").eq(data.therapistId) & Attr("startTime").eq(data.startTime)
        )
        
        if existing.get("Items"):
            raise HTTPException(
                status_code=409,
                detail="This time slot is already booked. Please choose another time."
            )
        
        appointment_id = str(uuid.uuid4())
        start_iso = data.startTime if isinstance(data.startTime, str) else data.startTime.isoformat()
        end_iso = data.endTime if isinstance(data.endTime, str) else data.endTime.isoformat()
        
        # Initialize pricing
        original_cost = data.appointmentCost or 100.0
        discount_amount = 0.0
        final_cost = original_cost
        referral_code = None
        referral_id = None
        
        # Process referral code if provided
        if data.referralCode:
            try:
                # Validate and calculate discount
                validation = self.referral_service.validate_referral_code(
                    data.referralCode,
                    data.patientId
                )
                
                # Create referral record
                referral_result = self.referral_service.create_referral(
                    data.referralCode,
                    data.patientId,
                    appointment_id,
                    original_cost
                )
                
                referral_code = data.referralCode
                referral_id = referral_result['referralId']
                discount_amount = referral_result['discountAmount']
                final_cost = referral_result['finalCost']
                
            except HTTPException as e:
                # Log referral error but don't fail booking
                print(f"Referral processing failed: {e.detail}")
        
        item = {
            "appointmentId": appointment_id,
            "appointmentDate": start_iso,  # Required sort key for DynamoDB
            "theraphistId": data.therapistId,
            "patientId": data.patientId,
            "startTime": start_iso,
            "endTime": end_iso,
            "type": data.type,
            "notes": data.notes or "",
            "status": "requested",
            "originalCost": Decimal(str(original_cost)),
            "discountApplied": Decimal(str(discount_amount)),
            "finalCost": Decimal(str(final_cost)),
            "referralCode": referral_code or "",
            "referralId": referral_id or "",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        
        self.table.put_item(Item=item)
        
        return {
            "appointmentId": appointment_id,
            "status": "requested",
            "originalCost": original_cost,
            "discountApplied": discount_amount,
            "finalCost": final_cost,
            "referralCode": referral_code
        }
    
    def get_appointment(self, appointment_id: str) -> Dict:
        """Get appointment by ID"""
        resp = self.table.scan(
            FilterExpression=Attr("appointmentId").eq(appointment_id),
        )
        items = resp.get("Items", [])
        if not items:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return json.loads(json.dumps(items[0], default=decimal_default))
    
    def get_patient_appointments(self, patient_id: str) -> List[Dict]:
        """Get all appointments for a patient"""
        resp = self.table.scan(
            FilterExpression=Attr("patientId").eq(patient_id)
        )
        items = resp.get("Items", [])
        
        # Enrich with therapist names
        enriched_items = []
        for item in items:
            appointment = json.loads(json.dumps(item, default=decimal_default))
            # Fetch therapist name
            therapist_id = appointment.get("theraphistId")
            if therapist_id:
                try:
                    therapist_resp = self.therapist_table.get_item(Key={"theraphistId": therapist_id})
                    if "Item" in therapist_resp:
                        appointment["therapistName"] = therapist_resp["Item"].get("name", "")
                except Exception as e:
                    print(f"Error fetching therapist name: {e}")
            enriched_items.append(appointment)
        
        return enriched_items
    
    def get_therapist_appointments(self, therapist_id: str) -> List[Dict]:
        """Get all appointments for a therapist"""
        resp = self.table.scan(
            FilterExpression=Attr("theraphistId").eq(therapist_id)
        )
        items = resp.get("Items", [])
        
        # Enrich with patient names
        enriched_items = []
        for item in items:
            appointment = json.loads(json.dumps(item, default=decimal_default))
            # Fetch patient name
            patient_id = appointment.get("patientId")
            if patient_id:
                try:
                    patient_resp = self.patient_table.get_item(Key={"patientId": patient_id})
                    if "Item" in patient_resp:
                        appointment["patientName"] = patient_resp["Item"].get("name", "")
                except Exception as e:
                    print(f"Error fetching patient name: {e}")
            enriched_items.append(appointment)
        
        return enriched_items
    
    def update_appointment(self, appointment_id: str, status: str) -> Dict:
        """Update appointment status"""
        # First find the appointment to get appointmentDate
        resp = self.table.scan(
            FilterExpression=Attr("appointmentId").eq(appointment_id),
        )
        items = resp.get("Items", [])
        if not items:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        appointment_date = items[0].get("appointmentDate")
        
        self.table.update_item(
            Key={"appointmentId": appointment_id, "appointmentDate": appointment_date},
            UpdateExpression="SET #status = :status, updatedAt = :updated",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={
                ":status": status,
                ":updated": datetime.utcnow().isoformat()
            }
        )
        return {"message": f"Appointment {status}"}
    
    def delete_appointment(self, appointment_id: str) -> Dict:
        """Delete/cancel an appointment"""
        # First find the appointment to get appointmentDate
        resp = self.table.scan(
            FilterExpression=Attr("appointmentId").eq(appointment_id),
        )
        items = resp.get("Items", [])
        if not items:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        appointment_date = items[0].get("appointmentDate")
        
        self.table.delete_item(Key={"appointmentId": appointment_id, "appointmentDate": appointment_date})
        return {"message": "Appointment deleted"}
