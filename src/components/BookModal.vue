<template>
  <div class="overlay"></div>

  <div class="book-modal">
    <div class="book-header">
      <h1 class="book-title">{{ this.bookData.title }}</h1>
      <button class="close-button" @click="close">&times;</button>
    </div>

    <div class="loader" v-if="isLoading"></div>
    <div class="book-info">
      <h2 class="book-author">By {{ this.bookData.author }}</h2>
      <p v-if="this.bookData.description" class="book-description">
        {{ this.bookData.description }}
      </p>

      <p class="book-copies">Copies: {{ this.bookData.copies }}</p>
      <span class="book-status">
        {{ this.bookData.status }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookModal',
  data() {
    return {
      isLoading: false,
    }
  },
  props: {
    bookData: {
      type: Object,
      required: true,
    }
  },
  mounted() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000); // Simulate loading time
  },
  methods: {
    close() {
      this.$emit('close');
    },
  }
}
</script>

<style scoped>
@import url('../styles/variables.css');

.overlay {
  /* Ahead of the book cards in App.vue */
  z-index: 95;
}

.book-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--bg-tertiary);
  border-radius: 2rem;
  padding: 3rem;
  width: 90vw;
  max-width: 600px;
  z-index: 100;
  box-shadow: var(--shadow-1);
  animation: fade-in 0.3s ease;
}

.book-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.book-info {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  & p,
  & span {
    font-size: clamp(1.2rem, 3vw, 1.5rem);
  }
}

.book-title {
  color: var(--clr-yellow-1);
  font-size: clamp(2rem, 5vw, 3rem);
}

.book-author {
  color: var(--text-secondary);
  font-size: clamp(1.5rem, 4vw, 2rem);
}

.close-button {
  background: none;
  border: none;
  font-size: 2.4rem;
  color: var(--text-secondary);
  cursor: pointer;

  &:hover {
    color: var(--text-primary);
  }
}
</style>