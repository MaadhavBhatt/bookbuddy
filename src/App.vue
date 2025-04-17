<template>
  <div id="app" class="dark-mode">
    <login-modal :show="showLoginModal" @close="showLoginModal = false" @auth-success="handleAuthSuccess" />

    <donate-modal :show="showDonateModal" @close="showDonateModal = false" @donate-success="handleDonateSuccess"
      :currentUser="currentUser" />

    <user-dashboard v-if="showDashboard && currentUser" :currentUser="currentUser" @close="showDashboard = false" />

    <header class="header">
      <div class="header-info">
        <img alt="BookBuddy logo" src="./assets/logo.png" class="logo" />
        <p class="header-heading">BookBuddy</p>
      </div>

      <div class="user-account">
        <div v-if="currentUser" class="user-info">
          <span class="user-name">{{ getUserDisplayName }}</span>
          <button class="dashboard-button" @click="openDashboard">Dashboard</button>
          <button class="logout-button" @click="logout">Logout</button>
        </div>
        <button v-else class="login-button" @click="showLoginModal = true">Login</button>
      </div>
    </header>

    <div class="search-overlay" v-if="searchFocused" @click="unfocusSearch"></div>

    <main>
      <section class="search" :class="{ 'search-focused': searchFocused }">
        <div class="container search-container">
          <input type="text" placeholder="Search books (Ctrl+P)..." class="search-input" @focus="searchFocused = true"
            @blur="searchFocused = false" v-model="searchQuery" ref="searchInput" />
          <button class="cta-button donate" @click="openDonateModal">+</button>
        </div>
      </section>

      <section class="search-results" v-if="searchQuery.trim()">
        <div class="container flex-col gap-2 align-center">
          <div v-if="isSearching" class="loader"></div>

          <div v-else-if="searchResults.length === 0" class="no-results">
            <p>No books found matching "{{ searchQuery }}"</p>
          </div>

          <div v-else class="results-grid">
            <div v-for="book in searchResults" :key="book.id" class="book-card">
              <div class="book-cover" :style="getBookCoverStyle(book)"></div>
              <div class="book-info flex-col gap-half">
                <h3 class="book-title">{{ book.title }}</h3>
                <p class="book-author">by {{ book.author }}</p>
                <span class="book-status" :class="book.status">
                  {{ getStatusText(book.status) }}
                </span>
                <p v-if="book.description" class="book-description">
                  {{ truncateText(book.description, 100) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="hero">
        <div class="container hero-text">
          <h2 class="hero-heading">Welcome to BookBuddy</h2>
          <p class="hero-tagline">Connecting book donors and seekers</p>
        </div>
      </section>

      <section class="intro">
        <div class="container">
          <div class="features">
            <div class="feature flex-col gap-1">
              <h3 class="clr-yellow-1">List Your Books</h3>
              <p>Share books you no longer need</p>
            </div>
            <div class="feature flex-col gap-1">
              <h3 class="clr-yellow-1">Find Books</h3>
              <p>Browse available books near you</p>
            </div>
            <div class="feature flex-col gap-1">
              <h3 class="clr-yellow-1">Connect</h3>
              <p>Message donors and arrange pickup</p>
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
import UserDashboard from '@/components/UserDashboard.vue';
import DonateModal from '@/components/DonateModal.vue';
import LoginModal from '@/components/LoginModal.vue';
import authService from '@/services/authService';
import bookService from '@/services/bookService';

export default {
  name: 'App',
  components: {
    LoginModal,
    DonateModal,
    UserDashboard
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
      showDonateModal: false,
      showDashboard: false,
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
    focusSearch() {
      this.$refs.searchInput.focus();
      this.searchFocused = true;
    },

    unfocusSearch() {
      this.$refs.searchInput.blur();
      this.searchFocused = false;
    },

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
      this.$emit('auth-success');
    },

    async logout() {
      try {
        await authService.signOut();
        this.currentUser = null;
      } catch (error) {
        console.error('Logout error:', error);
      }
    },

    openDonateModal() {
      if (!this.currentUser) {
        // Prompt login first if not logged in
        this.showLoginModal = true;
        // Store intent to open donate modal after login
        this.$once('auth-success', () => {
          this.showDonateModal = true;
        });
      } else {
        // User is logged in, show donate modal directly
        this.showDonateModal = true;
      }
    },

    handleDonateSuccess(bookData) {
      // Handle successful donation
      alert(`Thank you for donating "${bookData.title}"!`);
      // Refresh search if needed
      if (this.searchQuery) {
        this.performSearch();
      }
    },

    openDashboard() {
      if (!this.currentUser) {
        // Prompt login first if not logged in
        this.showLoginModal = true;
        // Listen for successful login, then open dashboard
        this.$once('auth-success', () => {
          this.showDashboard = true;
        });
      } else {
        this.showDashboard = true;
      }
    }
  }
};
</script>

<style>
@import url(styles/variables.css);
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap');


/* Resets */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;

  font-family: var(--ff-main);
  font-size: 10px;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  margin: 0;
  padding: 0;
}

select {
  appearance: none;
  border: none;
  outline: none;
}

select:focus {
  outline: none;
  border: none;
}

option {
  color: var(--text-primary);
  background-color: var(--bg-secondary);

  &:hover {
    background-color: var(--clr-yellow-2);
  }
}

#app {
  width: 100%;
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

.flex-col {
  display: flex;
  flex-direction: column;
}

.align-center {
  align-items: center;
}

.gap-half {
  gap: 0.5rem;
}

.gap-1 {
  gap: 1rem;
}

.gap-2 {
  gap: 2rem;
}

.clr-yellow-1 {
  color: var(--clr-yellow-1);
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
  color: var(--clr-yellow-1);
  padding: 0.5rem 1rem;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--clr-yellow-2);
    color: white;
  }
}


/* Header */
.header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 3rem;

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
  font-size: clamp(1.5em, 5vw, 2em);
  font-weight: 700;
  text-align: center;
  color: var(--clr-yellow-1);
}

.user-account {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.login-button {
  cursor: pointer;
  font-weight: 500;

  background-color: var(--clr-yellow-1);
  color: var(--bg-secondary);

  padding: 0.8rem 1.5rem;

  border: none;
  border-radius: 4px;

  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--clr-yellow-2);
    box-shadow: 0 5px 0 hsla(0, 83%, 37%, 0.212);
    transform: translateY(-2px);
    transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s;
  }
}

.dashboard-button {
  background-color: var(--clr-yellow-1);
  color: var(--bg-secondary);
  border: none;
  padding: 0.5rem 1rem;
  margin-right: 1rem;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--clr-yellow-2);
  }
}


/* Main content */
main {
  flex: 1;
}

section {
  padding: 2rem 0;
}


/* Search */
.search {
  position: relative;
  z-index: 5;
  transition: transform 0.3s ease, z-index 0s ease;
  margin: 0 auto;

  /* Ensure that transform: scale doesn't cause overflow */
  width: 97%;
}

.search-focused {
  position: relative;

  /* Change .search width if you change transform scale() */
  transform: translateY(5px) scale(1.03);

  z-index: 100;
  transform-origin: center center;
}

.search-overlay {
  position: fixed;
  inset: 0 0 0 0;
  background-color: var(--clr-overlay);
  z-index: 90;
  animation: fade-in 0.3s ease;
}

.search-container {
  position: relative;
  max-width: 40rem;
  margin: 0 auto;

  display: flex;
  gap: 2rem;
}

.search-input {
  font-family: var(--ff-main);
  font-size: clamp(1rem, 5vw, 1.5rem);

  color: var(--text-primary);
  background-color: var(--bg-tertiary);

  width: 100%;
  padding: 1rem 1.5rem;

  border: 1px solid var(--border-color);
  border-radius: 2rem;
}

.cta-button {
  cursor: pointer;

  font-size: 2rem;
  font-weight: 400;

  padding: 0 2rem;

  border: none;
  border-radius: 50%;
  aspect-ratio: 1;

  &.donate {
    background-color: var(--clr-yellow-1);
    color: var(--bg-secondary);
  }
}


/* Search Results */
.search-results {
  position: relative;
  padding: 2rem 0;
  z-index: 90;
}

/* From https: //css-loaders.com/dots/#l40 */
.loader {
  height: 15px;
  aspect-ratio: 5;
  --_g: no-repeat radial-gradient(farthest-side, var(--clr-yellow-1) 94%, transparent);
  background: var(--_g), var(--_g), var(--_g), var(--_g);
  background-size: 20% 100%;
  animation: l40-1 0.75s infinite alternate, l40-2 1.5s infinite alternate;
}

@keyframes l40-1 {

  0%,
  10% {
    background-position: 0 0, 0 0, 0 0, 0 0;
  }

  33% {
    background-position: 0 0, calc(100% / 3) 0, calc(100% / 3) 0,
      calc(100% / 3) 0;
  }

  66% {
    background-position: 0 0, calc(100% / 3) 0, calc(2 * 100% / 3) 0,
      calc(2 * 100% / 3) 0;
  }

  90%,
  100% {
    background-position: 0 0, calc(100% / 3) 0, calc(2 * 100% / 3) 0, 100% 0;
  }
}

@keyframes l40-2 {

  0%,
  49.99% {
    transform: scale(1);
  }

  50%,
  100% {
    transform: scale(-1);
  }
}

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


/* Book Card */
.book-card {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
  }
}

.book-cover {
  height: 150px;
  background-color: #3498db;
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

.book-title {
  color: #fff;
}

.book-author {
  color: #bbb;
  font-style: italic;
}

.book-status {
  width: fit-content;
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

.hero-heading {
  font-size: clamp(3em, 5vw, 5em);
  color: var(--clr-yellow-1);
  font-weight: 700;
}

.hero-tagline {
  font-size: 1.2rem;
  color: var(--text-secondary);
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
  color: var(--clr-yellow-1);
}

.social-link {
  color: var(--text-secondary);
  text-decoration: none;

  &:hover {
    color: var(--clr-yellow-1);
  }
}

.footer-right {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}


/* Keyframes */
@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}


/* Media queries */
@media (min-width: 375px) {
  .cta-buttons {
    flex-direction: row;
  }

  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 500px) {
  .header {
    flex-direction: row;
    justify-content: space-between;
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
  .footer-right {
    width: auto;
    margin-bottom: 0;
  }

  .footer-right {
    text-align: right;
  }
}

@media (min-width: 992px) {
  .results-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .book-card {
    flex-direction: row;
  }

  .book-cover {
    width: 12rem;
  }

  .book-info {
    flex: 1;
  }
}
</style>