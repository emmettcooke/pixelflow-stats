# 🔐 Environment Variables Setup

## Security Alert Resolved

Your Firebase API key was exposed in the code. This has been fixed by moving all sensitive configuration to environment variables.

## 🚀 Setup Instructions

### 1. Create Environment File

Create a `.env` file in the root directory with your Firebase configuration:

```bash
# Create the .env file
touch .env
```

### 2. Add Your Firebase Configuration

Add the following to your `.env` file:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-actual-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=pixelflowstats.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=pixelflowstats
REACT_APP_FIREBASE_STORAGE_BUCKET=pixelflowstats.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1015584736303
REACT_APP_FIREBASE_APP_ID=1:1015584736303:web:611d9aa94b2a6126d432da
```

### 3. Get Your Firebase Configuration

If you need to get your Firebase configuration:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `pixelflowstats`
3. Go to **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. Click on your web app
6. Copy the configuration values

### 4. Restart Your Development Server

After creating the `.env` file:

```bash
npm start
```

## 🔒 Security Best Practices

### ✅ What's Fixed
- Firebase API key moved to environment variables
- `.env` file added to `.gitignore`
- Sensitive data no longer exposed in code

### 🚨 Important Security Steps

1. **Rotate Your API Key** (Recommended):
   - Go to Firebase Console → Project Settings → General
   - Under "Web API Key", click "Regenerate key"
   - Update your `.env` file with the new key

2. **Restrict API Key Usage**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services → Credentials
   - Find your Firebase API key
   - Add HTTP referrer restrictions for your domain

3. **Review Firestore Rules**:
   - Ensure your Firestore rules require authentication
   - Don't use `allow read, write: if true` in production

## 🎯 Next Steps

1. Create your `.env` file with the configuration above
2. Restart your development server
3. Test that the application works correctly
4. Consider rotating your API key for extra security

## 📝 Notes

- The `.env` file is already added to `.gitignore` so it won't be committed
- All environment variables must start with `REACT_APP_` to be accessible in React
- Never commit your `.env` file to version control
