# Authentication Setup Guide

## AWS Cognito Setup with Google Sign-In

### 1. Configure Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `https://yourdomain.com`
   - Authorized redirect URIs:
     - `https://yourdomain.auth.eu-north-1.amazoncognito.com/oauth2/idpresponse`
7. Note down the Client ID and Client Secret

### 2. Configure AWS Cognito User Pools

#### Patient User Pool (eu-north-1_hNsybitDp)

1. Go to AWS Cognito Console
2. Select your Patient User Pool
3. Go to "Sign-in experience" → "Federated sign-in"
4. Add "Google" as identity provider:
   - Client ID: [Your Google OAuth Client ID]
   - Client secret: [Your Google OAuth Client Secret]
   - Authorized scopes: `profile email openid`
5. Go to "App integration" → "App client settings"
6. Enable Google as identity provider
7. Add callback URLs:
   - `http://localhost:5173/auth/callback`
   - `https://yourdomain.com/auth/callback`
8. Add sign-out URLs:
   - `http://localhost:5173`
   - `https://yourdomain.com`
9. Enable OAuth 2.0 flows:
   - Authorization code grant
   - Implicit grant (for development)
10. OAuth scopes: `email`, `openid`, `profile`
11. Note down the Hosted UI domain

#### Therapist User Pool (eu-north-1_KZRNm67gI)

Repeat the same steps for the Therapist User Pool.

### 3. Update Environment Variables

Add the following to your `.env` file:

```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# AWS Cognito - Patient User Pool
VITE_COGNITO_PATIENT_USER_POOL_ID=eu-north-1_hNsybitDp
VITE_COGNITO_PATIENT_CLIENT_ID=2i45nnk57gnh3d9nff48tdlo5q
VITE_COGNITO_PATIENT_REGION=eu-north-1
VITE_COGNITO_PATIENT_DOMAIN=your-patient-cognito-domain

# AWS Cognito - Therapist User Pool
VITE_COGNITO_THERAPIST_USER_POOL_ID=eu-north-1_KZRNm67gI
VITE_COGNITO_THERAPIST_CLIENT_ID=4ot8keg62n7dni63jcl34tp8r6
VITE_COGNITO_THERAPIST_REGION=eu-north-1
VITE_COGNITO_THERAPIST_DOMAIN=your-therapist-cognito-domain

# API Base URL
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Install Required Packages

```bash
npm install amazon-cognito-identity-js aws-amplify @aws-amplify/ui-react
```

### 5. Test Authentication Flow

#### Sign Up Flow:

1. User enters email, password, and profile information
2. Cognito sends verification code to email
3. User confirms with code
4. User profile created in backend (DynamoDB)

#### Sign In Flow (Email/Password):

1. User enters credentials
2. Cognito authenticates
3. Fetch user details from backend
4. Store session and user data

#### Sign In Flow (Google):

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. After approval, redirected back with auth code
4. Cognito exchanges code for tokens
5. Create/update user profile in backend
6. Store session and user data

### 6. Backend Integration

The backend needs to:

1. Validate JWT tokens from Cognito
2. Extract user sub (unique ID) from token
3. Create/update user records in DynamoDB
4. Link Cognito sub to internal patient_id/therapist_id

### 7. Security Best Practices

- Always validate tokens on the backend
- Use HTTPS in production
- Store sensitive data securely
- Implement rate limiting
- Enable MFA for production
- Rotate secrets regularly
- Monitor authentication logs

### 8. Testing

Test the following scenarios:

- ✅ Sign up with email/password
- ✅ Email verification
- ✅ Sign in with email/password
- ✅ Sign in with Google
- ✅ Password reset
- ✅ Sign out
- ✅ Token refresh
- ✅ Session persistence

### Troubleshooting

#### Common Issues:

1. **"User pool client does not exist"**

   - Verify Client ID in .env matches AWS Console

2. **"Invalid redirect URI"**

   - Check callback URLs in Cognito app client settings

3. **"Google sign-in not working"**

   - Verify Google OAuth credentials
   - Check authorized JavaScript origins
   - Ensure identity provider is enabled in Cognito

4. **"Token expired"**
   - Implement token refresh logic
   - Check token expiration settings in Cognito

For more help, see:

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
