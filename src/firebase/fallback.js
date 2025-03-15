import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from './mockFirestore';
import booksData from '@/data/books.json';

// Create a fallback database using localStorage
const getFallbackDb = () => {
  // Initialize localStorage with sample data if empty
  if (!localStorage.getItem('bookbuddy_books')) {
    localStorage.setItem('bookbuddy_books', JSON.stringify(booksData.books));
  }

  return {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
  };
};

export { getFallbackDb };
