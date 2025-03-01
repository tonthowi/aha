import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import env from "@/lib/config/env";

// Use the dedicated environment configuration
const firebaseConfig = env.firebase;

// Check if required Firebase config values are present
const isFirebaseConfigValid = 
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId && 
  firebaseConfig.storageBucket && 
  firebaseConfig.messagingSenderId && 
  firebaseConfig.appId;

// Debug log for Firebase config
console.log('Firebase Config Status:', {
  apiKey: firebaseConfig.apiKey ? 'DEFINED' : 'UNDEFINED',
  authDomain: firebaseConfig.authDomain ? 'DEFINED' : 'UNDEFINED',
  projectId: firebaseConfig.projectId ? 'DEFINED' : 'UNDEFINED',
  storageBucket: firebaseConfig.storageBucket ? 'DEFINED' : 'UNDEFINED',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'DEFINED' : 'UNDEFINED',
  appId: firebaseConfig.appId ? 'DEFINED' : 'UNDEFINED',
  isValid: isFirebaseConfigValid
});

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

try {
  if (!isFirebaseConfigValid) {
    throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
  }
  
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // In development, show a more helpful error message
  if (process.env.NODE_ENV === 'development') {
    console.error('Please ensure all Firebase environment variables are set in your .env.local file');
  }
}

export { app, auth, db, storage };
