// This script will upload sample books to Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import booksData from '@/data/books.json';

// Your Firebase config from environment variables or config file
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to upload books
async function uploadBooks() {
  try {
    console.log('Starting to upload books...');
    const books = booksData.books || [];

    if (books.length === 0) {
      console.log('No books found in the sample data.');
      return;
    }

    console.log(`Found ${books.length} books to upload.`);

    for (const book of books) {
      // Add book to Firestore
      const docRef = await addDoc(collection(db, 'books'), {
        ...book,
        status: book.status || 'available',
        addedAt: new Date().toISOString(),
      });

      console.log(`Book "${book.title}" uploaded with ID: ${docRef.id}`);
    }

    console.log('All books uploaded successfully!');
  } catch (error) {
    console.error('Error uploading books:', error);
  }
}

// Execute the upload
uploadBooks();
