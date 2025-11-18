# AWS E-Channeling Platform Setup Guide

This guide will help you set up the AWS infrastructure for the physiotherapy e-channeling platform.

## Architecture Overview

The platform uses the following AWS services:
- **AWS Cognito**: User authentication for patients and therapists
- **Amazon DynamoDB**: NoSQL database for user profiles, appointments, and availability
- **AWS Lambda**: Serverless functions for business logic
- **Amazon API Gateway**: REST API endpoints
- **Amazon S3**: Storage for profile images and documents
- **Amazon Location Service**: Geolocation for finding nearby therapists

## Step 1: AWS Cognito Setup

### Create User Pools

1. **Patient User Pool**
```bash
# Navigate to AWS Cognito Console
# Create a new User Pool named "itselfcare-patients"

Configuration:
- Sign-in options: Email
- Password policy: Default
- MFA: Optional
- Email verification: Required
- Standard attributes: email, name, phone_number
- Custom attributes: address

# Save the User Pool ID and Client ID
User Pool ID: us-east-1_XXXXXXXXX
App Client ID: XXXXXXXXXXXXXXXXXXXXXXXXXX
```

2. **Therapist User Pool**
```bash
# Create a new User Pool named "itselfcare-therapists"

Configuration:
- Sign-in options: Email
- Password policy: Strong
- MFA: Optional
- Email verification: Required
- Standard attributes: email, name, phone_number
- Custom attributes: 
  - license_number (String)
  - specialization (String)
  - experience_years (Number)
  - clinic_address (String)
  - verified (Boolean) - for admin approval

# Save the User Pool ID and Client ID
User Pool ID: us-east-1_YYYYYYYYY
App Client ID: YYYYYYYYYYYYYYYYYYYYYYYYYY
```

### Cognito Configuration in Your App

Create `.env` file in your project root:

```env
# Patient Cognito
VITE_COGNITO_PATIENT_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_PATIENT_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_COGNITO_PATIENT_REGION=us-east-1

# Therapist Cognito
VITE_COGNITO_THERAPIST_USER_POOL_ID=us-east-1_YYYYYYYYY
VITE_COGNITO_THERAPIST_CLIENT_ID=YYYYYYYYYYYYYYYYYYYYYYYYYY
VITE_COGNITO_THERAPIST_REGION=us-east-1

# API Gateway
VITE_API_GATEWAY_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

## Step 2: DynamoDB Tables Setup

### Table 1: Therapist Profiles
```bash
Table Name: itselfcare-therapists
Primary Key: therapistId (String)
Sort Key: None

Attributes:
- therapistId: String (UUID)
- cognitoUserId: String
- name: String
- email: String
- phone: String
- specialization: String
- experience: Number
- licenseNumber: String
- clinicAddress: String
- latitude: Number
- longitude: Number
- bio: String
- sessionPrice: Number
- onlineConsultation: Boolean
- inPersonConsultation: Boolean
- availability: Map (day: {start, end, available})
- rating: Number
- reviewCount: Number
- verified: Boolean
- createdAt: String (ISO date)
- updatedAt: String (ISO date)

GSI (Global Secondary Index):
- Index Name: location-index
- Partition Key: locationHash (String) - for geohashing
- Sort Key: rating (Number)
```

### Table 2: Patient Profiles
```bash
Table Name: itselfcare-patients
Primary Key: patientId (String)

Attributes:
- patientId: String (UUID)
- cognitoUserId: String
- name: String
- email: String
- phone: String
- address: String
- medicalHistory: String
- createdAt: String
- updatedAt: String
```

### Table 3: Appointments
```bash
Table Name: itselfcare-appointments
Primary Key: appointmentId (String)
Sort Key: appointmentDate (String)

Attributes:
- appointmentId: String (UUID)
- patientId: String
- therapistId: String
- appointmentDate: String (ISO date)
- appointmentTime: String
- duration: Number (minutes)
- consultationType: String (online/inperson)
- status: String (pending/confirmed/completed/cancelled)
- notes: String
- meetingLink: String (for online)
- createdAt: String
- updatedAt: String

GSI 1:
- Index Name: patient-appointments
- Partition Key: patientId
- Sort Key: appointmentDate

GSI 2:
- Index Name: therapist-appointments
- Partition Key: therapistId
- Sort Key: appointmentDate
```

### Table 4: Reviews
```bash
Table Name: itselfcare-reviews
Primary Key: reviewId (String)

Attributes:
- reviewId: String (UUID)
- therapistId: String
- patientId: String
- rating: Number (1-5)
- comment: String
- createdAt: String

GSI:
- Index Name: therapist-reviews
- Partition Key: therapistId
- Sort Key: createdAt
```

### Create Tables Using AWS CLI

```bash
# Therapist Profiles Table
aws dynamodb create-table \
  --table-name itselfcare-therapists \
  --attribute-definitions \
    AttributeName=therapistId,AttributeType=S \
    AttributeName=locationHash,AttributeType=S \
    AttributeName=rating,AttributeType=N \
  --key-schema \
    AttributeName=therapistId,KeyType=HASH \
  --global-secondary-indexes \
    '[{"IndexName":"location-index","KeySchema":[{"AttributeName":"locationHash","KeyType":"HASH"},{"AttributeName":"rating","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}}]' \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Patients Table
aws dynamodb create-table \
  --table-name itselfcare-patients \
  --attribute-definitions AttributeName=patientId,AttributeType=S \
  --key-schema AttributeName=patientId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Appointments Table
aws dynamodb create-table \
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
    '[{"IndexName":"patient-appointments","KeySchema":[{"AttributeName":"patientId","KeyType":"HASH"},{"AttributeName":"appointmentDate","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}},{"IndexName":"therapist-appointments","KeySchema":[{"AttributeName":"therapistId","KeyType":"HASH"},{"AttributeName":"appointmentDate","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}}]' \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Reviews Table
aws dynamodb create-table \
  --table-name itselfcare-reviews \
  --attribute-definitions \
    AttributeName=reviewId,AttributeType=S \
    AttributeName=therapistId,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema AttributeName=reviewId,KeyType=HASH \
  --global-secondary-indexes \
    '[{"IndexName":"therapist-reviews","KeySchema":[{"AttributeName":"therapistId","KeyType":"HASH"},{"AttributeName":"createdAt","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}}]' \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Step 3: Lambda Functions

### Lambda Function 1: Find Nearby Therapists
```javascript
// findNearbyTherapists.js
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const geolib = require('geolib');

exports.handler = async (event) => {
  const { latitude, longitude, radius = 10 } = JSON.parse(event.body);
  
  // Query therapists from DynamoDB
  const params = {
    TableName: 'itselfcare-therapists',
    FilterExpression: 'verified = :verified',
    ExpressionAttributeValues: {
      ':verified': true
    }
  };
  
  const result = await dynamodb.scan(params).promise();
  
  // Filter by distance
  const nearbyTherapists = result.Items.filter(therapist => {
    const distance = geolib.getDistance(
      { latitude, longitude },
      { latitude: therapist.latitude, longitude: therapist.longitude }
    ) / 1000; // Convert to km
    
    return distance <= radius;
  }).map(therapist => ({
    ...therapist,
    distance: geolib.getDistance(
      { latitude, longitude },
      { latitude: therapist.latitude, longitude: therapist.longitude }
    ) / 1000
  })).sort((a, b) => a.distance - b.distance);
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
    body: JSON.stringify(nearbyTherapists)
  };
};
```

### Lambda Function 2: Create Appointment
```javascript
// createAppointment.js
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  const appointment = JSON.parse(event.body);
  
  const item = {
    appointmentId: uuidv4(),
    patientId: appointment.patientId,
    therapistId: appointment.therapistId,
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    duration: appointment.duration || 60,
    consultationType: appointment.consultationType,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await dynamodb.put({
    TableName: 'itselfcare-appointments',
    Item: item
  }).promise();
  
  // TODO: Send notification to therapist
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
    body: JSON.stringify(item)
  };
};
```

### Deploy Lambda Functions
```bash
# Create deployment package
cd lambda-functions
npm install
zip -r function.zip .

# Create IAM role for Lambda
aws iam create-role \
  --role-name itselfcare-lambda-role \
  --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name itselfcare-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
  --role-name itselfcare-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# Create Lambda functions
aws lambda create-function \
  --function-name findNearbyTherapists \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/itselfcare-lambda-role \
  --handler findNearbyTherapists.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512

aws lambda create-function \
  --function-name createAppointment \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/itselfcare-lambda-role \
  --handler createAppointment.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512
```

## Step 4: API Gateway Setup

```bash
# Create REST API
aws apigateway create-rest-api \
  --name itselfcare-api \
  --description "ITSELF Care E-Channeling API" \
  --region us-east-1

# Get API ID
API_ID=$(aws apigateway get-rest-apis \
  --query "items[?name=='itselfcare-api'].id" \
  --output text)

# Create resources and methods
# /therapists
aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $(aws apigateway get-resources --rest-api-id $API_ID --query 'items[?path=="/"].id' --output text) \
  --path-part therapists

# /appointments
aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $(aws apigateway get-resources --rest-api-id $API_ID --query 'items[?path=="/"].id' --output text) \
  --path-part appointments

# Deploy API
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod
```

## Step 5: Install Required NPM Packages

```bash
npm install aws-amplify @aws-amplify/ui-react amazon-cognito-identity-js geolib
```

## Step 6: Create AWS Service Files

Create `src/lib/aws-config.ts`:

```typescript
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_PATIENT_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_PATIENT_CLIENT_ID,
    }
  },
  API: {
    REST: {
      itselfcareAPI: {
        endpoint: import.meta.env.VITE_API_GATEWAY_URL,
        region: 'us-east-1'
      }
    }
  }
});

export const therapistPoolConfig = {
  userPoolId: import.meta.env.VITE_COGNITO_THERAPIST_USER_POOL_ID,
  clientId: import.meta.env.VITE_COGNITO_THERAPIST_CLIENT_ID,
  region: import.meta.env.VITE_COGNITO_THERAPIST_REGION,
};
```

## Step 7: Testing

1. Test Cognito authentication in AWS Console
2. Test DynamoDB table access
3. Test Lambda functions directly
4. Test API Gateway endpoints using Postman

## Security Best Practices

1. Enable MFA for admin accounts
2. Use IAM roles with least privilege
3. Enable CloudTrail logging
4. Set up AWS WAF for API Gateway
5. Encrypt data at rest in DynamoDB
6. Use HTTPS only
7. Implement rate limiting on API Gateway

## Monitoring & Logging

```bash
# Enable CloudWatch logging for Lambda
aws lambda update-function-configuration \
  --function-name findNearbyTherapists \
  --tracing-config Mode=Active

# Create CloudWatch dashboard
# Monitor:
# - API Gateway requests
# - Lambda invocations and errors
# - DynamoDB read/write capacity
# - Cognito sign-ups and sign-ins
```

## Cost Estimation (Monthly)

- AWS Cognito: $0 (first 50,000 MAUs free)
- DynamoDB: ~$5-20 (depends on usage)
- Lambda: ~$0-5 (first 1M requests free)
- API Gateway: ~$3.50 per million requests
- S3: ~$1-5 for storage

Total estimated: $10-50/month for initial usage

## Next Steps

1. Set up AWS account and configure CLI
2. Create Cognito User Pools
3. Create DynamoDB tables
4. Deploy Lambda functions
5. Configure API Gateway
6. Update .env file with AWS credentials
7. Test authentication flow
8. Implement frontend integration

## Support

For AWS-specific questions:
- AWS Documentation: https://docs.aws.amazon.com/
- AWS Support: https://console.aws.amazon.com/support/

For application questions:
- Email: info@itselfcare.com
