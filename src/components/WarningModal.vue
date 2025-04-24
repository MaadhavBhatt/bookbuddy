<template>
  <div class="overlay" v-if="isVisible"></div>
  <div class="modal-container" v-if="isVisible">
    <div class="modal-content">
      <p class="warning-text">{{ warningMessage }}</p>
      <div class="button-group">
        <button class="confirm-btn" @click="$emit('confirm')">
          {{ confirmText }}
        </button>
        <button class="cancel-btn" @click="$emit('cancel')">
          {{ cancelText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WarningModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    warningMessage: {
      type: String,
      required: true,
    },
    confirmText: {
      type: String,
      default: 'Confirm',
    },
    cancelText: {
      type: String,
      default: 'Cancel',
    },
  },

  mounted() {
    // I tried using keydown here, but then both modals close simultaneously. I think keyup does the job because once the key is released, the keydown event in BookModal cannot be triggered, which is exactly what we want.
    window.addEventListener('keyup', (event) => {
      if (event.key == 'Escape') {
        this.$emit('cancel');
      }
    });
  },
};
</script>

<style scoped>
@import url('../styles/variables.css');

.overlay {
  position: fixed;
  inset: 0 0 0 0;
  background-color: var(--clr-overlay);
  z-index: 990;
}

.modal-container {
  border-radius: 8px;
  padding: 3rem 2rem;
  max-width: 40rem;
  width: 90%;
  background-color: var(--bg-tertiary);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.warning-text {
  font-size: clamp(1.3rem, 2vw, 1.7rem);
  text-align: center;
  color: var(--text-primary);
  margin: 0;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.confirm-btn,
.cancel-btn {
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.confirm-btn {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.cancel-btn {
  background-color: var(--clr-yellow-1);
  color: var(--bg-primary);
}
</style>
