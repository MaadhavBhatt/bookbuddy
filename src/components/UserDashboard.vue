<template>
  <div class="dashboard">
    <div class="dashboard-overlay" @click="close"></div>

    <div class="dashboard-content">
      <button class="close-dashboard" @click="close">&times;</button>
      <div class="dashboard__header">
        <h2 class="dashboard__title">My Dashboard</h2>
        <div class="dashboard__tabs">
          <button
            class="dashboard__tab-button"
            :class="{
              'dashboard__tab-button--active': activeTab === 'requests',
            }"
            @click="activeTab = 'requests'"
          >
            My Requests
          </button>
          <button
            class="dashboard__tab-button"
            :class="{
              'dashboard__tab-button--active': activeTab === 'donations',
            }"
            @click="activeTab = 'donations'"
          >
            My Donations
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'requests'" class="dashboard__content">
        <div class="dashboard__filters">
          <select v-model="requestFilter" class="dashboard__filter-select">
            <option value="all">All Requests</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div v-if="isLoading" class="dashboard__loading">
          <div class="dashboard__spinner"></div>
          <p class="dashboard__loading-text">Loading...</p>
        </div>

        <div v-else-if="filteredRequests.length === 0" class="dashboard__empty">
          <p class="dashboard__empty-text">No requests found</p>
        </div>

        <ul v-else class="dashboard__list">
          <li
            v-for="request in filteredRequests"
            :key="request.id"
            class="dashboard-card"
          >
            <div class="dashboard-card__header">
              <div
                class="dashboard-card__image"
                :style="
                  request.bookCover
                    ? `background-image: url(${request.bookCover})`
                    : ''
                "
              ></div>
              <div class="dashboard-card__info">
                <h3 class="dashboard-card__title">{{ request.bookTitle }}</h3>
                <p class="dashboard-card__author">{{ request.bookAuthor }}</p>
                <span
                  class="dashboard-card__status"
                  :class="`dashboard-card__status--${request.status}`"
                >
                  {{ getStatusLabel(request.status) }}
                </span>
              </div>
            </div>
            <div class="dashboard-card__details">
              <div class="dashboard-card__detail">
                <span class="dashboard-card__detail-label">Requested:</span>
                <span class="dashboard-card__detail-value">{{
                  formatDate(request.requestDate)
                }}</span>
              </div>
              <div class="dashboard-card__detail">
                <span class="dashboard-card__detail-label">Quantity:</span>
                <span class="dashboard-card__detail-value">{{
                  request.quantity
                }}</span>
              </div>
            </div>
            <div class="dashboard-card__actions">
              <button
                v-if="request.status === 'pending'"
                class="dashboard-card__button dashboard-card__button--cancel"
                @click="cancelRequest(request)"
              >
                Cancel
              </button>
              <button
                v-if="request.status === 'approved'"
                class="dashboard-card__button dashboard-card__button--primary"
              >
                Contact Donor
              </button>
              <button
                v-if="request.status === 'ready'"
                class="dashboard-card__button dashboard-card__button--success"
                @click="markReceived(request)"
              >
                Mark Received
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="activeTab === 'donations'" class="dashboard__content">
        <div class="dashboard__filters">
          <select v-model="donationFilter" class="dashboard__filter-select">
            <option value="all">All Donations</option>
            <option value="available">Available</option>
            <option value="transferred">Transferred</option>
          </select>
        </div>

        <div v-if="isLoading" class="dashboard__loading">
          <div class="dashboard__spinner"></div>
          <p class="dashboard__loading-text">Loading...</p>
        </div>

        <div
          v-else-if="filteredDonations.length === 0"
          class="dashboard__empty"
        >
          <p class="dashboard__empty-text">No donations found</p>
        </div>

        <ul v-else class="dashboard__list">
          <li
            v-for="donation in filteredDonations"
            :key="donation.id"
            class="dashboard-card"
          >
            <div class="dashboard-card__header">
              <div
                class="dashboard-card__image"
                :style="
                  donation.coverImage
                    ? `background-image: url(${donation.coverImage})`
                    : ''
                "
              ></div>
              <div class="dashboard-card__info">
                <h3 class="dashboard-card__title">{{ donation.title }}</h3>
                <p class="dashboard-card__author">{{ donation.author }}</p>
                <span
                  class="dashboard-card__status"
                  :class="`dashboard-card__status--${donation.status}`"
                >
                  {{ getStatusLabel(donation.status) }}
                </span>
              </div>
            </div>
            <div class="dashboard-card__details">
              <div class="dashboard-card__detail">
                <span class="dashboard-card__detail-label">Donated:</span>
                <span class="dashboard-card__detail-value">{{
                  formatDate(donation.addedAt)
                }}</span>
              </div>
              <div class="dashboard-card__detail">
                <span class="dashboard-card__detail-label">Copies:</span>
                <span class="dashboard-card__detail-value">{{
                  donation.copies
                }}</span>
              </div>
              <div class="dashboard-card__detail">
                <span class="dashboard-card__detail-label">Condition:</span>
                <span class="dashboard-card__detail-value">{{
                  donation.condition
                }}</span>
              </div>
            </div>
            <div class="dashboard-card__actions">
              <button
                v-if="donation.status === 'available'"
                class="dashboard-card__button dashboard-card__button--edit"
              >
                Edit
              </button>
              <button
                v-if="donation.status === 'requested'"
                class="dashboard-card__button dashboard-card__button--primary"
              >
                View Requests
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { db, firestoreLib } from '@/firebase';
import requestService from '@/services/requestService';

export default {
  name: 'UserDashboard',

  props: {
    currentUser: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      activeTab: 'requests',
      isLoading: false,
      requests: [],
      donations: [],
      requestFilter: 'all',
      donationFilter: 'all',
    };
  },

  computed: {
    filteredRequests() {
      if (this.requestFilter === 'all') {
        return this.requests;
      } else if (this.requestFilter === 'active') {
        return this.requests.filter((req) =>
          ['pending', 'approved', 'ready'].includes(req.status)
        );
      } else {
        return this.requests.filter((req) =>
          ['fulfilled', 'cancelled', 'rejected'].includes(req.status)
        );
      }
    },

    filteredDonations() {
      if (this.donationFilter === 'all') {
        return this.donations;
      } else if (this.donationFilter === 'available') {
        return this.donations.filter(
          (donation) => donation.status === 'available'
        );
      } else {
        return this.donations.filter(
          (donation) => donation.status !== 'available'
        );
      }
    },
  },

  created() {
    this.loadUserData();
  },

  mounted() {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.close();
      }
    });
  },

  methods: {
    close() {
      this.$emit('close');
    },

    async loadUserData() {
      if (!this.currentUser) return;

      this.isLoading = true;

      try {
        await Promise.all([this.fetchRequests(), this.fetchDonations()]);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchRequests() {
      try {
        // Use the requestService to get all requests for the current user
        const { requestsMade } = await requestService.getUserRequests(
          this.currentUser.uid
        );

        // Store the requests in the component data
        this.requests = requestsMade;

        // For each request, get the book details
        for (const request of this.requests) {
          // Get the book details
          const bookRef = firestoreLib.doc(db, 'books', request.bookId);
          const bookSnap = await firestoreLib.getDoc(bookRef);

          if (bookSnap.exists()) {
            const bookData = bookSnap.data();
            // Add book details to the request
            request.bookTitle = bookData.title;
            request.bookAuthor = bookData.author;
            request.bookCover = bookData.coverUrl;

            // Format date
            if (request.createdAt) {
              // Handle Firestore timestamp
              request.requestDate =
                request.createdAt instanceof Date
                  ? request.createdAt
                  : request.createdAt.toDate();
            }
          }
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    },

    async fetchDonations() {
      const { collection, query, where, getDocs } = firestoreLib;

      // Get books where the current user is a donor
      const booksRef = collection(db, 'books');
      const snapshot = await getDocs(booksRef);

      this.donations = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (book) =>
            book.donors &&
            book.donors.some((donor) => donor.email === this.currentUser.email)
        );
    },

    getStatusLabel(status) {
      const statusMap = {
        pending: 'Pending',
        approved: 'Approved',
        ready: 'Ready for Pickup',
        fulfilled: 'Received',
        cancelled: 'Cancelled',
        rejected: 'Declined',
        available: 'Available',
        requested: 'Requested',
        transferred: 'Transferred',
      };

      return statusMap[status] || status;
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';

      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    async cancelRequest(request) {
      if (!confirm(`Cancel your request for "${request.bookTitle}"?`)) {
        return;
      }

      try {
        // Use the requestService to cancel the request
        await requestService.cancelRequest(request.id);

        // Update local data
        const index = this.requests.findIndex((r) => r.id === request.id);
        if (index !== -1) {
          this.requests[index].status = 'cancelled';
        }
      } catch (error) {
        console.error('Error cancelling request:', error);
        alert('Failed to cancel request');
      }
    },

    async markReceived(request) {
      if (!confirm(`Mark "${request.bookTitle}" as received?`)) {
        return;
      }

      try {
        const { doc, updateDoc } = firestoreLib;
        const requestRef = doc(db, 'requests', request.id);

        await updateDoc(requestRef, {
          status: 'fulfilled',
          fulfilledAt: new Date().toISOString(),
        });

        // Update local data
        const index = this.requests.findIndex((r) => r.id === request.id);
        if (index !== -1) {
          this.requests[index].status = 'fulfilled';
        }
      } catch (error) {
        console.error('Error updating request:', error);
        alert('Failed to update request');
      }
    },
  },
};
</script>

<style scoped>
.dashboard {
  position: fixed;
  inset: 0 0 0 0;
  width: 100%;
  height: 100vh;

  margin: 0;
  padding: 0;
  z-index: 100;

  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-overlay {
  position: fixed;
  inset: 0 0 0 0;
  background-color: var(--clr-overlay);
  z-index: 90;
}

.close-dashboard {
  position: absolute;
  top: 1.6rem;
  right: 1.6rem;

  background: none;
  border: none;
  cursor: pointer;
  z-index: 103;

  font-size: 2.4rem;
  color: var(--text-primary);
}

.dashboard-content {
  position: relative;
  z-index: 100;

  padding: 3rem;
  width: 95%;
  max-width: 100rem;
  min-height: 80vh;
  
  background-color: var(--bg-tertiary);
  border-radius: 0.8rem;
}

.dashboard__content {
  max-height: 60vh;
  overflow: auto scroll;
  scrollbar-width: thin;
  scrollbar-color: var(--clr-yellow-3) transparent;
}

.dashboard__title {
  font-size: 2.4rem;
  color: var(--text-primary);
}

.dashboard__tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
}

.dashboard__tab-button {
  padding: 1.2rem 1.6rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.6rem;
  cursor: pointer;
  position: relative;
}

.dashboard__tab-button--active {
  color: var(--clr-yellow-1);
}

.dashboard__tab-button--active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--clr-yellow-1);
}

.dashboard__filters {
  padding: 1rem 0;
}

.dashboard__filter-select {
  width: 100%;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 0.4rem;
  color: var(--text-primary);
  font-size: 1.4rem;
}

.dashboard__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.dashboard__spinner {
  width: 4rem;
  height: 4rem;
  border: 0.3rem solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--clr-yellow-1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dashboard__loading-text {
  color: var(--text-secondary);
}

.dashboard__empty {
  text-align: center;
  padding: 4rem 0;
}

.dashboard__empty-text {
  color: var(--text-secondary);
}

.dashboard__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.6rem;
}

/* Donation and Request Card Styles */
.dashboard-card {
  background-color: var(--bg-secondary);
  border-radius: 0.8rem;
  overflow: hidden;
  padding: 1.5rem;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard-card__header {
  display: flex;
  gap: 1rem;
}

.dashboard-card__image {
  width: 6rem;
  height: 9rem;
  background-color: var(--clr-yellow-2);
  border-radius: 0.4rem;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.dashboard-card__info {
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dashboard-card__title {
  font-size: 1.8rem;
  color: var(--text-primary);
}

.dashboard-card__author {
  font-size: 1.4rem;
  color: var(--text-secondary);
}

.dashboard-card__status {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  max-width: fit-content;
  border-radius: 0.4rem;
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--bg-secondary);
}

.dashboard-card__status--available,
.dashboard-card__status--ready,
.dashboard-card__button--success {
  background-color: var(--clr-yellow-1);
}

.dashboard-card__status--requested,
.dashboard-card__status--pending {
  background-color: var(--clr-yellow-2);
}

.dashboard-card__status--transferred,
.dashboard-card__status--fulfilled {
  background-color: var(--clr-yellow-3);
}

.dashboard-card__button--edit {
  background-color: transparent;
  border: 1px solid var(--clr-yellow-1);
  color: var(--clr-yellow-1);
}

.dashboard-card__button--primary {
  background-color: var(--clr-blue);
  border: none;
  color: var(--bg-secondary);
}

.dashboard-card__status--approved {
  background-color: var(--clr-blue);
}

.dashboard-card__status--cancelled,
.dashboard-card__status--rejected {
  background-color: var(--clr-red-1);
  color: var(--text-primary);
}

.dashboard-card__button--cancel {
  background-color: transparent;
  border: 1px solid var(--clr-red-1);
  color: var(--clr-red-1);
}

.dashboard-card__detail {
  display: flex;
  justify-content: space-between;
  font-size: 1.4rem;
}

.dashboard-card__detail-label {
  color: var(--text-secondary);
}

.dashboard-card__detail-value {
  color: var(--text-primary);
  font-weight: 500;
}

.dashboard-card__actions {
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.dashboard-card__button {
  padding: 0.8rem 1.6rem;
  border-radius: 0.4rem;
  font-weight: 500;
  font-size: 1.4rem;
  cursor: pointer;
}

/* Media queries for responsive design */
@media (min-width: 768px) {
  .dashboard__filter-select {
    width: auto;
    min-width: 20rem;
  }

  .dashboard__list {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

@media (min-width: 1024px) {
  .dashboard__list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
