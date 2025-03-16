// src/services/authService.js
import { auth } from '@/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';

const authService = {
  // Current user state
  currentUser: null,

  // Initialize auth listener
  init() {
    if (auth) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.currentUser = user;
          console.log('User authenticated:', user.email);
        } else {
          this.currentUser = null;
          console.log('User signed out');
        }
      });
    } else {
      // Mock authentication for development
      console.log('Using mock authentication');
      this.currentUser = null;
    }
  },

  // Sign in with email and password
  async signIn(email, password) {
    if (!auth) {
      console.log('Firebase not configured');
      throw new Error('Authentication not available');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  },

  // Sign in with Google
  async signInWithGoogle() {
    if (!auth) {
      console.log('Firebase not configured');
      throw new Error('Authentication not available');
    }

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
    } catch (error) {
      console.error('Google authentication error:', error);
      throw error;
    }
  },

  // Create a new user
  async signUp(email, password) {
    if (!auth) {
      console.log('Firebase not configured');
      throw new Error('Authentication not available');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    if (!auth) {
      console.log('Firebase not configured');
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  },
};

export default authService;
