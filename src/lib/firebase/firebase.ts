import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Default configuration from environment variables
const envConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Hardcoded fallback configuration for production
// This ensures authentication works even if environment variables aren't properly set
const fallbackConfig = {
  apiKey: "AIzaSyATHLDeMHQN530DBX9S8BlxGZqi2Pl5L3U",
  authDomain: "aha-9cb21.firebaseapp.com",
  projectId: "aha-9cb21",
  storageBucket: "aha-9cb21.firebasestorage.app",
  messagingSenderId: "858781570616",
  appId: "1:858781570616:web:f65e7214296fb6d78278cd",
  measurementId: "G-3TVB9T134F"
};

// Use environment variables if available, otherwise use fallback
const firebaseConfig = {
  apiKey: envConfig.apiKey || fallbackConfig.apiKey,
  authDomain: envConfig.authDomain || fallbackConfig.authDomain,
  projectId: envConfig.projectId || fallbackConfig.projectId,
  storageBucket: envConfig.storageBucket || fallbackConfig.storageBucket,
  messagingSenderId: envConfig.messagingSenderId || fallbackConfig.messagingSenderId,
  appId: envConfig.appId || fallbackConfig.appId,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
