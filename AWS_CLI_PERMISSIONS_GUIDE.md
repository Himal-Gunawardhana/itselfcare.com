# AWS CLI Permissions and Setup Guide

## Quick Start: Required Permissions

To complete the deployment of the e-channeling platform, you need the following AWS permissions configured in your AWS account:

### 1. IAM User Permissions Required

Create an IAM user with the following permissions (or use an existing user with these policies):

#### Required AWS Managed Policies:
- `AmazonDynamoDBFullAccess` - For creating and managing DynamoDB tables
- `AWSLambda_FullAccess` - For creating and deploying Lambda functions
- `AmazonAPIGatewayAdministrator` - For setting up API Gateway
- `AmazonCognitoPowerUser` - For managing Cognito user pools
- `IAMFullAccess` - For creating roles needed by Lambda functions
- `AmazonS3FullAccess` - For file storage (if needed)
- `CloudWatchLogsFullAccess` - For monitoring and debugging

#### Minimum Required Permissions (Least Privilege):

If you prefer minimal permissions, create a custom policy with these specific actions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:DescribeTable",
        "dynamodb:ListTables",
        "dynamodb:UpdateTable",
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:DeleteItem",
        "dynamodb:UpdateItem",
        "dynamodb:CreateGlobalTable",
        "dynamodb:DescribeGlobalTable"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:CreateUserPool",
        "cognito-idp:CreateUserPoolClient",
        "cognito-idp:DescribeUserPool",
        "cognito-idp:ListUserPools",
        "cognito-idp:UpdateUserPool",
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminGetUser"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:GetFunction",
        "lambda:ListFunctions",
        "lambda:InvokeFunction"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "apigateway:*"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:GetRole",
        "iam:PassRole",
        "iam:PutRolePolicy"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "*"
    }
  ]
}
```

## Step-by-Step: Setting Up AWS CLI Permissions

### Step 1: Create IAM User (AWS Console Method)

1. **Log in to AWS Console**
   - Go to https://console.aws.amazon.com/
   - Sign in with your root account or admin user

2. **Navigate to IAM**
   - Search for "IAM" in the top search bar
   - Click on "IAM" (Identity and Access Management)

3. **Create New User**
   - Click "Users" in the left sidebar
   - Click "Create user" button
   - User name: `itselfcare-deployer`
   - Check "Provide user access to the AWS Management Console" (optional)
   - Click "Next"

4. **Attach Permissions**
   - Select "Attach policies directly"
   - Search and select the following policies:
     - ✅ `AmazonDynamoDBFullAccess`
     - ✅ `AWSLambda_FullAccess`
     - ✅ `AmazonAPIGatewayAdministrator`
     - ✅ `AmazonCognitoPowerUser`
     - ✅ `IAMFullAccess`
     - ✅ `CloudWatchLogsFullAccess`
   - Click "Next"
   - Review and click "Create user"

5. **Create Access Keys**
   - Click on the newly created user
   - Go to "Security credentials" tab
   - Scroll to "Access keys" section
   - Click "Create access key"
   - Select "Command Line Interface (CLI)"
   - Check the confirmation box
   - Click "Next" and "Create access key"
   - **IMPORTANT**: Download the CSV or copy the credentials:
     - Access Key ID: `AKIAXXXXXXXXXXXXXXXX`
     - Secret Access Key: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ Save these credentials securely - you won't see them again!

### Step 2: Configure AWS CLI

1. **Install AWS CLI** (if not already installed)

   **For macOS/Linux:**
   ```bash
   curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
   sudo installer -pkg AWSCLIV2.pkg -target /
   ```

   **For Windows:**
   - Download from: https://awscli.amazonaws.com/AWSCLIV2.msi
   - Run the installer

   **Verify installation:**
   ```bash
   aws --version
   # Should output: aws-cli/2.x.x ...
   ```

2. **Configure AWS CLI with Your Credentials**

   ```bash
   aws configure
   ```

   Enter the following when prompted:
   ```
   AWS Access Key ID [None]: AKIAXXXXXXXXXXXXXXXX
   AWS Secret Access Key [None]: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Default region name [None]: eu-north-1
   Default output format [None]: json
   ```

3. **Verify Configuration**

   ```bash
   # Test basic AWS access
   aws sts get-caller-identity
   
   # Should return something like:
   # {
   #   "UserId": "AIDAXXXXXXXXXXXXXXXXX",
   #   "Account": "123456789012",
   #   "Arn": "arn:aws:iam::123456789012:user/itselfcare-deployer"
   # }
   ```

### Step 3: Test DynamoDB Permissions

Before creating tables, test that you have the correct permissions:

```bash
# List existing tables (if any)
aws dynamodb list-tables --region eu-north-1

# Should return:
# {
#   "TableNames": []
# }
# Or list of existing tables
```

If you get an error like:
- `AccessDeniedException` - Your user doesn't have DynamoDB permissions
- `InvalidClientTokenId` - Your AWS credentials are incorrect
- `SignatureDoesNotMatch` - Your secret access key is incorrect

### Step 4: Create DynamoDB Tables

Now that permissions are verified, create the required tables:

#### Table 1: Therapist Profiles
```bash
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
  --region eu-north-1
```

**Verify table creation:**
```bash
aws dynamodb describe-table --table-name itselfcare-therapists --region eu-north-1
```

#### Table 2: Patient Profiles
```bash
aws dynamodb create-table \
  --table-name itselfcare-patients \
  --attribute-definitions AttributeName=patientId,AttributeType=S \
  --key-schema AttributeName=patientId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-north-1
```

**Verify:**
```bash
aws dynamodb describe-table --table-name itselfcare-patients --region eu-north-1
```

#### Table 3: Appointments
```bash
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
  --region eu-north-1
```

**Verify:**
```bash
aws dynamodb describe-table --table-name itselfcare-appointments --region eu-north-1
```

#### Table 4: Reviews
```bash
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
  --region eu-north-1
```

**Verify:**
```bash
aws dynamodb describe-table --table-name itselfcare-reviews --region eu-north-1
```

### Step 5: Verify All Tables Created

```bash
# List all tables
aws dynamodb list-tables --region eu-north-1

# Should show:
# {
#   "TableNames": [
#     "itselfcare-appointments",
#     "itselfcare-patients",
#     "itselfcare-reviews",
#     "itselfcare-therapists"
#   ]
# }
```

## Common Permission Errors and Solutions

### Error 1: AccessDeniedException
```
An error occurred (AccessDeniedException) when calling the CreateTable operation: 
User: arn:aws:iam::123456789012:user/username is not authorized to perform: 
dynamodb:CreateTable on resource: arn:aws:dynamodb:eu-north-1:123456789012:table/itselfcare-therapists
```

**Solution:**
1. Go to IAM Console → Users → Select your user
2. Click "Add permissions" → "Attach policies directly"
3. Add `AmazonDynamoDBFullAccess` policy
4. Wait 1-2 minutes for permissions to propagate
5. Try the command again

### Error 2: InvalidClientTokenId
```
An error occurred (InvalidClientTokenId) when calling the CreateTable operation: 
The security token included in the request is invalid.
```

**Solution:**
- Your Access Key ID is incorrect
- Run `aws configure` and re-enter your credentials
- Make sure you're using the correct Access Key ID from the CSV you downloaded

### Error 3: SignatureDoesNotMatch
```
An error occurred (SignatureDoesNotMatch) when calling the CreateTable operation: 
The request signature we calculated does not match the signature you provided.
```

**Solution:**
- Your Secret Access Key is incorrect
- Run `aws configure` and re-enter your credentials
- Copy the secret key carefully (no extra spaces)

### Error 4: ResourceInUseException
```
An error occurred (ResourceInUseException) when calling the CreateTable operation: 
Table already exists: itselfcare-therapists
```

**Solution:**
- The table already exists
- Either:
  - Skip this table creation (it's already there)
  - Or delete it first: `aws dynamodb delete-table --table-name itselfcare-therapists --region eu-north-1`
  - Wait 30 seconds and recreate

### Error 5: ValidationException (for GSI)
```
An error occurred (ValidationException) when calling the CreateTable operation: 
One or more parameter values were invalid: Some index key attributes are not defined in AttributeDefinitions
```

**Solution:**
- Make sure all attributes used in GSI KeySchema are defined in --attribute-definitions
- Check the command syntax carefully
- Copy-paste the exact command from this guide

## Additional Permissions You May Need

### For Lambda Deployment:
If you plan to deploy Lambda functions, ensure you have:

```bash
# Test Lambda permissions
aws lambda list-functions --region eu-north-1
```

### For Cognito Setup:
To create user pools:

```bash
# Test Cognito permissions
aws cognito-idp list-user-pools --max-results 10 --region eu-north-1
```

### For API Gateway:
To set up API endpoints:

```bash
# Test API Gateway permissions
aws apigateway get-rest-apis --region eu-north-1
```

## Quick Deployment Checklist

Use this checklist to track your deployment progress:

- [ ] **AWS Account Setup**
  - [ ] AWS account created
  - [ ] Payment method added
  - [ ] Account verified

- [ ] **IAM User Configuration**
  - [ ] IAM user created (`itselfcare-deployer`)
  - [ ] Required policies attached
  - [ ] Access keys generated and saved
  - [ ] AWS CLI installed
  - [ ] AWS CLI configured with credentials

- [ ] **Permission Verification**
  - [ ] `aws sts get-caller-identity` works
  - [ ] `aws dynamodb list-tables` works
  - [ ] Region set to `eu-north-1`

- [ ] **DynamoDB Tables**
  - [ ] `itselfcare-therapists` table created
  - [ ] `itselfcare-patients` table created
  - [ ] `itselfcare-appointments` table created
  - [ ] `itselfcare-reviews` table created
  - [ ] All tables verified with `describe-table`

- [ ] **Cognito Setup** (Next Steps)
  - [ ] Patient user pool created
  - [ ] Therapist user pool created
  - [ ] App clients configured
  - [ ] Pool IDs saved to `.env` file

- [ ] **Lambda Functions** (Next Steps)
  - [ ] Lambda execution role created
  - [ ] Lambda functions deployed
  - [ ] Functions tested

- [ ] **API Gateway** (Next Steps)
  - [ ] REST API created
  - [ ] Resources and methods configured
  - [ ] API deployed to production stage
  - [ ] API URL saved to `.env` file

- [ ] **Frontend Configuration**
  - [ ] `.env` file created with all credentials
  - [ ] AWS SDK packages installed
  - [ ] Frontend tested locally

## Security Best Practices

1. **Never commit credentials to Git**
   - Keep `.env` files in `.gitignore`
   - Use environment variables for sensitive data

2. **Use IAM Roles Instead of Access Keys** (for production)
   - For EC2: Attach IAM role to instance
   - For Lambda: Use execution roles
   - For local development: Use AWS SSO

3. **Enable MFA on Root Account**
   - Go to IAM → Root user → Enable MFA
   - Use authenticator app or hardware token

4. **Rotate Access Keys Regularly**
   - Create new access keys every 90 days
   - Delete old keys after rotation

5. **Use Least Privilege Principle**
   - Only grant permissions that are actually needed
   - Review and remove unused permissions

## Need Help?

### If you're stuck on permissions:
1. Check the IAM user has the policies attached (IAM Console → Users → [your user] → Permissions)
2. Wait 1-2 minutes after attaching new policies
3. Try `aws sts get-caller-identity` to verify credentials work
4. Check you're using the correct region (`eu-north-1`)

### If tables won't create:
1. Verify permissions with `aws dynamodb list-tables`
2. Check for typos in table names
3. Ensure GSI attribute definitions match the key schema
4. Try creating tables one at a time instead of all at once

### Still having issues?
1. Check AWS CloudTrail for detailed error logs
2. Review IAM policy simulator to test permissions
3. Contact AWS Support or check AWS forums

## What's Next?

After completing all DynamoDB table creation:

1. **Set up AWS Cognito user pools** (see AWS_SETUP_GUIDE.md Step 1)
2. **Create Lambda functions** (see AWS_SETUP_GUIDE.md Step 3)
3. **Configure API Gateway** (see AWS_SETUP_GUIDE.md Step 4)
4. **Create `.env` file** with all AWS credentials
5. **Install AWS SDK packages**: `npm install aws-amplify @aws-amplify/ui-react`
6. **Test the application** locally with AWS integration

## Summary

You now have:
- ✅ IAM user with proper permissions
- ✅ AWS CLI configured
- ✅ All DynamoDB tables created
- ✅ Permissions verified and tested

**Next Priority:** Set up Cognito user pools for authentication (refer to AWS_SETUP_GUIDE.md)

---

**Last Updated:** November 2024
**Region:** eu-north-1
**Platform:** itselfcare.com e-channeling
