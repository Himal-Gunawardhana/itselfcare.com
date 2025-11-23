"""
Referral Service
Handles referral code generation, validation, discount calculation, and RehabX credit awards
"""

import boto3
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from fastapi import HTTPException
from decimal import Decimal
import random
import string

class ReferralService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='eu-north-1')
        self.referral_table = self.dynamodb.Table('itselfcare_referrals')
        self.patient_table = self.dynamodb.Table('itselfcare_patients')
        
    def _generate_referral_code(self, patient_name: str) -> str:
        """Generate unique referral code based on patient name"""
        # Take first 3 letters of name + 4 random chars
        prefix = ''.join(filter(str.isalpha, patient_name.upper()))[:3]
        if len(prefix) < 3:
            prefix = prefix + 'ITS'[:3-len(prefix)]
        
        # Try up to 10 times to generate unique code
        for _ in range(10):
            suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
            code = f"{prefix}{suffix}"
            
            # Check if code exists
            try:
                response = self.referral_table.query(
                    IndexName='referralCode-index',
                    KeyConditionExpression='referralCode = :code',
                    ExpressionAttributeValues={':code': code},
                    Limit=1
                )
                if not response.get('Items'):
                    return code
            except Exception:
                return code
                
        # Fallback to timestamp-based code
        timestamp = str(int(datetime.now().timestamp()))[-6:]
        return f"{prefix}{timestamp}"
    
    def get_or_create_referral_code(self, patient_id: str) -> Dict:
        """Get existing or create new referral code for patient"""
        try:
            # Check if patient already has referral code
            patient_response = self.patient_table.get_item(Key={"patientId": patient_id})
            if "Item" not in patient_response:
                raise HTTPException(status_code=404, detail="Patient not found")
            
            patient = patient_response["Item"]
            
            # If patient already has code, return it
            if "referralCode" in patient and patient["referralCode"]:
                return {
                    "referralCode": patient["referralCode"],
                    "patientId": patient_id,
                    "expiresAt": (datetime.now() + timedelta(days=365)).isoformat()
                }
            
            # Generate new code
            referral_code = self._generate_referral_code(patient.get("name", "Patient"))
            
            # Update patient with referral code
            self.patient_table.update_item(
                Key={"patientId": patient_id},
                UpdateExpression="SET referralCode = :code, rehabXCredits = if_not_exists(rehabXCredits, :zero)",
                ExpressionAttributeValues={
                    ":code": referral_code,
                    ":zero": 0
                }
            )
            
            return {
                "referralCode": referral_code,
                "patientId": patient_id,
                "expiresAt": (datetime.now() + timedelta(days=365)).isoformat()
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating referral code: {str(e)}")
    
    def validate_referral_code(self, referral_code: str, referred_patient_id: str) -> Dict:
        """Validate referral code and calculate discount"""
        try:
            # Find referrer by code
            response = self.patient_table.scan(
                FilterExpression='referralCode = :code',
                ExpressionAttributeValues={':code': referral_code}
            )
            
            if not response.get('Items'):
                raise HTTPException(status_code=404, detail="Invalid referral code")
            
            referrer = response['Items'][0]
            referrer_patient_id = referrer['patientId']
            
            # Can't use own referral code
            if referrer_patient_id == referred_patient_id:
                raise HTTPException(status_code=400, detail="Cannot use your own referral code")
            
            # Check if referred patient already used this code
            existing = self.referral_table.scan(
                FilterExpression='referralCode = :code AND referredPatientId = :pid',
                ExpressionAttributeValues={
                    ':code': referral_code,
                    ':pid': referred_patient_id
                }
            )
            
            if existing.get('Items'):
                raise HTTPException(status_code=400, detail="You have already used this referral code")
            
            # Count completed referrals for this referrer
            completed_response = self.referral_table.query(
                IndexName='referrerPatientId-status-index',
                KeyConditionExpression='referrerPatientId = :pid AND #status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':pid': referrer_patient_id,
                    ':status': 'completed'
                }
            )
            
            completed_count = len(completed_response.get('Items', []))
            
            # Calculate discount: 5% per completed referral, max 25%
            discount_percentage = min(completed_count * 5, 25)
            
            return {
                "valid": True,
                "referrerPatientId": referrer_patient_id,
                "referrerName": referrer.get('name', 'Unknown'),
                "completedReferrals": completed_count,
                "discountPercentage": discount_percentage,
                "maxDiscount": 25,
                "referralCode": referral_code
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error validating referral code: {str(e)}")
    
    def calculate_discount(self, appointment_cost: float, discount_percentage: int) -> Dict:
        """Calculate referral discount with platform fee cap"""
        try:
            # Platform fee is 10%
            platform_fee = appointment_cost * 0.10
            
            # Calculate discount amount
            discount_amount = appointment_cost * (discount_percentage / 100)
            
            # Cap discount at platform fee
            actual_discount = min(discount_amount, platform_fee)
            
            # Calculate final cost
            final_cost = appointment_cost - actual_discount
            
            # Net revenue for platform
            net_revenue = platform_fee - actual_discount
            
            return {
                "originalCost": appointment_cost,
                "discountPercentage": discount_percentage,
                "discountAmount": actual_discount,
                "finalCost": final_cost,
                "platformFee": platform_fee,
                "netRevenue": net_revenue,
                "therapistReceives": appointment_cost - platform_fee
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error calculating discount: {str(e)}")
    
    def create_referral(self, referral_code: str, referred_patient_id: str, 
                       appointment_id: str, appointment_cost: float) -> Dict:
        """Create referral record when friend books appointment"""
        try:
            # Validate referral code first
            validation = self.validate_referral_code(referral_code, referred_patient_id)
            
            # Calculate discount
            discount_info = self.calculate_discount(appointment_cost, validation['discountPercentage'])
            
            # Generate referral ID
            referral_id = f"ref_{int(datetime.now().timestamp())}_{random.randint(1000, 9999)}"
            
            # Create referral record
            referral_item = {
                "referralId": referral_id,
                "referrerPatientId": validation['referrerPatientId'],
                "referredPatientId": referred_patient_id,
                "referralCode": referral_code,
                "status": "pending",
                "discountPercentage": Decimal(str(validation['discountPercentage'])),
                "discountAmount": Decimal(str(discount_info['discountAmount'])),
                "rehabXCredits": 100,  # Credits to award when completed
                "appointmentId": appointment_id,
                "appointmentCost": Decimal(str(appointment_cost)),
                "createdAt": datetime.now().isoformat(),
                "expiresAt": (datetime.now() + timedelta(days=365)).isoformat()
            }
            
            self.referral_table.put_item(Item=referral_item)
            
            return {
                "referralId": referral_id,
                "discountAmount": discount_info['discountAmount'],
                "finalCost": discount_info['finalCost'],
                "creditsToBeAwarded": 100,
                "status": "pending"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error creating referral: {str(e)}")
    
    def complete_referral(self, appointment_id: str) -> Optional[Dict]:
        """Complete referral and award RehabX credits when appointment is completed"""
        try:
            # Find referral by appointment ID
            response = self.referral_table.scan(
                FilterExpression='appointmentId = :aid AND #status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':aid': appointment_id,
                    ':status': 'pending'
                }
            )
            
            if not response.get('Items'):
                return None  # No pending referral for this appointment
            
            referral = response['Items'][0]
            referral_id = referral['referralId']
            referrer_patient_id = referral['referrerPatientId']
            credits_to_award = referral.get('rehabXCredits', 100)
            
            # Update referral status
            self.referral_table.update_item(
                Key={"referralId": referral_id},
                UpdateExpression="SET #status = :completed, completedAt = :now",
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':completed': 'completed',
                    ':now': datetime.now().isoformat()
                }
            )
            
            # Award RehabX credits to referrer
            self.patient_table.update_item(
                Key={"patientId": referrer_patient_id},
                UpdateExpression="SET rehabXCredits = if_not_exists(rehabXCredits, :zero) + :credits",
                ExpressionAttributeValues={
                    ':credits': credits_to_award,
                    ':zero': 0
                }
            )
            
            return {
                "referralId": referral_id,
                "status": "completed",
                "creditsAwarded": credits_to_award,
                "referrerPatientId": referrer_patient_id
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error completing referral: {str(e)}")
    
    def get_patient_referrals(self, patient_id: str) -> Dict:
        """Get all referrals for a patient (as referrer)"""
        try:
            # Get patient's referral code
            patient_response = self.patient_table.get_item(Key={"patientId": patient_id})
            if "Item" not in patient_response:
                raise HTTPException(status_code=404, detail="Patient not found")
            
            patient = patient_response["Item"]
            referral_code = patient.get("referralCode", "")
            rehabx_credits = patient.get("rehabXCredits", 0)
            
            # Get all referrals where this patient is the referrer
            all_referrals_response = self.referral_table.query(
                IndexName='referrerPatientId-status-index',
                KeyConditionExpression='referrerPatientId = :pid',
                ExpressionAttributeValues={':pid': patient_id}
            )
            
            all_referrals = all_referrals_response.get('Items', [])
            
            # Separate by status
            completed_referrals = [r for r in all_referrals if r.get('status') == 'completed']
            pending_referrals = [r for r in all_referrals if r.get('status') == 'pending']
            
            # Calculate totals
            total_credits_earned = sum(r.get('rehabXCredits', 0) for r in completed_referrals)
            total_discounts_given = sum(r.get('discountAmount', 0) for r in completed_referrals)
            
            # Get referred patient names
            referred_patient_ids = [r['referredPatientId'] for r in all_referrals]
            patient_names = {}
            
            for pid in set(referred_patient_ids):
                try:
                    p_resp = self.patient_table.get_item(Key={"patientId": pid})
                    if "Item" in p_resp:
                        patient_names[pid] = p_resp["Item"].get("name", "Unknown")
                except:
                    patient_names[pid] = "Unknown"
            
            # Format referral list
            referral_list = []
            for ref in all_referrals:
                referral_list.append({
                    "referralId": ref['referralId'],
                    "referredPatientId": ref['referredPatientId'],
                    "referredPatientName": patient_names.get(ref['referredPatientId'], "Unknown"),
                    "status": ref['status'],
                    "discountGiven": ref.get('discountAmount', 0),
                    "creditsEarned": ref.get('rehabXCredits', 0) if ref['status'] == 'completed' else 0,
                    "createdAt": ref.get('createdAt', ''),
                    "completedAt": ref.get('completedAt', ''),
                    "appointmentId": ref.get('appointmentId', '')
                })
            
            return {
                "referralCode": referral_code,
                "totalReferrals": len(all_referrals),
                "completedReferrals": len(completed_referrals),
                "pendingReferrals": len(pending_referrals),
                "totalCreditsEarned": total_credits_earned,
                "currentRehabXCredits": rehabx_credits,
                "totalDiscountsGiven": round(total_discounts_given, 2),
                "referrals": sorted(referral_list, key=lambda x: x['createdAt'], reverse=True)
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching patient referrals: {str(e)}")
    
    def get_referral_stats(self, patient_id: str) -> Dict:
        """Get quick stats for dashboard"""
        try:
            referrals = self.get_patient_referrals(patient_id)
            
            return {
                "totalReferrals": referrals['totalReferrals'],
                "completedReferrals": referrals['completedReferrals'],
                "pendingReferrals": referrals['pendingReferrals'],
                "rehabXCredits": referrals['currentRehabXCredits'],
                "totalDiscountsGiven": referrals['totalDiscountsGiven']
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching referral stats: {str(e)}")
