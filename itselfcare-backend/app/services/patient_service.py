import boto3
from datetime import datetime
from typing import Dict
from fastapi import HTTPException
import json
from decimal import Decimal

from app.models.schemas import PatientCreate, PatientUpdate


def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


class PatientService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='eu-north-1')
        self.table = self.dynamodb.Table('itselfcare_patients')
    
    def create_patient(self, data: PatientCreate) -> Dict:
        """Create a new patient"""
        import uuid
        patient_id = str(uuid.uuid4())
        
        item = {
            "patientId": patient_id,
            "userId": data.userId,
            "name": data.name,
            "email": data.email,
            "phone": data.phone or "",
            "dateOfBirth": data.dateOfBirth or "",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        
        self.table.put_item(Item=item)
        return {"patientId": patient_id}
    
    def get_patient(self, patient_id: str) -> Dict:
        """Get patient by ID"""
        resp = self.table.get_item(Key={"patientId": patient_id})
        if "Item" not in resp:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        return json.loads(json.dumps(resp["Item"], default=decimal_default))
    
    def update_patient(self, patient_id: str, data: Dict) -> Dict:
        """Update patient profile"""
        update_expr = "SET updatedAt = :updated"
        expr_vals = {":updated": datetime.utcnow().isoformat()}
        expr_names = {}
        
        # Build update expression for allowed fields
        allowed_fields = ["name", "phone", "dateOfBirth", "address"]
        for field in allowed_fields:
            if field in data and data[field] is not None:
                update_expr += f", #{field} = :{field}"
                expr_vals[f":{field}"] = data[field]
                expr_names[f"#{field}"] = field
        
        try:
            self.table.update_item(
                Key={"patientId": patient_id},
                UpdateExpression=update_expr,
                ExpressionAttributeValues=expr_vals,
                ExpressionAttributeNames=expr_names if expr_names else None
            )
            return {"message": "Patient updated successfully"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
