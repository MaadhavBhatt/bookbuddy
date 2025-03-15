// This file handles Firebase configuration
// Schools will replace these with their own Firebase project details from .env

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
};

// Check whether Firebase or local storage should be used
const useFirebase = process.env.VUE_APP_USE_FIREBASE === 'true';

export { firebaseConfig, useFirebase };
