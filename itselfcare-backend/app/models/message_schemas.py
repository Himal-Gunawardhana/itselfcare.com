"""
Message and Conversation Schemas for ItSelfCare Messaging System
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class MessageCreate(BaseModel):
    """Schema for creating a new message"""
    senderId: str = Field(..., description="ID of the message sender")
    senderType: str = Field(..., description="Type of sender: patient or therapist")
    receiverId: str = Field(..., description="ID of the message receiver")
    receiverType: str = Field(..., description="Type of receiver: patient or therapist")
    content: str = Field(..., min_length=1, max_length=2000, description="Message content")
    conversationId: Optional[str] = Field(None, description="Existing conversation ID")


class Message(BaseModel):
    """Schema for message response"""
    messageId: str
    conversationId: str
    senderId: str
    senderType: str
    receiverId: str
    receiverType: str
    content: str
    isRead: bool = False
    createdAt: str
    updatedAt: str


class Conversation(BaseModel):
    """Schema for conversation response"""
    conversationId: str
    patientId: str
    patientName: str
    therapistId: str
    therapistName: str
    lastMessage: Optional[str] = None
    lastMessageAt: Optional[str] = None
    unreadCount: int = 0
    createdAt: str
    updatedAt: str


class ConversationList(BaseModel):
    """Schema for list of conversations"""
    conversations: List[Conversation]
    totalCount: int


class MessageList(BaseModel):
    """Schema for list of messages"""
    messages: List[Message]
    conversationId: str
    totalCount: int
