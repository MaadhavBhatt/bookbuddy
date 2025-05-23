// src/firebase/index.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig, useFirebase } from './config';
import { getFallbackDb } from './fallback';
import * as firestore from 'firebase/firestore';

let db;
let auth = null;
let firestoreLib;

// Check if we're using real Firebase or local fallback
if (
  useFirebase &&
  firebaseConfig.apiKey !== 'AIzaSyDummy-key-for-development'
) {
  // Initialize Firebase
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    firestoreLib = firestore;
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    db = getFallbackDb();
    firestoreLib = require('./mockFirestore');
    console.log('Using fallback database due to Firebase error');
  }
} else {
  console.log('Using local storage fallback (Firebase not configured)');
  db = getFallbackDb();
  firestoreLib = require('./mockFirestore');
}

// Export the database, auth and Firestore functions
export { db, auth, firestoreLib };
