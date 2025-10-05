# User Data Isolation Setup Guide

## 🔒 What Changed

Your dashboard now has **complete user data isolation**. Each user can only see and modify their own data.

## ✅ What's Been Implemented

### 1. **Database Schema Updates**
- ✅ Added `userId` field to all `metrics` documents
- ✅ Added `userId` field to all `monthlyEntries` documents

### 2. **Code Changes**
- ✅ All Firestore queries filter by `userId`
- ✅ All create operations automatically add the current user's `userId`
- ✅ Delete operations only affect the current user's data

### 3. **Security Rules**
- ✅ Created `firestore.rules` file with user isolation rules
- ⚠️ **MUST BE DEPLOYED** (see instructions below)

## 📋 Required Actions

### Step 1: Deploy Firestore Security Rules

You **MUST** deploy the new security rules to Firebase:

```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done already)
firebase init firestore

# When prompted:
# - Select your Firebase project
# - Use default firestore.rules
# - Use default firestore.indexes.json

# Deploy the rules
firebase deploy --only firestore:rules
```

### Step 2: Migrate Existing Data (If Any)

If you have existing data in your database without `userId` fields, you need to either:

**Option A: Delete existing data** (if it's test data)
```
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Delete all documents in 'metrics' collection
4. Delete all documents in 'monthlyEntries' collection
```

**Option B: Add userId to existing data** (if you want to keep it)
```javascript
// Run this script in Firebase Console (Firestore > Query)
// Or create a one-time migration script

// For metrics collection:
const metricsRef = db.collection('metrics');
const metricsSnapshot = await metricsRef.get();
metricsSnapshot.forEach(async (doc) => {
  await doc.ref.update({
    userId: 'YOUR_USER_ID_HERE' // Replace with actual user ID
  });
});

// For monthlyEntries collection:
const entriesRef = db.collection('monthlyEntries');
const entriesSnapshot = await entriesRef.get();
entriesSnapshot.forEach(async (doc) => {
  await doc.ref.update({
    userId: 'YOUR_USER_ID_HERE' // Replace with actual user ID
  });
});
```

## 🔐 How It Works Now

### When User Signs In:
1. All queries automatically filter by their `userId`
2. They only see their own metrics and monthly entries
3. They cannot access other users' data

### When Creating Data:
1. System automatically adds `userId` to new documents
2. User can only create data for themselves

### When Updating/Deleting:
1. Firestore rules verify the user owns the document
2. Operations fail if user tries to modify others' data

## 🧪 Testing User Isolation

1. **Sign up with User A**
   - Add some metrics
   - Add monthly data
   - Note what you see

2. **Sign out and sign up with User B**
   - You should see NO data from User A
   - Add different metrics
   - Add different monthly data

3. **Sign back in as User A**
   - You should only see User A's data
   - User B's data is invisible to you

## 🚨 Important Security Notes

1. **Deploy the security rules** - Without deployed rules, the database is vulnerable
2. **Test thoroughly** - Make sure users can't see each other's data
3. **Monitor Firebase Console** - Check for unauthorized access attempts

## 📊 Database Structure

```
Firestore
├── metrics (collection)
│   └── [documentId]
│       ├── userId: "user123"          ← NEW! Filters access
│       ├── id: "mrr"
│       ├── title: "MRR"
│       ├── value: 1234
│       └── ...
│
└── monthlyEntries (collection)
    └── [documentId]
        ├── userId: "user123"          ← NEW! Filters access
        ├── month: "October"
        ├── year: 2025
        ├── mrr: 1234
        └── ...
```

## ✅ Checklist

- [ ] Deploy Firestore security rules (`firebase deploy --only firestore:rules`)
- [ ] Migrate or delete existing data
- [ ] Test with multiple user accounts
- [ ] Verify users can't see each other's data
- [ ] Update Firestore indexes if needed (Firebase will prompt you)

## 🆘 Troubleshooting

### "Missing or insufficient permissions" error:
- Make sure you've deployed the security rules
- Check that the `userId` field exists on all documents
- Verify you're signed in

### Users can see each other's data:
- Security rules not deployed
- Data missing `userId` field
- Check Firebase Console > Firestore > Rules tab

### Can't create new data:
- Make sure you're signed in
- Check browser console for detailed error messages
- Verify Firebase connection

## 📚 Next Steps

1. Deploy the security rules immediately
2. Test with multiple accounts
3. Monitor Firebase usage
4. Consider adding composite indexes if needed for complex queries

Your dashboard is now **multi-tenant ready**! 🎉

