#!/bin/bash

# Create DynamoDB Tables for Messaging System

echo "Creating itselfcare_messages table..."
aws dynamodb create-table \
    --table-name itselfcare_messages \
    --attribute-definitions \
        AttributeName=messageId,AttributeType=S \
        AttributeName=conversationId,AttributeType=S \
        AttributeName=createdAt,AttributeType=S \
    --key-schema \
        AttributeName=messageId,KeyType=HASH \
    --global-secondary-indexes \
        IndexName=conversationId-createdAt-index,KeySchema=["{AttributeName=conversationId,KeyType=HASH}","{AttributeName=createdAt,KeyType=RANGE}"],Projection="{ProjectionType=ALL}",ProvisionedThroughput="{ReadCapacityUnits=5,WriteCapacityUnits=5}" \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region eu-north-1

echo "Creating itselfcare_conversations table..."
aws dynamodb create-table \
    --table-name itselfcare_conversations \
    --attribute-definitions \
        AttributeName=conversationId,AttributeType=S \
        AttributeName=patientId,AttributeType=S \
        AttributeName=therapistId,AttributeType=S \
        AttributeName=updatedAt,AttributeType=S \
    --key-schema \
        AttributeName=conversationId,KeyType=HASH \
    --global-secondary-indexes \
        IndexName=patientId-updatedAt-index,KeySchema=["{AttributeName=patientId,KeyType=HASH}","{AttributeName=updatedAt,KeyType=RANGE}"],Projection="{ProjectionType=ALL}",ProvisionedThroughput="{ReadCapacityUnits=5,WriteCapacityUnits=5}" \
        IndexName=therapistId-updatedAt-index,KeySchema=["{AttributeName=therapistId,KeyType=HASH}","{AttributeName=updatedAt,KeyType=RANGE}"],Projection="{ProjectionType=ALL}",ProvisionedThroughput="{ReadCapacityUnits=5,WriteCapacityUnits=5}" \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region eu-north-1

echo "Messaging tables created successfully!"
echo ""
echo "Tables created:"
echo "  - itselfcare_messages"
echo "  - itselfcare_conversations"
