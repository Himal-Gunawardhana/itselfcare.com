#!/bin/bash

# ITSELF Care - DynamoDB Tables Deployment Script
# This script creates all required DynamoDB tables for the e-channeling platform
# Region: eu-north-1

set -e  # Exit on error

REGION="eu-north-1"
BILLING_MODE="PAY_PER_REQUEST"

echo "=========================================="
echo "ITSELF Care - DynamoDB Setup"
echo "Region: $REGION"
echo "=========================================="
echo ""

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ ERROR: AWS CLI is not installed"
    echo "Please install AWS CLI first:"
    echo "  - macOS/Linux: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    echo "  - Windows: https://awscli.amazonaws.com/AWSCLIV2.msi"
    exit 1
fi

echo "✅ AWS CLI is installed"
echo ""

# Check AWS credentials are configured
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity --region $REGION &> /dev/null; then
    echo "❌ ERROR: AWS credentials are not configured or invalid"
    echo "Please run: aws configure"
    echo "And enter your Access Key ID and Secret Access Key"
    exit 1
fi

echo "✅ AWS credentials are valid"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
USER_ARN=$(aws sts get-caller-identity --query Arn --output text)
echo "   Account: $ACCOUNT_ID"
echo "   User: $USER_ARN"
echo ""

# Test DynamoDB permissions
echo "Testing DynamoDB permissions..."
if ! aws dynamodb list-tables --region $REGION &> /dev/null; then
    echo "❌ ERROR: You don't have permission to access DynamoDB"
    echo "Please ensure your IAM user has 'AmazonDynamoDBFullAccess' policy attached"
    echo "See AWS_CLI_PERMISSIONS_GUIDE.md for detailed instructions"
    exit 1
fi

echo "✅ DynamoDB permissions verified"
echo ""

# Function to create table with retry
create_table() {
    local table_name=$1
    local create_command=$2
    
    echo "Creating table: $table_name..."
    
    # Check if table already exists
    if aws dynamodb describe-table --table-name "$table_name" --region $REGION &> /dev/null; then
        echo "⚠️  Table '$table_name' already exists. Skipping..."
        return 0
    fi
    
    # Create table
    if eval "$create_command"; then
        echo "✅ Table '$table_name' created successfully"
        
        # Wait for table to become active
        echo "   Waiting for table to become active..."
        aws dynamodb wait table-exists --table-name "$table_name" --region $REGION
        echo "   ✅ Table is now active"
    else
        echo "❌ Failed to create table '$table_name'"
        return 1
    fi
    
    echo ""
}

echo "=========================================="
echo "Creating DynamoDB Tables"
echo "=========================================="
echo ""

# Table 1: Therapist Profiles
create_table "itselfcare-therapists" \
"aws dynamodb create-table \
  --table-name itselfcare-therapists \
  --attribute-definitions \
    AttributeName=therapistId,AttributeType=S \
    AttributeName=locationHash,AttributeType=S \
    AttributeName=rating,AttributeType=N \
  --key-schema \
    AttributeName=therapistId,KeyType=HASH \
  --global-secondary-indexes \
    '[{\"IndexName\":\"location-index\",\"KeySchema\":[{\"AttributeName\":\"locationHash\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"rating\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]' \
  --billing-mode $BILLING_MODE \
  --region $REGION"

# Table 2: Patient Profiles
create_table "itselfcare-patients" \
"aws dynamodb create-table \
  --table-name itselfcare-patients \
  --attribute-definitions AttributeName=patientId,AttributeType=S \
  --key-schema AttributeName=patientId,KeyType=HASH \
  --billing-mode $BILLING_MODE \
  --region $REGION"

# Table 3: Appointments
create_table "itselfcare-appointments" \
"aws dynamodb create-table \
  --table-name itselfcare-appointments \
  --attribute-definitions \
    AttributeName=appointmentId,AttributeType=S \
    AttributeName=appointmentDate,AttributeType=S \
    AttributeName=patientId,AttributeType=S \
    AttributeName=therapistId,AttributeType=S \
  --key-schema \
    AttributeName=appointmentId,KeyType=HASH \
    AttributeName=appointmentDate,KeyType=RANGE \
  --global-secondary-indexes \
    '[{\"IndexName\":\"patient-appointments\",\"KeySchema\":[{\"AttributeName\":\"patientId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"appointmentDate\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}},{\"IndexName\":\"therapist-appointments\",\"KeySchema\":[{\"AttributeName\":\"therapistId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"appointmentDate\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]' \
  --billing-mode $BILLING_MODE \
  --region $REGION"

# Table 4: Reviews
create_table "itselfcare-reviews" \
"aws dynamodb create-table \
  --table-name itselfcare-reviews \
  --attribute-definitions \
    AttributeName=reviewId,AttributeType=S \
    AttributeName=therapistId,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema AttributeName=reviewId,KeyType=HASH \
  --global-secondary-indexes \
    '[{\"IndexName\":\"therapist-reviews\",\"KeySchema\":[{\"AttributeName\":\"therapistId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"createdAt\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]' \
  --billing-mode $BILLING_MODE \
  --region $REGION"

echo "=========================================="
echo "Verifying All Tables"
echo "=========================================="
echo ""

echo "Listing all tables..."
TABLES=$(aws dynamodb list-tables --region $REGION --output json | grep -o '"itselfcare-[^"]*"' | tr -d '"' || true)

if [ -z "$TABLES" ]; then
    echo "⚠️  No itselfcare tables found"
else
    echo "✅ Found the following tables:"
    echo "$TABLES" | while read -r table; do
        echo "   - $table"
    done
fi

echo ""
echo "=========================================="
echo "Deployment Summary"
echo "=========================================="
echo ""
echo "✅ All DynamoDB tables have been created successfully!"
echo ""
echo "Tables created:"
echo "  1. itselfcare-therapists (with location-index GSI)"
echo "  2. itselfcare-patients"
echo "  3. itselfcare-appointments (with patient-appointments and therapist-appointments GSIs)"
echo "  4. itselfcare-reviews (with therapist-reviews GSI)"
echo ""
echo "Next Steps:"
echo "  1. Set up AWS Cognito user pools (see AWS_SETUP_GUIDE.md)"
echo "  2. Create Lambda functions for business logic"
echo "  3. Configure API Gateway endpoints"
echo "  4. Update .env file with AWS credentials"
echo "  5. Install AWS SDK: npm install aws-amplify @aws-amplify/ui-react"
echo ""
echo "For detailed instructions, see:"
echo "  - AWS_SETUP_GUIDE.md (complete setup guide)"
echo "  - AWS_CLI_PERMISSIONS_GUIDE.md (permissions troubleshooting)"
echo ""
echo "=========================================="
