# Google Sign-In with Cognito Managed Login Setup

This guide shows you how to set up Google Sign-In using AWS Cognito's Managed Login (not Hosted UI).

## Prerequisites

✅ You already have:

- Two Cognito User Pools (Patient and Therapist)
- User Pool IDs and Client IDs configured in `.env`

## Setup Steps (15 minutes)

### 1. Create Google OAuth Credentials (5 mins)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure consent screen if prompted:
   - App name: "ItselfCare"
   - User support email: your email
   - Developer contact: your email
6. For Application type, select **Web application**
7. Add these Authorized redirect URIs:
   ```
   http://localhost:5173/auth/callback
   https://yourdomain.com/auth/callback
   ```
8. Click **Create** and copy your **Client ID**

### 2. Configure Cognito Identity Providers (10 mins)

#### For Patient User Pool:

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Select your **Patient User Pool** (`eu-north-1_hNsybitDp`)
3. Go to **Sign-in experience** → **Federated identity provider sign-in**
4. Click **Add identity provider**
5. Select **Google**
6. Enter:
   - **Google client ID**: Your Google OAuth Client ID
   - **Google client secret**: Your Google OAuth Client Secret
   - **Authorized scopes**: `profile email openid`
7. Click **Add identity provider**
8. Go to **App integration** → **App clients**
9. Select your app client (`2i45nnk57gnh3d9nff48tdlo5q`)
10. Under **Hosted UI settings**:
    - Add allowed callback URL: `http://localhost:5173/auth/callback`
    - Add sign-out URL: `http://localhost:5173/echanneling/login`
11. Under **Identity providers**, enable **Google**
12. Copy your **Cognito domain** (e.g., `itselfcare-patient.auth.eu-north-1.amazoncognito.com`)

#### For Therapist User Pool:

Repeat the same steps for the **Therapist User Pool** (`eu-north-1_KZRNm67gI`):

- Use the same Google Client ID and Secret
- Use app client: `4ot8keg62n7dni63jcl34tp8r6`
- Use a different domain (e.g., `itselfcare-therapist.auth.eu-north-1.amazoncognito.com`)

### 3. Update Environment Variables

Update your `.env` file:

```bash
# Google OAuth (same for both pools)
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com

# Patient Cognito Domain (without https://)
VITE_COGNITO_PATIENT_DOMAIN=itselfcare-patient.auth.eu-north-1.amazoncognito.com

# Therapist Cognito Domain (without https://)
VITE_COGNITO_THERAPIST_DOMAIN=itselfcare-therapist.auth.eu-north-1.amazoncognito.com
```

**Important**:

- Do NOT include `https://` in the domain values
- Do NOT include trailing slashes

### 4. Test Google Sign-In

1. Restart your dev server: `npm run dev`
2. Go to http://localhost:5173/echanneling/login
3. Select **Patient** or **Therapist** tab
4. Click **Sign in with Google**
5. You should be redirected to Google's sign-in page
6. After signing in, you'll be redirected back to your app's dashboard

## Architecture

### How it works:

1. **User clicks "Sign in with Google"**

   - App calls `signInWithGoogle(userType)` from `auth.ts`
   - Amplify is configured with the correct User Pool for patient/therapist
   - User type is stored in localStorage as 'pending_user_type'

2. **Redirect to Google**

   - Amplify SDK initiates OAuth redirect to Google
   - Uses Cognito's federated identity provider setup
   - Google authenticates the user

3. **OAuth Callback**

   - Google redirects to `/auth/callback` with auth code
   - `AuthCallback.tsx` calls `handleAuthCallback()` from `auth.ts`
   - Amplify exchanges code for Cognito tokens
   - User info is extracted from ID token

4. **Profile Creation**
   - Backend API is called to create/fetch user profile
   - User is stored in localStorage
   - Redirected to appropriate dashboard

## Key Differences from Hosted UI

**Managed Login** (what you're using):

- ✅ More control over UI/UX
- ✅ Native app integration
- ✅ Custom error handling
- ✅ Better user experience
- ✅ Uses Amplify SDK for token management

**Hosted UI** (traditional):

- Cognito provides the entire login page
- Less customization
- Simpler setup but less flexible

## Troubleshooting

### "Configuration Required" Error

- Check that `.env` has real Google Client ID (not placeholder)
- Check that Cognito domains are set correctly (no `https://`, no trailing `/`)
- Restart dev server after changing `.env`

### "Failed to initiate Google Sign-In"

- Check browser console for detailed error
- Verify Google OAuth Client ID is correct
- Verify redirect URIs match in Google Console and Cognito

### Redirect Loop

- Clear localStorage: `localStorage.clear()`
- Check that redirect URIs are exactly the same in:
  - Google Cloud Console
  - Cognito User Pool App Client settings
  - `.env` file (implicitly via `${window.location.origin}/auth/callback`)

### "No tokens received"

- Check Cognito App Client has Google enabled as identity provider
- Verify authorized scopes include: `profile email openid`
- Check Network tab in browser DevTools for failed requests

## Files Modified

- `src/services/auth.ts` - Added Amplify integration and `signInWithGoogle()`
- `src/pages/echanneling/EChannelingLogin.tsx` - Updated to use new function
- `src/pages/echanneling/AuthCallback.tsx` - Updated to handle Amplify session
- `.env` - Added Google Client ID and Cognito domains

## Next Steps

After Google Sign-In works:

1. Add email/password registration and login flows
2. Add password reset functionality
3. Add multi-factor authentication (MFA)
4. Set up production domains in Google Console
5. Configure production Cognito domains
