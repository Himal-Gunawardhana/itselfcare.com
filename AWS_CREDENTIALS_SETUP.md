# AWS Credentials Setup for ItselfCare E-Channeling

## The Issue

The `populate_sample_data.py` script failed because AWS credentials are not configured on your system. The error message was:

```
botocore.exceptions.ClientError: An error occurred (UnrecognizedClientException) when calling the PutItem operation: The security token included in the request is invalid.
```

## Solution Options

### Option 1: Configure AWS CLI (Recommended)

1. **Install AWS CLI** (if not installed):

   ```bash
   brew install awscli
   ```

2. **Configure credentials**:

   ```bash
   aws configure
   ```

   You'll be prompted for:

   - **AWS Access Key ID**: Your AWS access key
   - **AWS Secret Access Key**: Your AWS secret key
   - **Default region**: `ap-south-1` (Mumbai)
   - **Default output format**: `json`

3. **Get AWS Credentials**:
   - Log in to [AWS Console](https://console.aws.amazon.com/)
   - Go to **IAM** → **Users** → **Your User**
   - Click **Security credentials** tab
   - Click **Create access key**
   - Download and save the credentials securely

### Option 2: Environment Variables

Set these in your `.env` file or terminal:

```bash
export AWS_ACCESS_KEY_ID="your_access_key_here"
export AWS_SECRET_ACCESS_KEY="your_secret_key_here"
export AWS_REGION="ap-south-1"
```

### Option 3: Test with Local DynamoDB (For Development)

If you want to test locally without AWS:

1. **Install DynamoDB Local**:

   ```bash
   docker run -p 8001:8000 amazon/dynamodb-local
   ```

2. **Modify the script** to use local endpoint:
   ```python
   dynamodb = boto3.resource('dynamodb',
       region_name='ap-south-1',
       endpoint_url='http://localhost:8001')
   ```

## IAM Permissions Needed

Your AWS user/role needs these DynamoDB permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:DescribeTable"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-south-1:*:table/itselfcare_theraphists",
        "arn:aws:dynamodb:ap-south-1:*:table/itselfcare_patients",
        "arn:aws:dynamodb:ap-south-1:*:table/itselfcare_appointments",
        "arn:aws:dynamodb:ap-south-1:*:table/itselfcare_reviews"
      ]
    }
  ]
}
```

## Before Running the Script

Ensure these DynamoDB tables exist in AWS:

1. `itselfcare_theraphists` - Primary Key: `theraphistId` (String)
2. `itselfcare_patients` - Primary Key: `patientId` (String)
3. `itselfcare_appointments` - Primary Key: `appointmentId` (String)
4. `itselfcare_reviews` - Primary Key: `reviewId` (String)

See `AWS_SETUP_GUIDE.md` for table creation scripts.

## After Credentials are Configured

Run the population script:

```bash
cd itselfcare-backend
source venv/bin/activate
python populate_sample_data.py
```

## Testing Without AWS (Frontend Only)

For now, you can still test the frontend UI without real data:

1. **Visit the pages**:

   - http://localhost:5173 - Main website (will show empty therapist list)
   - http://localhost:5173/echanneling - E-Channeling overview
   - http://localhost:5173/echanneling/find-therapist - Search interface
   - http://localhost:5173/echanneling/register - Registration form
   - http://localhost:5173/echanneling/login - Login form

2. **Mock Data Alternative**: I can create a mock data file for frontend-only testing

## Next Steps

Choose one of these paths:

### Path A: Full AWS Setup (Production-ready)

1. Set up AWS credentials (Option 1 above)
2. Create DynamoDB tables (see AWS_SETUP_GUIDE.md)
3. Run populate_sample_data.py
4. Test complete flow with real backend

### Path B: Frontend-Only Preview

1. I'll create a mock data file
2. Update frontend to use mock data temporarily
3. Test UI/UX without backend
4. Later migrate to AWS when ready

### Path C: Local Development

1. Set up DynamoDB Local (Option 3)
2. Run everything locally
3. No AWS costs during development

Which path would you like to take?
