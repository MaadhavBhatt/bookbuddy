<template>
  <div class="donate-modal" v-if="show">
    <div class="modal-backdrop" @click="close"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>Donate Books</h2>
        <button class="close-button" @click="close">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Search & Lookup Section -->
        <div class="lookup-section">
          <div class="form-group">
            <label for="book-title">Search by Book Title</label>
            <div class="search-field">
              <input type="text" id="book-title" v-model="searchTitle" placeholder="Enter book title..."
                @input="searchByTitle">
              <div v-if="isSearching" class="spinner"></div>
            </div>

            <!-- Title Search Results -->
            <div v-if="titleResults.length > 0" class="search-results">
              <div v-for="book in titleResults" :key="book.id" class="search-result-item" @click="selectBook(book)">
                <div class="result-title">{{ book.title }}</div>
                <div class="result-author">by {{ book.author }}</div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="book-isbn">Search by ISBN</label>
            <div class="search-field">
              <input type="text" id="book-isbn" v-model="searchISBN" placeholder="Enter ISBN..." @input="searchByISBN">
              <div v-if="isSearchingISBN" class="spinner"></div>
            </div>
          </div>
        </div>

        <div class="divider">
          <span>Book Details</span>
        </div>

        <!-- Book Details Form -->
        <form @submit.prevent="submitDonation">
          <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" v-model="bookData.title" required placeholder="Book title">
          </div>

          <div class="form-group">
            <label for="author">Author</label>
            <input type="text" id="author" v-model="bookData.author" required placeholder="Book author">
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label for="isbn">ISBN</label>
              <input type="text" id="isbn" v-model="bookData.isbn" placeholder="ISBN number (optional)">
            </div>

            <div class="form-group half">
              <label for="condition">Condition</label>
              <select id="condition" v-model="bookData.condition" required>
                <option value="">Select condition</option>
                <option value="new">New</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label for="genre">Genre</label>
              <input type="text" id="genre" v-model="bookData.genre" placeholder="Fiction, Science, etc.">
            </div>

            <div class="form-group half">
              <label for="publishYear">Publication Year</label>
              <input type="number" id="publishYear" v-model="bookData.publishYear" placeholder="Year published">
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" v-model="bookData.description" rows="3"
              placeholder="Brief description of the book (optional)"></textarea>
          </div>

          <div class="form-group">
            <label for="copies">Number of Copies</label>
            <input type="number" id="copies" v-model="bookData.copies" min="1" required
              placeholder="How many copies are you donating?">
          </div>

          <div class="form-group">
            <label for="notes">Additional Notes</label>
            <textarea id="notes" v-model="bookData.notes" rows="2"
              placeholder="Any additional information about the donation"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-button" @click="close">
              Cancel
            </button>

            <button type="submit" class="submit-button" :disabled="isSubmitting">
              {{ isSubmitting ? 'Submitting...' : 'Donate Book' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { db, firestoreLib } from '@/firebase';
import catalogData from '@/data/catalog.json';

export default {
  name: 'DonateModal',

  props: {
    show: {
      type: Boolean,
      required: true
    },
    currentUser: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      searchTitle: '',
      searchISBN: '',
      titleResults: [],
      isSearching: false,
      isSearchingISBN: false,
      isSubmitting: false,
      bookData: this.getEmptyBookData(),
      searchTimeout: null
    };
  },

  mounted() {
    window.addEventListener('keydown', (event) => {
      if (event.key == 'Escape') {
        this.close();
      }
    });
  },

  methods: {
    close() {
      this.$emit('close');
      this.resetForm();
    },

    getEmptyBookData() {
      return {
        title: '',
        author: '',
        isbn: '',
        description: '',
        genre: '',
        publishYear: '',
        condition: '',
        copies: 1,
        notes: '',
        status: 'available'
      };
    },

    resetForm() {
      this.searchTitle = '';
      this.searchISBN = '';
      this.titleResults = [];
      this.bookData = this.getEmptyBookData();
    },

    searchByTitle() {
      clearTimeout(this.searchTimeout);

      if (!this.searchTitle || this.searchTitle.length < 2) {
        this.titleResults = [];
        return;
      }

      this.isSearching = true;

      // Debounce the search to avoid excessive calls
      this.searchTimeout = setTimeout(async () => {
        try {
          // First search the catalog
          const catalogResults = this.searchCatalog(this.searchTitle);

          // Then search Firebase if needed
          let firebaseResults = [];
          if (db) {
            const { collection, getDocs, query, where, orderBy, limit } = firestoreLib;
            // This is a simplified search. In a real implementation, you'd want
            // to use Firestore's full-text search capabilities or a solution like Algolia
            const booksRef = collection(db, 'books');
            const snapshot = await getDocs(booksRef);

            firebaseResults = snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(book =>
                book.title && book.title.toLowerCase().includes(this.searchTitle.toLowerCase())
              );
          }

          // Combine results, remove duplicates, and limit to 5
          this.titleResults = [...catalogResults, ...firebaseResults]
            .filter((book, index, self) =>
              index === self.findIndex(b => b.isbn === book.isbn || b.title === book.title)
            )
            .slice(0, 5);

        } catch (error) {
          console.error('Error searching books:', error);
          this.titleResults = this.searchCatalog(this.searchTitle);
        } finally {
          this.isSearching = false;
        }
      }, 300);
    },

    searchByISBN() {
      clearTimeout(this.searchTimeout);

      if (!this.searchISBN || this.searchISBN.length < 10) {
        return;
      }

      this.isSearchingISBN = true;

      this.searchTimeout = setTimeout(async () => {
        try {
          // Search catalog by ISBN
          const catalogMatch = catalogData.books.find(book =>
            book.isbn && book.isbn.replace(/-/g, '') === this.searchISBN.replace(/-/g, '')
          );

          if (catalogMatch) {
            this.selectBook(catalogMatch);
            this.isSearchingISBN = false;
            return;
          }

          // Search Firebase by ISBN if no catalog match
          if (db) {
            const { collection, getDocs, query, where } = firestoreLib;
            const booksRef = collection(db, 'books');
            const q = query(booksRef, where('isbn', '==', this.searchISBN));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
              const bookData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
              this.selectBook(bookData);
            }
          }
        } catch (error) {
          console.error('Error searching by ISBN:', error);
        } finally {
          this.isSearchingISBN = false;
        }
      }, 300);
    },

    searchCatalog(searchText) {
      const lowercaseSearch = searchText.toLowerCase();
      return catalogData.books
        .filter(book =>
          book.title && book.title.toLowerCase().includes(lowercaseSearch)
        )
        .slice(0, 5);
    },

    selectBook(book) {
      this.bookData = {
        ...this.getEmptyBookData(),
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        description: book.description || '',
        genre: book.genre || '',
        publishYear: book.publishYear || '',
        // Don't copy condition or copies - these should be set by the donor
      };

      this.titleResults = [];
      this.searchTitle = book.title || '';
      this.searchISBN = book.isbn || '';
    },

    async submitDonation() {
      if (!this.currentUser) {
        alert('You must be logged in to donate books');
        return;
      }

      this.isSubmitting = true;

      try {
        const { collection, addDoc } = firestoreLib;

        // Create donor information
        const donorInfo = {
          name: this.currentUser.displayName || this.currentUser.email,
          email: this.currentUser.email,
          donationDate: new Date().toISOString()
        };

        // Prepare the book data with donor information
        const bookWithDonor = {
          ...this.bookData,
          status: 'available',
          addedAt: new Date().toISOString(),
          donors: [donorInfo]
        };

        // Add to Firebase
        const docRef = await addDoc(collection(db, 'books'), bookWithDonor);

        // Emit success event with the book data
        this.$emit('donate-success', { id: docRef.id, ...bookWithDonor });

        // Close modal and reset form
        this.close();

      } catch (error) {
        console.error('Error donating book:', error);
        alert('Error donating book: ' + error.message);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
@import url(../styles/variables.css);

.donate-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: #2c2c2c;
  border-radius: 0.8rem;
  box-shadow: 0 0.4rem 2rem rgba(0, 0, 0, 0.3);
  z-index: 101;
}

.modal-header {
  padding: 2rem;
  border-bottom: 0.1rem solid #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: white;
}

.close-button {
  background: none;
  border: none;
  font-size: 2.4rem;
  color: #aaa;
  cursor: pointer;

  &:hover {
    color: white;
  }
}

.modal-body {
  padding: 2rem;
}

.divider {
  position: relative;
  text-align: center;
  margin: 2rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 0.1rem;
  background-color: #444;
}

.divider span {
  position: relative;
  background-color: #2c2c2c;
  padding: 0 1rem;
  color: #aaa;
}

.lookup-section {
  margin-bottom: 2rem;
}

.search-field {
  position: relative;
  display: flex;
  align-items: center;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 0.2rem solid #aaa;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: absolute;
  right: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.search-results {
  position: absolute;
  z-index: 10;
  background-color: #333;
  width: 100%;
  max-height: 25rem;
  overflow-y: auto;
  border-radius: 0.4rem;
  box-shadow: 0 0.4rem 1rem rgba(0, 0, 0, 0.3);
  margin-top: 0.5rem;
}

.search-result-item {
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #444;
  }
}

.result-title {
  font-weight: 500;
  color: white;
}

.result-author {
  font-size: 1.2rem;
  color: #aaa;
  margin-top: 0.3rem;
}

.form-group {
  margin-bottom: 2rem;
  position: relative;
}

.form-row {
  display: flex;
  gap: 2rem;
}

.half {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.8rem;
  color: #ddd;
}

input,
select,
textarea {
  width: 100%;
  padding: 1rem;
  border: 0.1rem solid #444;
  border-radius: 0.4rem;
  background-color: #333;
  color: white !important;
  font-size: 1.4rem;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 2rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 3rem;
}

button {
  padding: 1.2rem 2rem;
  border: none;
  border-radius: 0.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-button {
  background-color: var(--clr-yellow-1);

  &:hover:not(:disabled) {
    background-color: var(--clr-yellow-2);
  }
}

.cancel-button {
  background-color: transparent;
  border: 0.1rem solid;
  color: var(--clr-grey);

  &:hover {
    background-color: var(--clr-grey);
    color: white;
  }
}

@media (max-width: 425px) {
  .modal-content {
    width: 100vw;
    height: 100%;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: 2rem;
  }
}
</style>