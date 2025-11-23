"""
Messaging Routes for ItSelfCare
"""
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.message_schemas import (
    MessageCreate, Message, Conversation, 
    ConversationList, MessageList
)
from app.services.messaging_service import MessagingService

router = APIRouter(prefix="/messages", tags=["messaging"])
messaging_service = MessagingService()


@router.post("/send", response_model=Message)
async def send_message(message_data: MessageCreate):
    """
    Send a message between patient and therapist
    """
    try:
        message = messaging_service.send_message(
            sender_id=message_data.senderId,
            sender_type=message_data.senderType,
            receiver_id=message_data.receiverId,
            receiver_type=message_data.receiverType,
            content=message_data.content,
            conversation_id=message_data.conversationId
        )
        return message
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/{user_id}/{user_type}", response_model=ConversationList)
async def get_conversations(user_id: str, user_type: str):
    """
    Get all conversations for a user (patient or therapist)
    """
    try:
        conversations = messaging_service.get_user_conversations(user_id, user_type)
        return {
            "conversations": conversations,
            "totalCount": len(conversations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversation/{conversation_id}", response_model=MessageList)
async def get_conversation_messages(conversation_id: str, limit: int = 50):
    """
    Get all messages in a conversation
    """
    try:
        messages = messaging_service.get_conversation_messages(conversation_id, limit)
        return {
            "messages": messages,
            "conversationId": conversation_id,
            "totalCount": len(messages)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/conversation/{conversation_id}/read")
async def mark_as_read(conversation_id: str, user_id: str, user_type: str):
    """
    Mark all messages in a conversation as read
    """
    try:
        result = messaging_service.mark_messages_as_read(
            conversation_id, user_id, user_type
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/unread/{user_id}/{user_type}")
async def get_unread_count(user_id: str, user_type: str):
    """
    Get total unread message count for a user
    """
    try:
        count = messaging_service.get_unread_count(user_id, user_type)
        return {"unreadCount": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/conversation/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """
    Delete a conversation and all its messages
    """
    try:
        result = messaging_service.delete_conversation(conversation_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/conversation/create")
async def create_conversation(
    patient_id: str,
    therapist_id: str,
    patient_name: str,
    therapist_name: str
):
    """
    Create or get existing conversation between patient and therapist
    """
    try:
        conversation = messaging_service.create_or_get_conversation(
            patient_id, therapist_id, patient_name, therapist_name
        )
        return conversation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
