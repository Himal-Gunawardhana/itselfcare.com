# app/auth.py
import os
import time
import requests
from jose import jwt, JWTError
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

COGNITO_REGION = os.getenv("COGNITO_REGION", "eu-north-1")
COGNITO_USERPOOL_ID = os.getenv("COGNITO_USERPOOL_ID", "")
COGNITO_APP_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID", "")

JWKS_URL = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USERPOOL_ID}/.well-known/jwks.json"
_jwks = None
_jwks_last = 0
JWKS_TTL = 3600

security = HTTPBearer(auto_error=False)

def get_jwks():
    """Fetch JWKS from Cognito with caching"""
    global _jwks, _jwks_last
    if _jwks and (time.time() - _jwks_last) < JWKS_TTL:
        return _jwks
    r = requests.get(JWKS_URL, timeout=10)
    r.raise_for_status()
    _jwks = r.json()
    _jwks_last = time.time()
    return _jwks

def verify_jwt_token(creds: HTTPAuthorizationCredentials = Security(security)):
    """Verify Cognito JWT token and return claims"""
    if not creds:
        raise HTTPException(status_code=401, detail="No authentication token provided")
    
    token = creds.credentials
    
    # Development mode: Accept mock tokens
    if token.startswith("mock_"):
        # Extract user type from mock token format: mock_patient_xxx or mock_therapist_xxx
        parts = token.split("_")
        if len(parts) >= 2:
            user_type = parts[1]  # "patient" or "therapist"
            return {"user_type": user_type, "sub": token}
        raise HTTPException(status_code=401, detail="Invalid mock token format")
    
    # Production mode: Verify real Cognito JWT
    jwks = get_jwks()
    try:
        claims = jwt.decode(
            token, 
            jwks, 
            algorithms=["RS256"], 
            audience=COGNITO_APP_CLIENT_ID
        )
        # Add user_type from custom claim if available
        if "custom:user_type" in claims:
            claims["user_type"] = claims["custom:user_type"]
        return claims
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

def optional_auth(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """Optional authentication - returns claims if token is valid, None otherwise"""
    if not creds:
        return None
    try:
        return verify_jwt_token(creds)
    except HTTPException:
        return None
