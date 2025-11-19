# 🚀 Quick Start Deployment Guide

## Overview

This guide will help you quickly deploy the ITSELF Care e-channeling platform AWS infrastructure. Follow these steps in order for a smooth deployment.

## Prerequisites

Before starting, make sure you have:

- [ ] Active AWS account (https://aws.amazon.com/)
- [ ] Payment method added to AWS account
- [ ] Basic knowledge of command line/terminal
- [ ] Computer with internet access

## 🎯 Quick Deployment Steps

### Step 1: Install AWS CLI (5 minutes)

**For macOS/Linux:**
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

**For Windows:**
1. Download: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Run the installer
3. Restart your terminal/PowerShell

**Verify installation:**
```bash
aws --version
# Should show: aws-cli/2.x.x ...
```

### Step 2: Create IAM User and Get Credentials (10 minutes)

1. **Log in to AWS Console**: https://console.aws.amazon.com/

2. **Go to IAM**: Search for "IAM" in the top search bar

3. **Create User**:
   - Click "Users" → "Create user"
   - Username: `itselfcare-deployer`
   - Click "Next"

4. **Set Permissions**:
   - Select "Attach policies directly"
   - Search and check these policies:
     - ✅ `AmazonDynamoDBFullAccess`
     - ✅ `AWSLambda_FullAccess`
     - ✅ `AmazonAPIGatewayAdministrator`
     - ✅ `AmazonCognitoPowerUser`
     - ✅ `IAMFullAccess`
     - ✅ `CloudWatchLogsFullAccess`
   - Click "Next" → "Create user"

5. **Create Access Keys**:
   - Click on the new user
   - Go to "Security credentials" tab
   - Click "Create access key"
   - Choose "Command Line Interface (CLI)"
   - Check the confirmation box
   - Click "Next" → "Create access key"
   - **IMPORTANT**: Save these credentials:
     ```
     Access Key ID: AKIAXXXXXXXXXXXXXXXX
     Secret Access Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```

### Step 3: Configure AWS CLI (2 minutes)

Run this command and enter your credentials:

```bash
aws configure
```

Enter when prompted:
```
AWS Access Key ID: [paste your Access Key ID]
AWS Secret Access Key: [paste your Secret Access Key]
Default region name: eu-north-1
Default output format: json
```

**Verify it works:**
```bash
aws sts get-caller-identity
```

You should see your account details!

### Step 4: Deploy DynamoDB Tables (5 minutes)

**Option A: Using the automated script (Recommended)**

**For macOS/Linux:**
```bash
chmod +x deploy-dynamodb-tables.sh
./deploy-dynamodb-tables.sh
```

**For Windows PowerShell:**
```powershell
.\deploy-dynamodb-tables.ps1
```

**Option B: Manual commands**

Run these commands one by one:

```bash
# 1. Create Therapists table
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

# 2. Create Patients table
aws dynamodb create-table \
  --table-name itselfcare-patients \
  --attribute-definitions AttributeName=patientId,AttributeType=S \
  --key-schema AttributeName=patientId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-north-1

# 3. Create Appointments table
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

# 4. Create Reviews table
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

### Step 5: Verify Tables Created (1 minute)

```bash
aws dynamodb list-tables --region eu-north-1
```

You should see all 4 tables:
- ✅ itselfcare-therapists
- ✅ itselfcare-patients
- ✅ itselfcare-appointments
- ✅ itselfcare-reviews

## ✅ What You've Accomplished

Congratulations! You have successfully:
- ✅ Installed and configured AWS CLI
- ✅ Created IAM user with proper permissions
- ✅ Deployed all 4 DynamoDB tables
- ✅ Set up the foundation for the e-channeling platform

## 📋 Next Steps

Now that your DynamoDB tables are ready, continue with:

### 1. Set Up AWS Cognito (Authentication)
See: **AWS_SETUP_GUIDE.md - Step 1**
- Create patient user pool
- Create therapist user pool
- Configure app clients

### 2. Deploy Lambda Functions (Business Logic)
See: **AWS_SETUP_GUIDE.md - Step 3**
- Create Lambda execution role
- Deploy findNearbyTherapists function
- Deploy createAppointment function

### 3. Configure API Gateway (REST API)
See: **AWS_SETUP_GUIDE.md - Step 4**
- Create REST API
- Set up endpoints
- Deploy to production

### 4. Configure Frontend
See: **AWS_SETUP_GUIDE.md - Step 6**
- Create `.env` file with AWS credentials
- Install AWS SDK packages
- Test authentication flow

## 🆘 Troubleshooting

### Problem: "AccessDeniedException" error
**Solution**: Your IAM user doesn't have the required permissions
1. Go to IAM Console → Users → Select your user
2. Click "Add permissions" → "Attach policies directly"
3. Add the missing policy (e.g., `AmazonDynamoDBFullAccess`)
4. Wait 1-2 minutes and try again

### Problem: "InvalidClientTokenId" error
**Solution**: Your Access Key ID is incorrect
- Run `aws configure` and re-enter your credentials
- Make sure you copied the Access Key ID exactly as shown

### Problem: "Table already exists" error
**Solution**: The table was already created
- This is not actually an error - the table exists!
- Skip to the next table creation
- Or verify with: `aws dynamodb describe-table --table-name itselfcare-therapists --region eu-north-1`

### Problem: AWS CLI not found
**Solution**: AWS CLI is not installed or not in PATH
- Reinstall AWS CLI
- On Windows, restart your terminal after installation
- On macOS/Linux, you may need to restart your terminal or run: `source ~/.bash_profile`

### Still Having Issues?

1. **Check detailed permission guide**: See `AWS_CLI_PERMISSIONS_GUIDE.md`
2. **Review full setup guide**: See `AWS_SETUP_GUIDE.md`
3. **Check AWS Console**: Look at CloudTrail logs for detailed error information
4. **Verify credentials**: Run `aws sts get-caller-identity` to test

## 📚 Documentation Reference

| Document | Purpose |
|----------|---------|
| **QUICK_START_DEPLOYMENT.md** (this file) | Fast deployment guide |
| **AWS_CLI_PERMISSIONS_GUIDE.md** | Detailed permissions and troubleshooting |
| **AWS_SETUP_GUIDE.md** | Complete infrastructure setup |
| **ECHANNELING_IMPLEMENTATION.md** | Implementation details and features |
| **deploy-dynamodb-tables.sh** | Automated deployment script (Linux/Mac) |
| **deploy-dynamodb-tables.ps1** | Automated deployment script (Windows) |

## 💰 Estimated Costs

For initial usage (first 3-6 months):
- **DynamoDB**: ~$5-20/month (depends on usage)
- **Lambda**: Free (first 1M requests)
- **API Gateway**: ~$3.50 per million requests
- **Cognito**: Free (first 50,000 MAUs)

**Total**: ~$10-30/month initially

## 🔐 Security Reminders

- ⚠️ Never commit your AWS credentials to Git
- ⚠️ Keep your Access Keys secure
- ⚠️ Enable MFA on your AWS root account
- ⚠️ Rotate access keys every 90 days
- ⚠️ Use IAM roles for production (not access keys)

## ⏱️ Total Time Required

- **AWS CLI Setup**: ~5 minutes
- **IAM User Creation**: ~10 minutes
- **AWS CLI Configuration**: ~2 minutes
- **DynamoDB Deployment**: ~5 minutes
- **Verification**: ~1 minute

**Total**: ~23 minutes

## 🎓 What's Next After Deployment?

1. **Test Tables**: Verify tables are accessible
2. **Set Up Cognito**: Enable user authentication
3. **Deploy Lambda**: Add business logic
4. **Configure API Gateway**: Create REST endpoints
5. **Frontend Integration**: Connect React app to AWS
6. **Testing**: Test complete flow
7. **Go Live**: Deploy to production

## 📞 Support

If you encounter issues:
1. Review the troubleshooting section above
2. Check `AWS_CLI_PERMISSIONS_GUIDE.md` for permission issues
3. Consult AWS documentation: https://docs.aws.amazon.com/
4. Check AWS Support Center

## ✨ Congratulations!

You've completed the first major step in deploying the ITSELF Care e-channeling platform! The database infrastructure is now ready for your application.

---

**Platform**: ITSELF Care E-Channeling
**Region**: eu-north-1 (Stockholm)
**Last Updated**: November 2024
