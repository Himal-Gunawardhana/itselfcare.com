import boto3
from datetime import datetime
from typing import Optional, Dict, List
from fastapi import HTTPException
import json
from decimal import Decimal

from app.models.schemas import TherapistCreate, TherapistUpdate


def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, (set, frozenset)):
        return list(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


class TherapistService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='eu-north-1')
        self.table = self.dynamodb.Table('itselfcare_theraphists')
    
    def create_therapist(self, data: TherapistCreate) -> Dict:
        """Create a new therapist"""
        import uuid
        therapist_id = str(uuid.uuid4())
        
        item = {
            "theraphistId": therapist_id,
            "userId": data.userId,
            "name": data.name,
            "email": data.email,
            "specialties": data.specialties or [],
            "languages": data.languages or [],
            "hourlyRate": Decimal(str(data.hourlyRate)) if data.hourlyRate else Decimal('0'),
            "bio": data.bio or "",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        
        if data.geoLat is not None and data.geoLng is not None:
            item["geoLat"] = Decimal(str(data.geoLat))
            item["geoLng"] = Decimal(str(data.geoLng))
        
        self.table.put_item(Item=item)
        return {"theraphistId": therapist_id}
    
    def get_therapist(self, therapist_id: str) -> Dict:
        """Get therapist by ID"""
        resp = self.table.get_item(Key={"theraphistId": therapist_id})
        if "Item" not in resp:
            raise HTTPException(status_code=404, detail="Therapist not found")
        
        return json.loads(json.dumps(resp["Item"], default=decimal_default))
    
    def update_therapist(self, therapist_id: str, data: TherapistUpdate) -> Dict:
        """Update therapist profile"""
        update_expr = "SET updatedAt = :updated"
        expr_vals = {":updated": datetime.utcnow().isoformat()}
        expr_names = {}
        
        update_fields = {
            "name": data.name,
            "bio": data.bio,
            "specialties": data.specialties,
            "languages": data.languages,
            "hourlyRate": data.hourlyRate,
            "geoLat": data.geoLat,
            "geoLng": data.geoLng,
            "location": data.location
        }
        
        for field, value in update_fields.items():
            if value is not None:
                update_expr += f", #{field} = :{field}"
                expr_vals[f":{field}"] = Decimal(str(value)) if isinstance(value, (int, float)) else value
                expr_names[f"#{field}"] = field
        
        try:
            self.table.update_item(
                Key={"theraphistId": therapist_id},
                UpdateExpression=update_expr,
                ExpressionAttributeValues=expr_vals,
                ExpressionAttributeNames=expr_names if expr_names else None
            )
            return {"message": "Therapist updated successfully"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def search_nearby(self, lat: float, lng: float, radius_km: float = 50, specialties: Optional[List[str]] = None) -> List[Dict]:
        """Search for therapists near a location"""
        from math import radians, cos, sin, asin, sqrt
        
        def haversine(lon1, lat1, lon2, lat2):
            lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
            c = 2 * asin(sqrt(a))
            km = 6371 * c
            return km
        
        resp = self.table.scan()
        results = []
        
        for item in resp.get("Items", []):
            if "geoLat" in item and "geoLng" in item:
                distance = haversine(lng, lat, float(item["geoLng"]), float(item["geoLat"]))
                if distance <= radius_km:
                    if specialties:
                        item_specs = set(item.get("specialties", []))
                        if not item_specs.intersection(set(specialties)):
                            continue
                    
                    # Convert item first, then add distance
                    converted_item = json.loads(json.dumps(item, default=decimal_default))
                    converted_item["distance"] = round(distance, 2)
                    results.append(converted_item)
        
        results.sort(key=lambda x: x["distance"])
        return results
    
    def get_top_rated(self, limit: int = 10) -> List[Dict]:
        """Get top-rated therapists (includes all therapists, sorted by rating)"""
        reviews_table = self.dynamodb.Table('itselfcare_reviews')
        reviews_resp = reviews_table.scan()
        
        # Build ratings map
        ratings_map = {}
        for review in reviews_resp.get("Items", []):
            tid = review.get("therapistId")
            if not tid:
                continue
            if tid not in ratings_map:
                ratings_map[tid] = []
            ratings_map[tid].append(float(review.get("rating", 0)))
        
        # Calculate average ratings for therapists with reviews
        avg_ratings = {}
        for tid, ratings_list in ratings_map.items():
            avg_ratings[tid] = sum(ratings_list) / len(ratings_list)
        
        # Get ALL therapists from table
        all_therapists_resp = self.table.scan()
        all_therapists = []
        
        for item in all_therapists_resp.get("Items", []):
            try:
                t_item = json.loads(json.dumps(item, default=decimal_default))
                tid = t_item.get("theraphistId")
                
                if tid in avg_ratings:
                    # Therapist has reviews
                    t_item["averageRating"] = round(avg_ratings[tid], 2)
                    t_item["reviewCount"] = len(ratings_map[tid])
                else:
                    # New therapist without reviews
                    t_item["averageRating"] = 0.0
                    t_item["reviewCount"] = 0
                
                all_therapists.append(t_item)
            except Exception as e:
                print(f"Error processing therapist: {e}")
                continue
        
        # Sort by rating (highest first), then by creation date (newest first for same rating)
        all_therapists.sort(key=lambda x: (x.get("averageRating", 0), x.get("createdAt", "")), reverse=True)
        
        return all_therapists[:limit]
