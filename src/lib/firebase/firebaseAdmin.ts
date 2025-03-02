import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Initialize Firebase Admin
export function getFirebaseAdmin() {
  if (getApps().length === 0) {
    // Initialize with service account if available
    if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
      try {
        const serviceAccount = JSON.parse(
          Buffer.from(process.env.FIREBASE_ADMIN_CREDENTIALS, 'base64').toString()
        );
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
      } catch (error) {
        console.error('Error initializing Firebase Admin with credentials:', error);
        // Fall back to application default credentials
        admin.initializeApp();
      }
    } else {
      // Initialize with application default credentials
      admin.initializeApp();
    }
  }
  
  return admin;
} 