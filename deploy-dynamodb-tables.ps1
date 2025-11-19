# ITSELF Care - DynamoDB Tables Deployment Script (PowerShell)
# This script creates all required DynamoDB tables for the e-channeling platform
# Region: eu-north-1

$ErrorActionPreference = "Stop"

$REGION = "eu-north-1"
$BILLING_MODE = "PAY_PER_REQUEST"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ITSELF Care - DynamoDB Setup" -ForegroundColor Cyan
Write-Host "Region: $REGION" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check AWS CLI is installed
Write-Host "Checking AWS CLI installation..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✅ AWS CLI is installed: $awsVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ ERROR: AWS CLI is not installed" -ForegroundColor Red
    Write-Host "Please install AWS CLI first:" -ForegroundColor Yellow
    Write-Host "  Download from: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Yellow
    exit 1
}

# Check AWS credentials are configured
Write-Host "Checking AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --region $REGION 2>&1 | ConvertFrom-Json
    Write-Host "✅ AWS credentials are valid" -ForegroundColor Green
    Write-Host "   Account: $($identity.Account)" -ForegroundColor Gray
    Write-Host "   User: $($identity.Arn)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ ERROR: AWS credentials are not configured or invalid" -ForegroundColor Red
    Write-Host "Please run: aws configure" -ForegroundColor Yellow
    Write-Host "And enter your Access Key ID and Secret Access Key" -ForegroundColor Yellow
    exit 1
}

# Test DynamoDB permissions
Write-Host "Testing DynamoDB permissions..." -ForegroundColor Yellow
try {
    aws dynamodb list-tables --region $REGION 2>&1 | Out-Null
    Write-Host "✅ DynamoDB permissions verified" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ ERROR: You don't have permission to access DynamoDB" -ForegroundColor Red
    Write-Host "Please ensure your IAM user has 'AmazonDynamoDBFullAccess' policy attached" -ForegroundColor Yellow
    Write-Host "See AWS_CLI_PERMISSIONS_GUIDE.md for detailed instructions" -ForegroundColor Yellow
    exit 1
}

# Function to create table
function Create-DynamoDBTable {
    param (
        [string]$TableName,
        [string]$CreateCommand
    )
    
    Write-Host "Creating table: $TableName..." -ForegroundColor Yellow
    
    # Check if table already exists
    try {
        aws dynamodb describe-table --table-name $TableName --region $REGION 2>&1 | Out-Null
        Write-Host "⚠️  Table '$TableName' already exists. Skipping..." -ForegroundColor Yellow
        Write-Host ""
        return $true
    } catch {
        # Table doesn't exist, proceed with creation
    }
    
    # Create table
    try {
        Invoke-Expression $CreateCommand | Out-Null
        Write-Host "✅ Table '$TableName' created successfully" -ForegroundColor Green
        
        # Wait for table to become active
        Write-Host "   Waiting for table to become active..." -ForegroundColor Gray
        aws dynamodb wait table-exists --table-name $TableName --region $REGION
        Write-Host "   ✅ Table is now active" -ForegroundColor Green
        Write-Host ""
        return $true
    } catch {
        Write-Host "❌ Failed to create table '$TableName'" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Creating DynamoDB Tables" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Table 1: Therapist Profiles
$cmd1 = @"
aws dynamodb create-table ``
  --table-name itselfcare-therapists ``
  --attribute-definitions ``
    AttributeName=therapistId,AttributeType=S ``
    AttributeName=locationHash,AttributeType=S ``
    AttributeName=rating,AttributeType=N ``
  --key-schema ``
    AttributeName=therapistId,KeyType=HASH ``
  --global-secondary-indexes ``
    '[{\"IndexName\":\"location-index\",\"KeySchema\":[{\"AttributeName\":\"locationHash\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"rating\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]' ``
  --billing-mode $BILLING_MODE ``
  --region $REGION
"@
Create-DynamoDBTable -TableName "itselfcare-therapists" -CreateCommand $cmd1

# Table 2: Patient Profiles
$cmd2 = @"
aws dynamodb create-table ``
  --table-name itselfcare-patients ``
  --attribute-definitions AttributeName=patientId,AttributeType=S ``
  --key-schema AttributeName=patientId,KeyType=HASH ``
  --billing-mode $BILLING_MODE ``
  --region $REGION
"@
Create-DynamoDBTable -TableName "itselfcare-patients" -CreateCommand $cmd2

# Table 3: Appointments
$cmd3 = @"
aws dynamodb create-table ``
  --table-name itselfcare-appointments ``
  --attribute-definitions ``
    AttributeName=appointmentId,AttributeType=S ``
    AttributeName=appointmentDate,AttributeType=S ``
    AttributeName=patientId,AttributeType=S ``
    AttributeName=therapistId,AttributeType=S ``
  --key-schema ``
    AttributeName=appointmentId,KeyType=HASH ``
    AttributeName=appointmentDate,KeyType=RANGE ``
  --global-secondary-indexes ``
    '[{\"IndexName\":\"patient-appointments\",\"KeySchema\":[{\"AttributeName\":\"patientId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"appointmentDate\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}},{\"IndexName\":\"therapist-appointments\",\"KeySchema\":[{\"AttributeName\":\"therapistId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"appointmentDate\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]' ``
  --billing-mode $BILLING_MODE ``
  --region $REGION
"@
Create-DynamoDBTable -TableName "itselfcare-appointments" -CreateCommand $cmd3

# Table 4: Reviews
$cmd4 = @"
aws dynamodb create-table ``
  --table-name itselfcare-reviews ``
  --attribute-definitions ``
    AttributeName=reviewId,AttributeType=S ``
    AttributeName=therapistId,AttributeType=S ``
    AttributeName=createdAt,AttributeType=S ``
  --key-schema AttributeName=reviewId,KeyType=HASH ``
  --global-secondary-indexes ``
    '[{\"IndexName\":\"therapist-reviews\",\"KeySchema\":[{\"AttributeName\":\"therapistId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"createdAt\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]' ``
  --billing-mode $BILLING_MODE ``
  --region $REGION
"@
Create-DynamoDBTable -TableName "itselfcare-reviews" -CreateCommand $cmd4

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Verifying All Tables" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Listing all tables..." -ForegroundColor Yellow
try {
    $tablesJson = aws dynamodb list-tables --region $REGION | ConvertFrom-Json
    $itselfcareTables = $tablesJson.TableNames | Where-Object { $_ -like "itselfcare-*" }
    
    if ($itselfcareTables.Count -eq 0) {
        Write-Host "⚠️  No itselfcare tables found" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Found the following tables:" -ForegroundColor Green
        foreach ($table in $itselfcareTables) {
            Write-Host "   - $table" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "⚠️  Could not list tables: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ All DynamoDB tables have been created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Tables created:" -ForegroundColor White
Write-Host "  1. itselfcare-therapists (with location-index GSI)" -ForegroundColor Gray
Write-Host "  2. itselfcare-patients" -ForegroundColor Gray
Write-Host "  3. itselfcare-appointments (with patient-appointments and therapist-appointments GSIs)" -ForegroundColor Gray
Write-Host "  4. itselfcare-reviews (with therapist-reviews GSI)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Set up AWS Cognito user pools (see AWS_SETUP_GUIDE.md)" -ForegroundColor White
Write-Host "  2. Create Lambda functions for business logic" -ForegroundColor White
Write-Host "  3. Configure API Gateway endpoints" -ForegroundColor White
Write-Host "  4. Update .env file with AWS credentials" -ForegroundColor White
Write-Host "  5. Install AWS SDK: npm install aws-amplify @aws-amplify/ui-react" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see:" -ForegroundColor Yellow
Write-Host "  - AWS_SETUP_GUIDE.md (complete setup guide)" -ForegroundColor White
Write-Host "  - AWS_CLI_PERMISSIONS_GUIDE.md (permissions troubleshooting)" -ForegroundColor White
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
