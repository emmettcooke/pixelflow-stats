# Deploy Updated Firestore Security Rules for Custom Metrics

The error "Missing or insufficient privileges" occurs because the new `customMetricEntries` collection doesn't have security rules set up yet.

## Quick Fix - Deploy the Updated Rules

### Option 1: Using Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pixelflowstats**
3. Click **Firestore Database** in the left menu
4. Click the **Rules** tab at the top
5. Replace the entire content with the rules from `firestore.rules` in this project
6. Click **Publish**

### Option 2: Using Firebase CLI

If you have Firebase CLI installed:

```bash
firebase deploy --only firestore:rules
```

If you don't have Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init  # Select Firestore, use existing project
firebase deploy --only firestore:rules
```

## What Changed?

Added security rules for the new `customMetricEntries` collection:

```javascript
// Custom metric entries collection - users can only access their own entries
match /customMetricEntries/{entryId} {
  // Allow read if user is authenticated and document belongs to them
  allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
  
  // Allow create if user is authenticated and setting their own userId
  allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
  
  // Allow update/delete if user owns the document
  allow update, delete: if isSignedIn() && resource.data.userId == request.auth.uid;
}
```

This ensures:
- Users can only see their own custom metric data
- Users can only create entries with their own userId
- Users can only update/delete their own entries

## After Deploying

Once the rules are deployed:
1. Refresh your dashboard
2. Try adding a custom metric again
3. Add monthly data for it
4. The chart should now display correctly!

## Need Help?

If you continue to see the error after deploying:
1. Check the Firebase Console > Firestore Database > Rules to confirm they're published
2. Try logging out and back in to refresh your auth token
3. Check the browser console for any other error messages

