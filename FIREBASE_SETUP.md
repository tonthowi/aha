# Firebase Setup Guide

This document provides instructions for setting up Firebase with this application, including migrating existing data and configuring security rules.

## Prerequisites

1. A Google account
2. Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enter a project name (e.g., "TIL-App")
4. Choose whether to enable Google Analytics (recommended)
5. Complete the project creation

## Step 2: Set Up Firebase Services

### Authentication

1. In the Firebase Console, go to "Authentication" and click "Get Started"
2. Enable the authentication methods you want to use (at minimum, enable Google Sign-in)
3. For Google Sign-in:
   - Click the "Edit" icon (pencil)
   - Enable the provider
   - Configure the OAuth consent screen if prompted
   - Click "Save"

### Firestore Database

1. In the Firebase Console, go to "Firestore Database" and click "Create database"
2. Choose your preferred starting mode (we recommend "Start in test mode" initially for easier setup)
3. Select a database location closest to your users
4. Click "Enable"

### Storage (for media uploads)

1. In the Firebase Console, go to "Storage" and click "Get Started"
2. Follow the setup steps and choose a location
3. Start with the default security rules for now

## Step 3: Add Firebase to Your Application

1. In the Firebase Console, click on the gear icon next to "Project Overview" and select "Project settings"
2. Click on the web app icon (</>) to add a web app
3. Register your app with a nickname (e.g., "TIL Web App")
4. Copy the Firebase configuration object provided

5. Create a `.env.local` file in the root of your project with the following variables (replace with your actual Firebase config values):

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
ADMIN_API_KEY=choose-a-secure-admin-key-for-seeding-and-admin-routes
```

## Step 4: Deploy Firebase Security Rules

1. Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select "Firestore" and "Storage" features
   - Choose your Firebase project
   - Accept the default file names for rules files

4. Get the recommended security rules by calling the helper API route:
   ```
   GET /api/firebase-rules?apiKey=your-admin-api-key
   ```

5. Copy the returned rules into the respective files:
   - `firestore.rules` - For Firestore database rules
   - `storage.rules` - For Firebase Storage rules

6. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

## Step 5: Seed Initial Data

After setting up your Firebase project and configuring the environment variables, you can seed the database with initial data:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit the seeding endpoint in your browser or using curl:
   ```
   GET /api/firebase-seed?apiKey=your-admin-api-key
   ```

This will create initial posts in your Firestore database.

## Step 6: Test Your Setup

1. Visit your application and verify:
   - Authentication works (sign in/sign out)
   - Posts are loading from Firestore
   - New posts can be created
   - Likes and bookmarks are working

## Troubleshooting

### Authentication Issues

- Check that the Firebase config variables are correctly set in your `.env.local` file
- Ensure the authentication method is enabled in Firebase Console
- Check browser console for errors

### Database Access Issues

- Verify your security rules allow the operations you're trying to perform
- Check that your database exists and is configured correctly
- Ensure your app is properly initialized with Firebase

### Other Issues

- Clear browser cache and cookies
- Restart the development server
- Check the Firebase Console logs for errors
- Verify all dependencies are properly installed

## Next Steps

- Set up Firebase Analytics for monitoring user behavior
- Configure Firebase Performance Monitoring
- Set up Firebase Hosting for deployment
- Implement more advanced security rules as needed 