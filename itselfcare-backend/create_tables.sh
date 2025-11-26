#!/bin/bash

echo "🚀 Creating DynamoDB tables..."

# Create Therapists Table
echo "📋 Creating therapists table..."
aws dynamodb create-table \
    --table-name itselfcare_therapists \
    --attribute-definitions \
        AttributeName=theraphistId,AttributeType=S \
        AttributeName=geoPrefix,AttributeType=S \
    --key-schema \
        AttributeName=theraphistId,KeyType=HASH \
    --global-secondary-indexes \
        "IndexName=geoPrefix-index,KeySchema=[{AttributeName=geoPrefix,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
    --billing-mode PROVISIONED \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region eu-north-1

# Create Patients Table
echo "📋 Creating patients table..."
aws dynamodb create-table \
    --table-name itselfcare_patients \
    --attribute-definitions AttributeName=patientId,AttributeType=S \
    --key-schema AttributeName=patientId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region eu-north-1

# Create Appointments Table
echo "📋 Creating appointments table..."
aws dynamodb create-table \
    --table-name itselfcare_appointments \
    --attribute-definitions \
        AttributeName=appointmentId,AttributeType=S \
        AttributeName=theraphistId,AttributeType=S \
        AttributeName=appointmentDate,AttributeType=S \
    --key-schema \
        AttributeName=appointmentId,KeyType=HASH \
    --global-secondary-indexes \
        "IndexName=theraphistId-appointmentDate-index,KeySchema=[{AttributeName=theraphistId,KeyType=HASH},{AttributeName=appointmentDate,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
    --billing-mode PROVISIONED \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region eu-north-1

# Create Reviews Table
echo "📋 Creating reviews table..."
aws dynamodb create-table \
    --table-name itselfcare_reviews \
    --attribute-definitions \
        AttributeName=reviewId,AttributeType=S \
        AttributeName=theraphistId,AttributeType=S \
    --key-schema \
        AttributeName=reviewId,KeyType=HASH \
    --global-secondary-indexes \
        "IndexName=theraphistId-index,KeySchema=[{AttributeName=theraphistId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
    --billing-mode PROVISIONED \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region eu-north-1

echo "⏳ Waiting for tables to become active..."
sleep 10

echo "✅ All tables created successfully!"
echo ""
echo "📊 Listing tables:"
aws dynamodb list-tables --region eu-north-1

# Create Referrals Table
echo "🎁 Creating referrals table..."
aws dynamodb create-table \
    --table-name itselfcare_referrals \
    --attribute-definitions \
        AttributeName=referralId,AttributeType=S \
        AttributeName=referrerPatientId,AttributeType=S \
        AttributeName=status,AttributeType=S \
        AttributeName=referralCode,AttributeType=S \
    --key-schema \
        AttributeName=referralId,KeyType=HASH \
    --global-secondary-indexes \
        "[
            {
                \"IndexName\": \"referrerPatientId-status-index\",
                \"KeySchema\": [
                    {\"AttributeName\":\"referrerPatientId\",\"KeyType\":\"HASH\"},
                    {\"AttributeName\":\"status\",\"KeyType\":\"RANGE\"}
                ],
                \"Projection\": {\"ProjectionType\":\"ALL\"},
                \"ProvisionedThroughput\": {
                    \"ReadCapacityUnits\": 5,
                    \"WriteCapacityUnits\": 5
                }
            },
            {
                \"IndexName\": \"referralCode-index\",
                \"KeySchema\": [
                    {\"AttributeName\":\"referralCode\",\"KeyType\":\"HASH\"}
                ],
                \"Projection\": {\"ProjectionType\":\"ALL\"},
                \"ProvisionedThroughput\": {
                    \"ReadCapacityUnits\": 5,
                    \"WriteCapacityUnits\": 5
                }
            }
        ]" \
    --billing-mode PROVISIONED \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region eu-north-1
