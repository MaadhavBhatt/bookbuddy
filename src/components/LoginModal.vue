<template>
  <div class="login-modal" v-if="show">
    <div class="modal-backdrop" @click="close"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isSignUp ? 'Create Account' : 'Sign In' }}</h2>
        <button class="close-button" @click="close">&times;</button>
      </div>

      <div class="modal-body">
        <div v-if="error" class="error-message">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required placeholder="your@email.com">
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="password" required placeholder="Your password">
          </div>

          <div v-if="isSignUp" class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword" required
              placeholder="Confirm your password">
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button" :disabled="isLoading">
              {{ isSignUp ? 'Sign Up' : 'Sign In' }}
            </button>

            <button type="button" class="google-button" @click="signInWithGoogle" :disabled="isLoading">
              Sign in with Google
            </button>
          </div>
        </form>

        <div class="toggle-mode">
          <span v-if="isSignUp">
            Already have an account?
            <a href="#" @click.prevent="isSignUp = false">Sign In</a>
          </span>
          <span v-else>
            Need an account?
            <a href="#" @click.prevent="isSignUp = true">Sign Up</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService';

export default {
  name: 'LoginModal',

  props: {
    show: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      isSignUp: false,
      email: '',
      password: '',
      confirmPassword: '',
      error: false,
      errorMessage: '',
      isLoading: false
    };
  },

  methods: {
    close() {
      this.$emit('close');
    },

    async handleSubmit() {
      this.error = false;
      this.isLoading = true;

      try {
        if (this.isSignUp) {
          // Check if passwords match
          if (this.password !== this.confirmPassword) {
            throw new Error('Passwords do not match');
          }

          // Sign up
          await authService.signUp(this.email, this.password);
        } else {
          // Sign in
          await authService.signIn(this.email, this.password);
        }

        // Close modal and notify parent
        this.close();
        this.$emit('auth-success');

      } catch (error) {
        this.error = true;

        // Handle different Firebase auth errors
        if (error.code === 'auth/wrong-password') {
          this.errorMessage = 'Incorrect password';
        } else if (error.code === 'auth/user-not-found') {
          this.errorMessage = 'No account found with this email';
        } else if (error.code === 'auth/email-already-in-use') {
          this.errorMessage = 'An account with this email already exists';
        } else {
          this.errorMessage = error.message;
        }

      } finally {
        this.isLoading = false;
      }
    },

    async signInWithGoogle() {
      this.error = false;
      this.isLoading = true;

      try {
        await authService.signInWithGoogle();
        this.close();
        this.$emit('auth-success');
      } catch (error) {
        this.error = true;
        this.errorMessage = 'Google sign-in failed. Please try again.';
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
@import url(../styles/variables.css);

* {
  font-family: var(--ff-main);
  font-size: 10px;
}

.login-modal {
  position: fixed;
  inset: 0 0 0 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  inset: 0 0 0 0;
  background-color: var(--clr-overlay);
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 450px;
  background-color: #2c2c2c;
  border-radius: 8px;
  box-shadow: 0 0.4rem 2rem rgba(0, 0, 0, 0.3);
  z-index: 101;
}

.modal-header {
  padding: 2rem;
  border-bottom: 1px solid #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 2.5rem;
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

.error-message {
  background-color: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  padding: 1rem;
  border-radius: 0.4rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 2rem;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #ddd;
}

input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #444;
  border-radius: 0.4rem;
  background-color: #333;
  color: white;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

button {
  padding: 1.2rem;
  border: none;
  border-radius: 0.4rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-button {
  background-color: var(--clr-yellow-2);

  &:hover:not(:disabled) {
    background-color: var(--clr-yellow-1);
  }
}

.google-button {
  background-color: white;
  color: #333;

  &:hover:not(:disabled) {
    background-color: #f1f1f1;
  }
}

.toggle-mode {
  margin-top: 2rem;
  text-align: center;
  color: #bbb;

  & a {
    color: #3498db;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

@media screen and (max-width: 425px) {
  .modal-content {
    width: 100%;
    height: 100%;
    max-width: none;
    border-radius: 0;
  }

  .modal-body {
    height: calc(100% - 5rem);
    overflow-y: auto;
  }
}
</style>