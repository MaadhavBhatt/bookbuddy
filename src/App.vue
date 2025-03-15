<template>
  <div id="app" class="dark-mode">
    <header class="header">
      <div class="header-info">
        <img alt="BookBuddy logo" src="./assets/logo.png" class="logo" />
        <h1 class="header-heading">BookBuddy</h1>
      </div>

      <div class="user-account">
        <span class="user-name">Guest</span>
        <button class="login-button">Login</button>
      </div>
    </header>

    <main>
      <section class="search">
        <div class="container search-container">
          <input type="text" placeholder="Search books (Ctrl+P)..." class="search-input" @focus="searchFocused = true"
            @blur="searchFocused = false" v-model="searchQuery" ref="searchInput" />
          <template><span class="search-shortcut" v-if="!searchFocused">Ctrl+P</span></template>
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
            <!-- Book cards would go here -->
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
import bookService from '@/services/bookService';

export default {
  name: 'App',
  data() {
    return {
      searchQuery: '',
      searchFocused: false,
      searchResults: [],
      isSearching: false,
      searchTimeout: null,
    };
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

/* Utility CLasses */
.container {
  width: 80%;
  margin: 0 auto;
}

.ta-left {
  text-align: left;
}

.ta-right {
  text-align: right;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  max-width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;

  position: relative;
  padding: 3rem;

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

  background-color: var(--accent-color);
  color: var(--bg-secondary);

  padding: 0.8rem 1.5rem;

  border: none;
  border-radius: 4px;

  transition: all 0.2s ease;
}

.login-button:hover {
  background-color: var(--accent-hover);
  box-shadow: 0 5px 0 hsla(0, 83%, 37%, 0.212);
  transform: translateY(-2px);
  transition: transform 0.3s, box-shadow 0.3s;
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
  max-width: 400px;
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

/* Media queries for responsive layout */
@media (min-width: 640px) {
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .results-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .book-card {
    flex-direction: row;
    height: 18rem;
  }

  .book-cover {
    width: 12rem;
    height: 100%;
  }

  .book-info {
    flex: 1;
  }
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
  max-width: 30;
  margin: 0 auto;
}

.cta-button {
  cursor: pointer;

  font-size: 1rem;
  font-weight: bold;

  /* max-width: 15rem; */
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
  padding: 1rem 2rem;
  /* text-align: right; */
}

.features {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.feature {
  flex-grow: 1;
  flex-basis: 0;
  background-color: var(--bg-secondary);
  padding: 1rem 2rem;
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
  padding: 2rem;
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

/* Media queries for responsive design */
@media (min-width: 768px) {
  .header {
    flex-direction: row;
    justify-content: space-between;
    padding: 1.5rem 3rem;
  }

  .search {
    flex: 1;
    margin: 0 2rem;
  }

  .cta-buttons {
    flex-direction: row;
    max-width: 400px;
  }

  .features {
    flex-direction: row;
    justify-content: space-around;
  }

  .books-grid {
    grid-template-columns: repeat(2, 1fr);
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
  #app {
    max-width: 1200px;
    margin: 0 auto;
  }

  .books-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>