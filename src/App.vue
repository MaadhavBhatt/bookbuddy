<template>
  <div id="app" class="dark-mode">
    <header>
      <img alt="BookBuddy logo" src="./assets/logo.png" class="logo">
      <h1>BookBuddy</h1>

      <div class="user-account">
        <span class="user-name">Guest</span>
        <button class="login-button">Login</button>
      </div>
    </header>

    <main>
      <section class="search">
        <div class="search-container">
          <input type="text" placeholder="Search books (Ctrl+P)..." class="search-input" @focus="searchFocused = true"
            @blur="searchFocused = false" v-model="searchQuery" ref="searchInput">
          <span class="search-shortcut" v-if="!searchFocused">Ctrl+P</span>
        </div>
      </section>

      <section class="welcome-section">
        <h2>Welcome to BookBuddy</h2>
        <p class="tagline">Connecting book donors and seekers</p>

        <div class="cta-buttons">
          <button class="cta-button donate">Donate Books</button>
          <button class="cta-button find">Find Books</button>
        </div>
      </section>

      <section class="intro">
        <h2>How it works</h2>
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
      </section>

      <section class="featured-books">
        <h2>Featured Books</h2>
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
      </section>
    </main>

    <footer>
      <div class="footer-left">
        <img alt="BookBuddy logo" src="./assets/logo.png" class="footer-logo">
        <span class="footer-name">BookBuddy</span>
      </div>

      <div class="footer-center">
        <div class="social-links">
          <a href="#" class="social-link">Twitter/X</a>
          <a href="#" class="social-link">Instagram</a>
        </div>
      </div>

      <div class="footer-right">
        <p>&copy; 2025 BookBuddy - MIT License</p>
        <p>Made with ❤️ for book lovers</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      searchQuery: '',
      searchFocused: false,
      featuredBooks: [
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Classic', color: '#2c3e50' },
        { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', color: '#34495e' },
        { id: 3, title: '1984', author: 'George Orwell', category: 'Dystopian', color: '#7f8c8d' }
      ]
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
  }
}
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
  --accent-color: #B0FFA1;
  --accent-hover: #E4B304;
  --accent-blue: #F121EB;
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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  max-width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.logo {
  width: 4rem;
  height: 4rem;
}

h1 {
  color: var(--accent-color);
  font-size: 1.5em;
}

.search {
  padding: 3rem 0;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 20px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
}

.search-shortcut {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.user-account {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.login-button {
  background-color: var(--accent-color);
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-button:hover {
  background-color: var(--accent-hover);
}

/* Main content */
main {
  flex: 1;
  padding: 2rem;
}

.welcome-section {
  text-align: center;
  margin-bottom: 4rem;
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

.intro {
  margin-top: 40px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
}

.feature {
  background-color: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
}

h3 {
  color: var(--accent-color);
  margin-bottom: 10px;
}

.featured-books {
  margin-top: 40px;
}

.books-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-top: 20px;
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
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: white;
}

.book-info {
  padding: 15px;
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
footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.footer-left,
.footer-center,
.footer-right {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.footer-left {
  align-items: center;
  justify-content: flex-start;
}

.footer-logo {
  width: 3rem;
  height: 3rem;
  margin-right: 10px;
}

.footer-name {
  font-weight: bold;
  color: var(--accent-color);
}

.social-links {
  display: flex;
  gap: 20px;
}

.social-link {
  color: var(--text-secondary);
  text-decoration: none;
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
  header {
    flex-direction: row;
    justify-content: space-between;
    padding: 15px 30px;
  }

  .header-left,
  .header-right {
    width: auto;
    margin-bottom: 0;
  }

  .search {
    flex: 1;
    margin: 0 20px;
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

  footer {
    flex-direction: row;
    justify-content: space-between;
    padding: 20px 30px;
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