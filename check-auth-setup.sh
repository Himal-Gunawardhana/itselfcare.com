#!/bin/bash

# Authentication Setup Verification Script
# This script checks if all required configurations are in place

echo "🔍 Checking Authentication Setup..."
echo "=================================="
echo ""

# Check .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "   Please create .env file from .env.example"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Check required environment variables
echo "📋 Checking environment variables:"
echo ""

check_env_var() {
    local var_name=$1
    local var_value=$(grep "^${var_name}=" .env | cut -d '=' -f2)
    
    if [ -z "$var_value" ]; then
        echo "❌ $var_name: Not set"
        return 1
    elif [[ "$var_value" == *"your-"* ]] || [[ "$var_value" == *"example"* ]]; then
        echo "⚠️  $var_name: Using placeholder value"
        echo "   Value: $var_value"
        return 2
    else
        echo "✅ $var_name: Configured"
        return 0
    fi
}

# Track status
all_good=true
needs_config=false

# Check Cognito variables
check_env_var "VITE_COGNITO_PATIENT_USER_POOL_ID"
[ $? -ne 0 ] && all_good=false
[ $? -eq 2 ] && needs_config=true

check_env_var "VITE_COGNITO_PATIENT_CLIENT_ID"
[ $? -ne 0 ] && all_good=false
[ $? -eq 2 ] && needs_config=true

check_env_var "VITE_COGNITO_THERAPIST_USER_POOL_ID"
[ $? -ne 0 ] && all_good=false
[ $? -eq 2 ] && needs_config=true

check_env_var "VITE_COGNITO_THERAPIST_CLIENT_ID"
[ $? -ne 0 ] && all_good=false
[ $? -eq 2 ] && needs_config=true

check_env_var "VITE_GOOGLE_CLIENT_ID"
[ $? -ne 0 ] && all_good=false
[ $? -eq 2 ] && needs_config=true

check_env_var "VITE_COGNITO_PATIENT_DOMAIN"
[ $? -ne 0 ] && all_good=false
[ $? -eq 2 ] && needs_config=true

check_env_var "VITE_COGNITO_THERAPIST_DOMAIN"
[ $? -ne 0 ] && all_good=false
[ $? -eq 2 ] && needs_config=true

echo ""
echo "=================================="
echo ""

if $all_good && ! $needs_config; then
    echo "✅ All authentication configurations are set!"
    echo ""
    echo "You can now:"
    echo "  1. Run 'npm run dev' to start the development server"
    echo "  2. Navigate to /echanneling/login to test authentication"
    echo "  3. Try signing in with email/password or Google"
    exit 0
elif $needs_config; then
    echo "⚠️  Some configurations are using placeholder values"
    echo ""
    echo "Next steps:"
    echo "  1. Follow AUTH_SETUP_GUIDE.md to get your credentials"
    echo "  2. Update .env file with actual values"
    echo "  3. Run this script again to verify"
    echo ""
    echo "Quick links:"
    echo "  • Google Cloud Console: https://console.cloud.google.com/"
    echo "  • AWS Cognito Console: https://console.aws.amazon.com/cognito/"
    exit 1
else
    echo "❌ Missing required configurations"
    echo ""
    echo "Please check AUTH_SETUP_GUIDE.md for setup instructions"
    exit 1
fi
