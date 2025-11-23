#!/bin/bash

# ItselfCare Backend - Quick Start Script
# This script sets up and runs the FastAPI backend

echo "🚀 ItselfCare Backend Quick Start"
echo "=================================="

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.12 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your AWS credentials before running!"
    echo "   - COGNITO_USERPOOL_ID"
    echo "   - COGNITO_APP_CLIENT_ID"
    echo ""
    echo "Press Enter to continue or Ctrl+C to exit and configure .env first..."
    read -r
fi

# Check AWS credentials
echo "🔐 Checking AWS credentials..."
if [ -z "$AWS_ACCESS_KEY_ID" ] && [ ! -f "$HOME/.aws/credentials" ]; then
    echo "⚠️  AWS credentials not found. Make sure you have:"
    echo "   1. AWS CLI configured (~/.aws/credentials), OR"
    echo "   2. AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables set"
    echo ""
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📡 Starting FastAPI server on http://localhost:8000"
echo "   - API Documentation: http://localhost:8000/docs"
echo "   - ReDoc: http://localhost:8000/redoc"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
uvicorn app.main:app --reload --port 8000
