import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
// You'll need to replace these with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyCf3Bh3pVAlDpN2vAwoiGoipmJ34q9t5_k",
  authDomain: "pixelflowstats.firebaseapp.com",
  projectId: "pixelflowstats",
  storageBucket: "pixelflowstats.firebasestorage.app",
  messagingSenderId: "1015584736303",
  appId: "1:1015584736303:web:611d9aa94b2a6126d432da"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
