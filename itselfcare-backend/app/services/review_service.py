import boto3
from datetime import datetime
from typing import List, Dict
from fastapi import HTTPException
import json
from decimal import Decimal
import uuid

from app.models.schemas import ReviewCreate


def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


class ReviewService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='eu-north-1')
        self.table = self.dynamodb.Table('itselfcare_reviews')
    
    def create_review(self, data: ReviewCreate) -> Dict:
        """Create a new review"""
        review_id = str(uuid.uuid4())
        
        item = {
            "reviewId": review_id,
            "therapistId": data.therapistId,
            "patientId": data.patientId,
            "rating": data.rating,
            "comment": data.comment or "",
            "createdAt": datetime.utcnow().isoformat()
        }
        
        self.table.put_item(Item=item)
        return {"reviewId": review_id}
    
    def get_therapist_reviews(self, therapist_id: str) -> List[Dict]:
        """Get all reviews for a therapist"""
        resp = self.table.scan(
            FilterExpression="therapistId = :tid",
            ExpressionAttributeValues={":tid": therapist_id}
        )
        items = resp.get("Items", [])
        return [json.loads(json.dumps(item, default=decimal_default)) for item in items]
