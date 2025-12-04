# Troubleshooting Guide

## Issue: Blank Page After Authentication Setup

### What Happened?

After implementing AWS Cognito authentication, you may see a blank page. This happens because:

1. **Cognito Not Configured Yet**: The authentication system tries to initialize AWS Cognito User Pools, but the configuration (Google OAuth, Cognito domains) isn't complete yet.

2. **Environment Variables**: The `.env` file has placeholder values that need to be replaced with actual credentials.

### ✅ Quick Fix Applied

I've updated the code to gracefully handle missing Cognito configuration:

1. **AuthProvider Updated**: Now checks if Cognito is configured before attempting authentication
2. **Safe Initialization**: User Pools only initialize if environment variables are valid
3. **Graceful Fallback**: If not configured, it logs a message and continues loading the app
4. **Old Login Restored**: `/echanneling/login` now uses the old login page that works without Cognito

### 🔍 Current Status

Your app should now be working with these changes:

- ✅ Homepage loads normally
- ✅ Old login page at `/echanneling/login` (works without Cognito)
- ✅ New login page at `/echanneling/login-new` (requires Cognito setup)
- ✅ All other pages working normally

### 📋 What to Check

1. **Open your browser**: http://localhost:5173
2. **Check browser console**: Should see "Cognito not configured" message (this is normal)
3. **Test navigation**: Homepage and other pages should work
4. **Old login works**: Go to `/echanneling/login` - should show the old login page

### 🚀 Next Steps

#### Option 1: Keep Using Old Authentication (Immediate)

- Continue using the current system
- Old login at `/echanneling/login` works without any changes
- No configuration needed

#### Option 2: Complete Cognito Setup (10-15 minutes)

Follow the guide to enable the new authentication:

1. **Read the Quick Start Guide**:

   ```bash
   cat QUICK_START_AUTH.md
   ```

   Or open it in VS Code

2. **Follow These Steps**:

   - Step 1: Set up Google OAuth (5 minutes)
   - Step 2: Configure Cognito Hosted UI (5 minutes)
   - Step 3: Update `.env` file (1 minute)
   - Step 4: Verify configuration (1 minute)

3. **After Configuration**:
   - New login available at `/echanneling/login-new`
   - Google Sign-In button will work
   - Change route in `main.tsx` to use new login by default

### 🔧 Verification Commands

```bash
# Check if Cognito is configured
./check-auth-setup.sh

# View frontend logs (should show "Cognito not configured" message)
# Open browser console: Cmd+Option+I (Mac) or F12 (Windows/Linux)

# Restart dev server if needed
npm run dev
```

### 📝 What Was Changed

1. **src/services/auth.ts**

   - Added null checks for User Pools
   - Graceful error handling if pools can't initialize
   - Throws clear error messages

2. **src/contexts/AuthContext.tsx**

   - Added `isCognitoConfigured` check
   - Skips authentication if not configured
   - Logs helpful message to console

3. **src/main.tsx**
   - Restored old login as default: `/echanneling/login`
   - New login available at: `/echanneling/login-new`

### 🐛 Still Having Issues?

#### Blank Page Persists

1. **Check browser console** (F12 or Cmd+Option+I)
2. **Look for errors** - Share them for debugging
3. **Clear browser cache**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. **Restart dev server**:
   ```bash
   # Stop: Ctrl+C
   npm run dev
   ```

#### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

#### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npm run dev
```

### 📚 Related Documentation

- **QUICK_START_AUTH.md** - How to set up Cognito (10 minutes)
- **AUTH_SETUP_GUIDE.md** - Detailed technical guide
- **IMPLEMENTATION_COMPLETE.md** - What's been implemented
- **check-auth-setup.sh** - Verify your configuration

### 💡 Pro Tips

1. **Two Login Pages**: You have both old and new login pages. Use whichever works for you.
2. **No Rush**: The old authentication works fine. Set up Cognito when you're ready.
3. **Check Console**: Browser console messages will guide you if something's wrong.
4. **Environment Variables**: If you change `.env`, restart the dev server.

---

**Status**: ✅ App should be working now with old login
**Cognito Status**: ⚠️ Not configured (optional, follow QUICK_START_AUTH.md when ready)
**Frontend**: http://localhost:5173
**Backend**: http://localhost:8000
