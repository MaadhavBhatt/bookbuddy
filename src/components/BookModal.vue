<template>
  <WarningModal
    :isVisible="this.showWarning"
    :warningMessage="this.warningMessage"
    :confirmText="confirmText"
    :cancelText="this.cancelText"
    @confirm="requestBook"
    @cancel="showWarning = false"
  />

  <div class="overlay" @click="close"></div>

  <div class="book-modal">
    <div class="book-modal-content flex-col gap-2" v-if="!isLoading">
      <div class="book-modal-header flex-col gap-2">
        <button class="close-button" @click="close">&times;</button>

        <div class="book-cover" :style="getBookCoverStyle()">
          <img
            v-if="bookData.coverUrl"
            :src="bookData.coverUrl"
            :alt="bookData.title"
          />
          <div v-else class="book-cover-placeholder">
            <span>{{ bookData.title.substring(0, 1) }}</span>
          </div>
        </div>

        <div class="flex-col gap-1">
          <h1 class="book-title">{{ bookData.title }}</h1>
          <h2 class="book-author">By {{ bookData.author }}</h2>

          <div class="book-meta">
            <span class="book-status" :class="getStatusClass()">
              {{ getStatusText(bookData.status) }}
            </span>
            <span class="book-copies"
              >{{ bookData.copies || 1 }}
              {{ bookData.copies > 1 ? 'copies' : 'copy' }}</span
            >
          </div>

          <div class="book-actions">
            <button
              class="action-button request-button"
              v-if="bookData.status === 'available'"
              @click="this.showWarning = true"
            >
              Request Book
            </button>
          </div>
        </div>
      </div>

      <div class="book-details flex-col gap-half">
        <h3 class="section-title">About This Book</h3>
        <p v-if="bookData.description" class="book-description">
          {{ bookData.description }}
        </p>
        <p v-else class="book-description-empty">
          No description available for this book.
        </p>

        <div class="book-additional-details">
          <div class="detail-item" v-if="bookData.isbn">
            <span class="detail-label">ISBN:</span>
            <span class="detail-value">{{ bookData.isbn }}</span>
          </div>
          <div class="detail-item" v-if="bookData.language">
            <span class="detail-label">Language:</span>
            <span class="detail-value">{{ bookData.language }}</span>
          </div>
          <div class="detail-item" v-if="bookData.genre">
            <span class="detail-label">Genre:</span>
            <span class="detail-value">{{ bookData.genre }}</span>
          </div>
        </div>
      </div>

      <div class="book-donor-info flex-col gap-1">
        <h3 class="section-title">Shared by</h3>
        <div class="donor">
          <div class="donor-avatar">{{ bookData.donorName?.[0] || '?' }}</div>
          <div class="donor-details">
            <span class="donor-name">{{
              bookData.donorName || 'Anonymous'
            }}</span>
            <span class="donor-location" v-if="bookData.location">{{
              bookData.location
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="loader-container" v-if="isLoading">
      <div class="loader"></div>
      <p class="loading-text">Loading book details...</p>
    </div>
  </div>
</template>

<script>
import WarningModal from './WarningModal.vue';
import requestService from '@/services/requestService';
import authService from '@/services/authService';

export default {
  name: 'BookModal',
  components: {
    WarningModal,
  },

  data() {
    return {
      isLoading: false,
      showWarning: false,
      warningMessage: 'Are you sure you want to request this book?',
      confirmText: 'Yes',
      cancelText: 'No',
    };
  },

  props: {
    bookData: {
      type: Object,
      required: true,
    },
  },

  mounted() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000); // Simulate loading time

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !this.showWarning) {
        this.close();
      }
    });
  },

  methods: {
    close() {
      this.$emit('close');
    },

    getBookCoverStyle() {
      // Generate a consistent color based on the book title
      const colors = ['#f9c80e', '#ff6b6b', '#4ecdc4', '#45b7d1', '#8675a9'];
      const index = Math.abs(
        this.bookData.title.split('').reduce((acc, char) => {
          return acc + char.charCodeAt(0);
        }, 0) % colors.length
      );

      return {
        backgroundColor: colors[index],
      };
    },

    getStatusClass() {
      const statusMap = {
        available: 'status available',
        checked_out: 'status unavailable',
        reserved: 'status pending',
        requested: 'status pending',
      };
      return statusMap[this.bookData.status] || 'status-unknown';
    },

    getStatusText(status) {
      const statusMap = {
        available: 'Available',
        checked_out: 'Checked Out',
        reserved: 'Reserved',
        requested: 'Requested',
      };
      return statusMap[status] || status;
    },

    requestBook() {
      this.isLoading = true;

      const currentUser = authService.getCurrentUser();

      if (!currentUser) {
        // User is not logged in
        this.isLoading = false;
        this.showWarning = false;
        this.$emit('login-required');
        return;
      }

      // Format the request data properly
      const requestData = {
        bookId: this.bookData.id,
        requesterId: currentUser.uid,
        donorId: this.bookData.id,
        message: '', // Optional message field
      };

      console.log('Sending request data:', requestData);

      requestService
        .createRequest(requestData)
        .then(() => {
          this.$emit('request-success', requestData.bookId);
          this.showWarning = false;
          this.close();
        })
        .catch((error) => {
          console.error('Error requesting book:', error);
          // Show error message to user
          this.warningMessage =
            'Failed to request this book. Please try again.';
          this.showWarning = true;
        })
        .finally(() => {
          this.isLoading = false;
        });

      this.$emit('clear-search');
    },
  },
};
</script>

<style lang="scss" scoped>
@import url('../styles/variables.css');
@import '../styles/modal.scss';

.overlay {
  /* This element inherits properties from App.vue. */
  /* The z-index of 95 ensures that the overlay covers the book cards in App.vue, such that only the modal is highlighted. */
  z-index: 95;
}

.book-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background-color: var(--bg-tertiary);
  border-radius: 1.6rem;

  padding: 4rem 3rem;
  width: min(90vw, 700px);
  max-height: 85vh;

  overflow-y: auto;
  z-index: 100;
  animation: fade-in-lift 0.3s ease;
}

.close-button {
  position: absolute;
  inset: 0 0 auto auto;

  background: var(--bg-secondary);
  border-radius: 0 0 0 1rem;
  padding: 1rem;

  line-height: 0.7;
  z-index: 2;

  @media (min-width: 600px) {
    background: none;
    padding: 0;
  }
}

.book-modal-header {
  position: relative;

  @media (min-width: 600px) {
    flex-direction: row;
  }
}

.book-cover {
  border-radius: 0.8rem;
  overflow: hidden;
  aspect-ratio: 2 / 3;
  background-color: var(--bg-primary);

  display: flex;
  align-items: center;
  justify-content: center;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  font-size: 3rem;
  font-weight: bold;
}

.book-title {
  color: var(--clr-yellow-1);
  font-size: clamp(2.5rem, 5vw, 3rem);
  line-height: 1.2;
}

.book-author {
  color: var(--text-secondary);
  font-size: clamp(1.3rem, 3vw, 1.8rem);
  font-weight: 500;
}

.book-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;

  & .book-status,
  & .book-copies {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 0.4rem;
    font-size: 1.2rem;
  }

  & .book-status {
    font-weight: 500;
    color: var(--bg-secondary);
  }

  & .book-copies {
    background-color: var(--bg-primary);
    color: var(--text-secondary);
  }
}

.book-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  & .action-button {
    padding: 0.8rem 1.6rem;
    border-radius: 0.4rem;
    font-weight: 500;
    font-size: 1.3rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  & .request-button {
    background-color: var(--clr-yellow-1);
    border: none;
    color: var(--bg-primary);

    &:hover {
      background-color: var(--clr-yellow-2);
    }
  }
}

.section-title {
  font-size: 1.6rem;
  color: var(--text-primary);
}

.book-description {
  font-size: 1.4rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.book-description-empty {
  font-style: italic;
  color: var(--text-secondary);
  opacity: 0.7;
}

.book-additional-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;

  & * {
    font-size: var(--fz-sm);
  }

  & .detail-label {
    display: block;
    color: var(--text-secondary);
  }

  & .detail-value {
    color: var(--text-primary);
    font-weight: 500;
  }
}

.donor {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.donor-avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: var(--clr-yellow-2);
  color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 600;
}

.donor-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.donor-name {
  font-size: 1.4rem;
  color: var(--text-primary);
}

.donor-location {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 2rem;
}

.loading-text {
  color: var(--text-secondary);
  font-size: 1.4rem;
}

@keyframes fade-in-lift {
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}
</style>
