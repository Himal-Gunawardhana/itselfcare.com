# Quick Start: AWS Cognito Authentication with Google Sign-In

## 🚀 What's Been Implemented

Your authentication system is now code-complete with:

✅ **AWS Cognito Integration**

- Complete authentication service (`src/services/auth.ts`)
- React context for global auth state (`src/contexts/AuthContext.tsx`)
- Email/password authentication
- Email verification flow
- Password reset functionality

✅ **Google Sign-In**

- Google OAuth button ready
- Cognito Hosted UI integration
- Automatic profile creation after OAuth

✅ **New Pages Created**

- `/echanneling/login` - Enhanced login with Google Sign-In
- `/auth/callback` - OAuth callback handler
- `/echanneling/confirm` - Email verification page

✅ **Dependencies Installed**

- amazon-cognito-identity-js (^6.3.12)
- aws-amplify (^6.0.25)

## ⚙️ What You Need to Configure

### Current Status

```bash
✅ Cognito User Pools configured
✅ Cognito Client IDs configured
⚠️  Google OAuth credentials needed
⚠️  Cognito Hosted UI domains needed
```

Run `./check-auth-setup.sh` anytime to verify your configuration status.

## 📋 Step-by-Step Setup (5-10 minutes)

### Step 1: Set Up Google OAuth (5 minutes)

1. **Go to Google Cloud Console**

   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**

   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**

   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "ItSelfCare Authentication"

4. **Configure OAuth Consent Screen** (if not done)

   - User Type: External
   - App name: "ItSelfCare"
   - User support email: your email
   - Developer contact: your email
   - Scopes: email, profile, openid
   - Add test users: your email

5. **Set Authorized Origins and Redirect URIs**

   ```
   Authorized JavaScript origins:
   - http://localhost:5173
   - https://itselfcare.com (your production domain)

   Authorized redirect URIs:
   - https://itselfcare-patient.auth.eu-north-1.amazoncognito.com/oauth2/idpresponse
   - https://itselfcare-therapist.auth.eu-north-1.amazoncognito.com/oauth2/idpresponse
   ```

   ⚠️ Replace `itselfcare-patient` and `itselfcare-therapist` with your actual Cognito domain prefixes (you'll create these in Step 2)

6. **Copy Your Client ID**
   - Copy the Client ID (looks like: `xxxxx.apps.googleusercontent.com`)
   - Copy the Client Secret
   - Keep these for Step 2

### Step 2: Configure AWS Cognito Hosted UI (5 minutes)

#### For Patient User Pool

1. **Go to AWS Cognito Console**

   - Visit: https://console.aws.amazon.com/cognito/
   - Region: eu-north-1
   - User pool ID: `eu-north-1_hNsybitDp`

2. **Add Google as Identity Provider**

   - Go to "Sign-in experience" tab
   - Under "Federated identity provider sign-in", click "Add identity provider"
   - Select "Google"
   - Enter your Google Client ID
   - Enter your Google Client Secret
   - Authorized scopes: `profile email openid`
   - Click "Add identity provider"

3. **Set Up Hosted UI Domain**

   - Go to "App integration" tab
   - Under "Domain", click "Actions" → "Create Cognito domain"
   - Domain prefix: `itselfcare-patient` (or your preferred name)
   - Click "Create Cognito domain"
   - Your domain will be: `itselfcare-patient.auth.eu-north-1.amazoncognito.com`

4. **Configure App Client**
   - Go to "App integration" tab
   - Find your app client (ID: `2i45nnk57gnh3d9nff48tdlo5q`)
   - Click "Edit"
   - Under "Hosted UI settings":
     - Allowed callback URLs: `http://localhost:5173/auth/callback`
     - Allowed sign-out URLs: `http://localhost:5173`
     - Identity providers: Select "Google"
     - OAuth 2.0 grant types: Check "Authorization code grant"
     - OpenID Connect scopes: Check `email`, `openid`, `profile`
   - Click "Save changes"

#### For Therapist User Pool

Repeat the same steps above for the therapist pool:

- User pool ID: `eu-north-1_KZRNm67gI`
- App client ID: `4ot8keg62n7dni63jcl34tp8r6`
- Domain prefix: `itselfcare-therapist`

### Step 3: Update .env File

Update your `.env` file with the actual values:

```bash
# Replace these placeholder values:
VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_GOOGLE_CLIENT_ID.apps.googleusercontent.com
VITE_COGNITO_PATIENT_DOMAIN=itselfcare-patient.auth.eu-north-1.amazoncognito.com
VITE_COGNITO_THERAPIST_DOMAIN=itselfcare-therapist.auth.eu-north-1.amazoncognito.com
```

### Step 4: Update Google OAuth Redirect URIs

**Important**: Now that you have your Cognito domains, go back to Google Cloud Console:

1. Go to "APIs & Services" → "Credentials"
2. Edit your OAuth 2.0 Client
3. Update "Authorized redirect URIs" with your actual Cognito domains:
   ```
   - https://itselfcare-patient.auth.eu-north-1.amazoncognito.com/oauth2/idpresponse
   - https://itselfcare-therapist.auth.eu-north-1.amazoncognito.com/oauth2/idpresponse
   ```
4. Click "Save"

### Step 5: Verify Configuration

```bash
./check-auth-setup.sh
```

You should see all green checkmarks! ✅

## 🧪 Test Your Authentication

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test Email/Password Authentication

1. Navigate to: http://localhost:5173/echanneling/login
2. Click on "Patient" or "Therapist" tab
3. If you have existing users in Cognito, try signing in
4. If not, you'll need to create users via AWS Cognito Console first

### 3. Test Google Sign-In

1. Go to: http://localhost:5173/echanneling/login
2. Click "Sign in with Google" button
3. You'll be redirected to Cognito Hosted UI
4. Choose Google
5. Sign in with your Google account
6. You'll be redirected back to your dashboard

## 🔍 Troubleshooting

### "Invalid redirect_uri" Error

- Make sure you added `http://localhost:5173/auth/callback` to your Google OAuth Authorized redirect URIs
- Make sure you added the callback URL to your Cognito App Client settings

### "Google identity provider not found"

- Verify you added Google as an identity provider in Cognito
- Check that you selected Google in the App Client's "Identity providers" setting

### "Invalid client_id"

- Double-check your `.env` file has the correct Client IDs
- Make sure you're using `VITE_COGNITO_PATIENT_CLIENT_ID` and `VITE_COGNITO_THERAPIST_CLIENT_ID`

### Google Sign-In button doesn't work

- Check browser console for errors
- Verify your domain is configured in both Cognito pools
- Make sure `.env` variables are loaded (restart dev server after changing .env)

### Users can't sign in with email/password

- Create test users in AWS Cognito Console
- Mark their email as verified
- Set a permanent password

## 📚 Additional Resources

- Full setup guide: `AUTH_SETUP_GUIDE.md`
- AWS Cognito Documentation: https://docs.aws.amazon.com/cognito/
- Google OAuth 2.0: https://developers.google.com/identity/protocols/oauth2

## 🎯 Next Steps

After successful authentication setup:

1. **Create User Registration Page**

   - Update `EChannelingRegister.tsx` to use Cognito
   - Implement email verification flow

2. **Update Backend JWT Validation**

   - Modify `itselfcare-backend/app/auth.py`
   - Verify Cognito JWT tokens

3. **Add Protected Routes**

   - Create route guards for authenticated-only pages
   - Redirect to login if not authenticated

4. **Production Deployment**
   - Update Cognito callback URLs with production domain
   - Update Google OAuth authorized origins
   - Set up custom domain for Cognito Hosted UI

## ❓ Need Help?

If you encounter issues:

1. Run `./check-auth-setup.sh` to verify configuration
2. Check browser console for errors
3. Check AWS CloudWatch logs for Cognito errors
4. Review `AUTH_SETUP_GUIDE.md` for detailed explanations

---

**Status**: ✅ Code Complete | ⚠️ Configuration Needed

Once you complete the configuration steps above, your authentication system will be fully operational!
