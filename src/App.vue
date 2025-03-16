<template>
  <div id="app" class="dark-mode">
    <login-modal :show="showLoginModal" @close="showLoginModal = false" @auth-success="handleAuthSuccess" />

    <header class="header">
      <div class="header-info">
        <img alt="BookBuddy logo" src="./assets/logo.png" class="logo" />
        <h1 class="header-heading">BookBuddy</h1>
      </div>

      <div class="user-account">
        <div v-if="currentUser" class="user-info">
          <span class="user-name">{{ getUserDisplayName }}</span>
          <button class="logout-button" @click="logout">Logout</button>
        </div>
        <button v-else class="login-button" @click="showLoginModal = true">Login</button>
      </div>
    </header>

    <main>
      <section class="search">
        <div class="container search-container">
          <input type="text" placeholder="Search books (Ctrl+P)..." class="search-input" @focus="searchFocused = true"
            @blur="searchFocused = false" v-model="searchQuery" ref="searchInput" />
          <template><span class="search-shortcut" v-if="!searchFocused">Ctrl+P</span></template>
        </div>

        <div v-if="currentUser" class="upload-actions">
          <button class="upload-button" @click="uploadSampleBooks">
            Upload Sample Books to Firebase
          </button>
        </div>
      </section>

      <section class="search-results" v-if="searchQuery.trim()">
        <div class="container">
          <h2 class="search-results-heading">Search Results</h2>

          <div v-if="isSearching" class="loading-results">
            <p>Searching...</p>
          </div>

          <div v-else-if="searchResults.length === 0" class="no-results">
            <p>No books found matching "{{ searchQuery }}"</p>
          </div>

          <div v-else class="results-grid">
            <div v-for="book in searchResults" :key="book.id" class="book-card">
              <div class="book-cover" :style="getBookCoverStyle(book)"></div>
              <div class="book-info">
                <h3 class="book-title">{{ book.title }}</h3>
                <p class="book-author">by {{ book.author }}</p>
                <div class="book-meta">
                  <span v-if="book.genre" class="book-genre">{{ book.genre }}</span>
                  <span class="book-status" :class="book.status">
                    {{ getStatusText(book.status) }}
                  </span>
                </div>
                <p v-if="book.description" class="book-description">
                  {{ truncateText(book.description, 100) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="hero">
        <div class="container">
          <h2 class="hero-heading">Welcome to BookBuddy</h2>
          <p class="tagline">Connecting book donors and seekers</p>

          <div class="cta-buttons">
            <button class="cta-button donate">Donate Books</button>
            <button class="cta-button find">Find Books</button>
          </div>
        </div>
      </section>

      <section class="intro">
        <div class="container">
          <h2 class="feature-heading">How it works</h2>
          <div class="features">
            <div class="feature">
              <h3>List Your Books</h3>
              <p>Share books you no longer need</p>
            </div>
            <div class="feature">
              <h3>Find Books</h3>
              <p>Browse available books near you</p>
            </div>
            <div class="feature">
              <h3>Connect</h3>
              <p>Message donors and arrange pickup</p>
            </div>
          </div>
        </div>
      </section>

      <section class="featured-books">
        <div class="container">
          <h2 class="featured-heading">Featured Books</h2>
          <div class="books-grid">
            <div class="book-card" v-for="book in featuredBooks" :key="book.id">
              <div class="book-cover" :style="{ backgroundColor: book.color }">
                <h3>{{ book.title }}</h3>
              </div>
              <div class="book-info">
                <p class="book-author">{{ book.author }}</p>
                <p class="book-category">{{ book.category }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <div class="footer-left">
          <img alt="BookBuddy logo" src="./assets/logo.png" class="footer-logo" />
          <span class="footer-name">BookBuddy</span>
        </div>

        <div class="footer-right">
          <a href="#" class="social-link ta-right">Instagram</a>
          <a href="https://github.com/MaadhavBhatt/bookbuddy" class="social-link ta-left" target="_blank">GitHub</a>
        </div>

        <div class="footer-right">
          <p class="ta-right">&copy; 2025 BookBuddy - MIT License</p>
          <p class="ta-left">Made with ❤️ for book lovers</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
/* eslint-disable */
import LoginModal from '@/components/LoginModal.vue';
import authService from '@/services/authService';
import bookService from '@/services/bookService';

export default {
  name: 'App',
  components: {
    LoginModal
  },
  data() {
    return {
      searchQuery: '',
      searchFocused: false,
      searchResults: [],
      isSearching: false,
      searchTimeout: null,
      showLoginModal: false,
      currentUser: null,
    };
  },

  computed: {
    getUserDisplayName() {
      if (!this.currentUser) return '';
      return this.currentUser.displayName || this.currentUser.email.split('@')[0] || 'User';
    }
  },

  created() {
    // Initialize auth service
    authService.init();

    // Check authentication state
    this.checkAuthState();
  },

  watch: {
    searchQuery(newValue) {
      // Debounce search to avoid too many requests
      clearTimeout(this.searchTimeout);

      if (newValue.trim()) {
        this.isSearching = true;
        this.searchTimeout = setTimeout(() => {
          this.performSearch();
        }, 300); // Delay by 300ms
      } else {
        this.searchResults = [];
        this.isSearching = false;
      }
    }
  },

  mounted() {
    // Add keyboard shortcut for search
    window.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        this.$refs.searchInput.focus();
      }
    });
  },

  methods: {
    async performSearch() {
      try {
        this.searchResults = await bookService.searchBooks(this.searchQuery);
      } catch (error) {
        console.error('Search error:', error);
        this.searchResults = [];
      } finally {
        this.isSearching = false;
      }
    },

    getStatusText(status) {
      const statusMap = {
        'available': 'Available',
        'checked_out': 'Checked Out',
        'reserved': 'Reserved'
      };
      return statusMap[status] || 'Unknown';
    },

    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text;
    },

    getBookCoverStyle(book) {
      if (book.coverImage) {
        return {
          backgroundImage: `url(${book.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      }

      // Generate a color based on the book title for books without covers
      const colors = [
        '#3498db', '#2ecc71', '#e74c3c', '#f39c12',
        '#9b59b6', '#1abc9c', '#d35400', '#34495e'
      ];

      const index = book.title
        ? book.title.length % colors.length
        : Math.floor(Math.random() * colors.length);

      return { backgroundColor: colors[index] };
    },

    checkAuthState() {
      // Check initial auth state
      this.currentUser = authService.getCurrentUser();

      // Set up a watcher for auth changes
      const authCheckInterval = setInterval(() => {
        const user = authService.getCurrentUser();
        if (JSON.stringify(user) !== JSON.stringify(this.currentUser)) {
          this.currentUser = user;
        }
      }, 1000);

      // Clean up interval when component is destroyed
      this.$options.beforeDestroy = () => {
        clearInterval(authCheckInterval);
      };
    },

    handleAuthSuccess() {
      this.currentUser = authService.getCurrentUser();
    },

    async logout() {
      try {
        await authService.signOut();
        this.currentUser = null;
      } catch (error) {
        console.error('Logout error:', error);
      }
    },

    async uploadSampleBooks() {
      try {
        const booksData = await import('@/data/books.json');
        const books = booksData.default.books || [];

        if (books.length === 0) {
          alert('No books found in the sample data.');
          return;
        }

        // Get Firestore from firebase/index.js
        const { db, firestoreLib } = await import('@/firebase');
        const { collection, getDocs, addDoc, query, where } = firestoreLib;

        // Step 1: Check for existing books
        console.log('Checking for existing books...');
        this.isLoading = true;

        // Get existing books from Firestore
        const querySnapshot = await getDocs(collection(db, 'books'));
        const existingBooks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log(`Found ${existingBooks.length} existing books in Firestore`);

        // Step 2: Identify new books vs. duplicates
        const newBooks = [];
        const duplicates = [];

        for (const book of books) {
          // Check if book already exists (by ISBN or title+author combination)
          const isDuplicate = existingBooks.some(existingBook =>
            // If book has ISBN, check for ISBN match
            (book.isbn && existingBook.isbn === book.isbn) ||
            // Otherwise check title+author match
            (existingBook.title === book.title && existingBook.author === book.author)
          );

          if (isDuplicate) {
            duplicates.push(book);
          } else {
            newBooks.push(book);
          }
        }

        // Step 3: Ask for confirmation with details
        const confirmMessage =
          `Found ${books.length} books in sample data:\n` +
          `- ${newBooks.length} new books to upload\n` +
          `- ${duplicates.length} duplicates that will be skipped\n\n` +
          `Proceed with upload?`;

        if (!confirm(confirmMessage)) {
          this.isLoading = false;
          return;
        }

        // Step 4: Upload only new books
        console.log(`Uploading ${newBooks.length} new books...`);

        let uploadedCount = 0;

        for (const book of newBooks) {
          // Add book to Firestore
          await addDoc(collection(db, 'books'), {
            ...book,
            status: book.status || 'available',
            addedAt: new Date().toISOString()
          });

          uploadedCount++;
        }

        alert(`Successfully uploaded ${uploadedCount} new books to Firebase!\n${duplicates.length} duplicates were skipped.`);

        // Refresh search to show the new books
        if (this.searchQuery) {
          this.performSearch();
        }

      } catch (error) {
        console.error('Error uploading books:', error);
        alert(`Error uploading books: ${error.message}`);
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style>
/* Import Montserrat font */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

/* Base styles - Dark mode by default */
/*
Color Scheme:
  #333333
  #B0FFA1
  #E4B304
  #F121EB
*/

:root {
  --bg-primary: #1e1e1e;
  --bg-secondary: #1e1e1e;
  --bg-tertiary: #2a2a2a;
  --text-primary: #e0e0e0;
  --text-secondary: #b0b0b0;
  --accent-color: #b0ffa1;
  --accent-hover: #e4b304;
  --accent-blue: #f121eb;
  --border-color: #333;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;

  font-family: 'Monstserrat', sans-serif;
  font-size: 10px;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  margin: 0;
  padding: 0;
}

#app {
  width: 100vw;
  min-height: 100vh;
  margin: 0 auto;

  display: flex;
  flex-direction: column;
}

/* Utility CLasses */
.container {
  width: min(80%, 100rem);
  /* max-width: 100rem; */
  margin: 0 auto;
}

.ta-left {
  text-align: left;
}

.ta-right {
  text-align: right;
}


/* Login Modal */
.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-name {
  color: white;
  font-weight: 500;
}

.logout-button {
  background-color: transparent;
  border: 0.1rem solid #e74c3c;
  color: var(--accent-color);
  padding: 0.5rem 1rem;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background-color: var(--accent-hover);
  color: white;
}


/* Header */
.header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;

  position: relative;
  padding: 3rem 0;
  width: min(80%, 100rem);
  margin: 0 auto;


  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo {
  width: 4rem;
  height: 4rem;
}

.header-heading {
  font-size: 1.5em;
  text-align: center;
  color: var(--accent-color);
}

.user-account {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.login-button {
  cursor: pointer;
  font-weight: 500;

  background-color: var(--accent-color);
  color: var(--bg-secondary);

  padding: 0.8rem 1.5rem;

  border: none;
  border-radius: 4px;

  transition: background-color 0.2s ease;
}

.login-button:hover {
  background-color: var(--accent-hover);
  box-shadow: 0 5px 0 hsla(0, 83%, 37%, 0.212);
  transform: translateY(-2px);
  transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s;
}


/* Main content */
main {
  flex: 1;
}

section {
  padding: 2rem 0;
}

/* Search */
.search-container {
  position: relative;
  max-width: 40rem;
  margin: 0 auto;
}

.search-input {
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1rem, 5vw, 1.5rem);

  color: var(--text-primary);
  background-color: var(--bg-tertiary);

  width: 100%;
  padding: 1rem 1.5rem;

  border: 1px solid var(--border-color);
  border-radius: 2rem;
}

/* .search-shortcut {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 0.8rem;
} */


/* Upload */
.upload-actions {
  margin: 1.5rem 0;
  display: flex;
  justify-content: center;
}

.upload-button {
  background-color: var(--bg-secondary);
  border: none;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 0.4rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.upload-button:hover {
  background-color: var(--border-color);
}

/* Search Results */
.search-results {
  padding: 3rem 0;
}

.search-results-heading {
  text-align: center;
  margin: 3rem 0;
}

.loading-results,
.no-results {
  padding: 2rem;
  text-align: center;
  color: #aaa;
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.book-card {
  background-color: #2c2c2c;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-cover {
  height: 150px;
  background-color: #3498db;
}

.book-info {
  padding: 1.5rem;
}

.book-title {
  color: #fff;
}

.book-author {
  color: #bbb;
  font-style: italic;
}

.book-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.book-genre {
  background-color: #444;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #ddd;
}

.book-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.book-status.available {
  background-color: #2ecc71;
  color: #fff;
}

.book-status.checked_out,
.book-status.reserved {
  background-color: #e74c3c;
  color: #fff;
}

.book-description {
  color: #bbb;
  font-size: 0.9rem;
  line-height: 1.4;
}


/* Hero */
.hero {
  text-align: center;
}

.tagline {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;

  margin: 0 auto;
}

.cta-button {
  cursor: pointer;

  font-size: 1rem;
  font-weight: bold;

  padding: 12px 20px;

  border: none;
  border-radius: 6px;
}

.donate {
  background-color: var(--accent-color);
  color: var(--bg-secondary);
}

.find {
  background-color: transparent;
  color: var(--accent-color);
  border: 2px solid var(--accent-color);
}

h2 {
  font-size: 1.5rem;
  text-align: center;
}

.feature-heading {
  padding: 1rem;
  width: fit-content;
  margin: 0 auto;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 0 auto;
  max-width: fit-content;
}

.feature {
  flex-grow: 1;
  flex-basis: 0;
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

h3 {
  color: var(--accent-color);
  margin-bottom: 1rem;
}

.books-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.book-card {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-cover {
  display: flex;
  align-items: center;
  justify-content: center;

  color: white;

  min-height: 15rem;
  padding: 2rem;
}

.book-info {
  padding: 1.5rem;
}

.book-author {
  font-style: italic;
  margin-bottom: 5px;
}

.book-category {
  font-size: 0.8rem;
  color: var(--text-secondary);
}


/* Footer */
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.footer-left,
.footer-center,
.footer-right {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.footer-left {
  align-items: center;
  justify-content: flex-start;
}

.footer-logo {
  width: 3rem;
  height: 3rem;
  margin-right: 1rem;
}

.footer-name {
  font-weight: bold;
  color: var(--accent-color);
}

.footer-center {
  display: flex;
  gap: 2rem;
}

.social-link {
  color: var(--text-secondary);
  text-decoration: none;
  width: 100%;
}

.social-link:hover {
  color: var(--accent-color);
}

.footer-right {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}


/* Media queries */
@media (min-width: 375px) {
  .header {
    flex-direction: row;
    justify-content: space-between;
  }

  .cta-buttons {
    flex-direction: row;
  }

  .books-grid,
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .features {
    flex-direction: row;
    justify-content: space-around;
  }

  .footer {
    flex-direction: row;
    justify-content: space-between;
    padding: 2rem 3rem;
  }

  .footer-left,
  .footer-center,
  .footer-right {
    width: auto;
    margin-bottom: 0;
  }

  .footer-right {
    text-align: right;
  }
}

@media (min-width: 992px) {

  .books-grid,
  .results-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .book-card {
    flex-direction: row;
    /* height: 18rem; */
  }

  .book-cover {
    width: 12rem;
    /* height: 100%; */
  }

  .book-info {
    flex: 1;
  }
}
</style>