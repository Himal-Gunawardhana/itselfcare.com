"""
Messaging Service for ItSelfCare
Handles real-time messaging between patients and therapists
"""
import boto3
from datetime import datetime
from typing import List, Dict, Optional
from decimal import Decimal
import uuid


class MessagingService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='eu-north-1')
        self.messages_table = self.dynamodb.Table('itselfcare_messages')
        self.conversations_table = self.dynamodb.Table('itselfcare_conversations')
        self.therapists_table = self.dynamodb.Table('itselfcare_theraphists')
        self.patients_table = self.dynamodb.Table('itselfcare_patients')

    def create_or_get_conversation(
        self,
        patient_id: str,
        therapist_id: str,
        patient_name: str,
        therapist_name: str
    ) -> Dict:
        """Create a new conversation or return existing one"""
        # Check if conversation already exists
        conversation_id = f"{patient_id}_{therapist_id}"
        
        try:
            response = self.conversations_table.get_item(
                Key={'conversationId': conversation_id}
            )
            
            if 'Item' in response:
                return response['Item']
        except Exception as e:
            print(f"Error checking existing conversation: {e}")

        # Create new conversation
        now = datetime.utcnow().isoformat()
        conversation = {
            'conversationId': conversation_id,
            'patientId': patient_id,
            'patientName': patient_name,
            'therapistId': therapist_id,
            'therapistName': therapist_name,
            'lastMessage': None,
            'lastMessageAt': None,
            'unreadCountPatient': 0,
            'unreadCountTherapist': 0,
            'createdAt': now,
            'updatedAt': now
        }

        self.conversations_table.put_item(Item=conversation)
        return conversation

    def send_message(
        self,
        sender_id: str,
        sender_type: str,
        receiver_id: str,
        receiver_type: str,
        content: str,
        conversation_id: Optional[str] = None
    ) -> Dict:
        """Send a message in a conversation"""
        now = datetime.utcnow().isoformat()
        message_id = f"msg_{int(datetime.utcnow().timestamp() * 1000)}_{uuid.uuid4().hex[:8]}"

        # Get or create conversation
        if sender_type == "patient":
            patient_id, therapist_id = sender_id, receiver_id
        else:
            patient_id, therapist_id = receiver_id, sender_id

        # Get names
        try:
            patient = self.patients_table.get_item(Key={'patientId': patient_id})
            therapist = self.therapists_table.get_item(Key={'theraphistId': therapist_id})
            
            patient_name = patient.get('Item', {}).get('name', 'Unknown Patient')
            therapist_name = therapist.get('Item', {}).get('name', 'Unknown Therapist')
        except Exception as e:
            print(f"Error fetching names: {e}")
            patient_name = 'Unknown Patient'
            therapist_name = 'Unknown Therapist'

        conversation = self.create_or_get_conversation(
            patient_id, therapist_id, patient_name, therapist_name
        )

        # Create message
        message = {
            'messageId': message_id,
            'conversationId': conversation['conversationId'],
            'senderId': sender_id,
            'senderType': sender_type,
            'receiverId': receiver_id,
            'receiverType': receiver_type,
            'content': content,
            'isRead': False,
            'createdAt': now,
            'updatedAt': now
        }

        self.messages_table.put_item(Item=message)

        # Update conversation
        unread_field = 'unreadCountPatient' if receiver_type == 'patient' else 'unreadCountTherapist'
        
        self.conversations_table.update_item(
            Key={'conversationId': conversation['conversationId']},
            UpdateExpression=f'SET lastMessage = :msg, lastMessageAt = :time, {unread_field} = {unread_field} + :inc, updatedAt = :time',
            ExpressionAttributeValues={
                ':msg': content[:100],
                ':time': now,
                ':inc': 1
            }
        )

        # Update therapist response time metrics
        if sender_type == 'therapist':
            self._update_therapist_response_metrics(therapist_id)

        return message

    def get_conversation_messages(
        self,
        conversation_id: str,
        limit: int = 50
    ) -> List[Dict]:
        """Get all messages in a conversation"""
        try:
            response = self.messages_table.query(
                IndexName='conversationId-createdAt-index',
                KeyConditionExpression='conversationId = :convId',
                ExpressionAttributeValues={':convId': conversation_id},
                ScanIndexForward=False,
                Limit=limit
            )
            
            messages = response.get('Items', [])
            return sorted(messages, key=lambda x: x['createdAt'])
        except Exception as e:
            print(f"Error fetching messages: {e}")
            return []

    def get_user_conversations(
        self,
        user_id: str,
        user_type: str
    ) -> List[Dict]:
        """Get all conversations for a user"""
        try:
            if user_type == 'patient':
                response = self.conversations_table.query(
                    IndexName='patientId-updatedAt-index',
                    KeyConditionExpression='patientId = :userId',
                    ExpressionAttributeValues={':userId': user_id},
                    ScanIndexForward=False
                )
            else:  # therapist
                response = self.conversations_table.query(
                    IndexName='therapistId-updatedAt-index',
                    KeyConditionExpression='therapistId = :userId',
                    ExpressionAttributeValues={':userId': user_id},
                    ScanIndexForward=False
                )

            conversations = response.get('Items', [])
            
            # Add unread count based on user type
            for conv in conversations:
                if user_type == 'patient':
                    conv['unreadCount'] = conv.get('unreadCountPatient', 0)
                else:
                    conv['unreadCount'] = conv.get('unreadCountTherapist', 0)

            return conversations
        except Exception as e:
            print(f"Error fetching conversations: {e}")
            return []

    def mark_messages_as_read(
        self,
        conversation_id: str,
        user_id: str,
        user_type: str
    ) -> Dict:
        """Mark all messages in a conversation as read for a user"""
        try:
            # Get unread messages
            messages = self.get_conversation_messages(conversation_id)
            unread_messages = [
                msg for msg in messages
                if not msg.get('isRead', False) and msg['receiverId'] == user_id
            ]

            # Mark each message as read
            for msg in unread_messages:
                self.messages_table.update_item(
                    Key={'messageId': msg['messageId']},
                    UpdateExpression='SET isRead = :true, updatedAt = :time',
                    ExpressionAttributeValues={
                        ':true': True,
                        ':time': datetime.utcnow().isoformat()
                    }
                )

            # Reset unread count in conversation
            unread_field = 'unreadCountPatient' if user_type == 'patient' else 'unreadCountTherapist'
            self.conversations_table.update_item(
                Key={'conversationId': conversation_id},
                UpdateExpression=f'SET {unread_field} = :zero',
                ExpressionAttributeValues={':zero': 0}
            )

            return {'success': True, 'markedCount': len(unread_messages)}
        except Exception as e:
            print(f"Error marking messages as read: {e}")
            return {'success': False, 'error': str(e)}

    def get_unread_count(self, user_id: str, user_type: str) -> int:
        """Get total unread message count for a user"""
        conversations = self.get_user_conversations(user_id, user_type)
        total_unread = sum(conv.get('unreadCount', 0) for conv in conversations)
        return total_unread

    def _update_therapist_response_metrics(self, therapist_id: str):
        """Update therapist's average response time metrics"""
        try:
            # Get therapist's conversations
            conversations = self.get_user_conversations(therapist_id, 'therapist')
            
            total_response_times = []
            for conv in conversations:
                messages = self.get_conversation_messages(conv['conversationId'], limit=10)
                
                # Calculate response times
                for i in range(len(messages) - 1):
                    if messages[i]['senderType'] == 'patient' and messages[i+1]['senderType'] == 'therapist':
                        patient_time = datetime.fromisoformat(messages[i]['createdAt'])
                        therapist_time = datetime.fromisoformat(messages[i+1]['createdAt'])
                        response_time = (therapist_time - patient_time).total_seconds() / 3600  # hours
                        total_response_times.append(response_time)

            if total_response_times:
                avg_response_time = sum(total_response_times) / len(total_response_times)
                
                # Update therapist record
                self.therapists_table.update_item(
                    Key={'theraphistId': therapist_id},
                    UpdateExpression='SET averageResponseTime = :time',
                    ExpressionAttributeValues={
                        ':time': Decimal(str(round(avg_response_time, 2)))
                    }
                )
        except Exception as e:
            print(f"Error updating response metrics: {e}")

    def delete_conversation(self, conversation_id: str) -> Dict:
        """Delete a conversation and all its messages"""
        try:
            # Delete all messages
            messages = self.get_conversation_messages(conversation_id, limit=1000)
            for msg in messages:
                self.messages_table.delete_item(Key={'messageId': msg['messageId']})

            # Delete conversation
            self.conversations_table.delete_item(Key={'conversationId': conversation_id})

            return {'success': True, 'deletedMessages': len(messages)}
        except Exception as e:
            print(f"Error deleting conversation: {e}")
            return {'success': False, 'error': str(e)}
