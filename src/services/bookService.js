/**
 * @fileoverview Book Service for BookBuddy
 *
 * This service handles all interactions with the books collection in Firestore,
 * providing methods for retrieving and searching books.
 *
 * @module bookService
 */

import { db, firestoreLib } from '@/firebase';

const { collection, getDocs } = firestoreLib;

/**
 * Book Service object containing all book-related functionality
 */
const bookService = {
  /**
   * Retrieves all books from the database
   *
   * @returns {Promise<Array>} Array of book objects with their document IDs
   */
  async getAllBooks() {
    try {
      const querySnapshot = await getDocs(collection(db, 'books'));
      const books = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return books;
    } catch (error) {
      console.error('Error getting books:', error);
      return [];
    }
  },

  /**
   * Searches for books that match the provided query string
   *
   * Performs a client-side search on book titles, authors, and descriptions.
   * If the search query is empty, returns all books.
   *
   * @param {string} searchQuery - The search term to filter books by
   * @returns {Promise<Array>} Array of book objects that match the search criteria
   */
  async searchBooks(searchQuery) {
    if (!searchQuery || searchQuery.trim() === '') {
      return this.getAllBooks();
    }

    try {
      // Get all books and filter client-side
      const allBooks = await this.getAllBooks();
      const searchTerm = searchQuery.toLowerCase().trim();

      const filteredBooks = allBooks.filter(
        (book) =>
          (book.title && book.title.toLowerCase().includes(searchTerm)) ||
          (book.author && book.author.toLowerCase().includes(searchTerm)) ||
          (book.description &&
            book.description.toLowerCase().includes(searchTerm))
      );

      return filteredBooks;
    } catch (error) {
      console.error('Error searching books:', error);
      return [];
    }
  },
};

export default bookService;
