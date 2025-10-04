# Firebase Setup Instructions

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "dashboard-metrics")
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## 3. Get Your Configuration

1. In your Firebase project, go to "Project Settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Enter an app nickname (e.g., "dashboard-web")
5. Click "Register app"
6. Copy the configuration object

## 4. Update Configuration

Replace the placeholder values in `src/firebase/config.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 5. Security Rules (Optional)

For production, you'll want to set up proper security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for now
    // In production, you should implement proper authentication and authorization
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 6. Test the Connection

Once configured, your dashboard will automatically sync with Firebase!
