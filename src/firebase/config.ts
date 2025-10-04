import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration using environment variables with fallbacks
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCf3Bh3pVAlDpN2vAwoiGoipmJ34q9t5_k",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "pixelflowstats.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "pixelflowstats",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "pixelflowstats.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1015584736303",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1015584736303:web:150d330ee7ce52a4d432da",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-GNM8NMDNF6"
};

// Debug logging for deployment
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  hasApiKey: !!process.env.REACT_APP_FIREBASE_API_KEY,
  hasAuthDomain: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  hasProjectId: !!process.env.REACT_APP_FIREBASE_PROJECT_ID,
  hasStorageBucket: !!process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  hasMessagingSenderId: !!process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  hasAppId: !!process.env.REACT_APP_FIREBASE_APP_ID,
  hasMeasurementId: !!process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
