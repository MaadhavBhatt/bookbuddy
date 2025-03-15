// Simple BookService using local data
import booksData from '@/data/books.json';

const bookService = {
  getAllBooks() {
    console.log('BookService: Getting all books');
    // Check if booksData is properly structured
    const books = booksData.books || [];
    console.log(`BookService: Found ${books.length} books`);
    return Promise.resolve(books);
  },
};

export default bookService;
