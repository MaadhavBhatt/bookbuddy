import { db, firestoreLib } from '@/firebase';

// eslint-disable-next-line
const { collection, getDocs, query, where } = firestoreLib;

const bookService = {
  async getAllBooks() {
    try {
      console.log('BookService: Getting all books');
      const querySnapshot = await getDocs(collection(db, 'books'));
      const books = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(`BookService: Found ${books.length} books`);
      return books;
    } catch (error) {
      console.error('Error getting books:', error);
      return [];
    }
  },

  async searchBooks(searchQuery) {
    console.log(`BookService: Searching for "${searchQuery}"`);

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

      console.log(`Found ${filteredBooks.length} matches for "${searchTerm}"`);
      return filteredBooks;
    } catch (error) {
      console.error('Error searching books:', error);
      return [];
    }
  },
};

export default bookService;
