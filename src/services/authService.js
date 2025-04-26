/**
 * @fileoverview Authentication Service for BookBuddy
 *
 * This service manages user authentication using Firebase Auth,
 * providing methods for signing in, signing up, and managing the current user state.
 * It also includes a fallback for development environments where Firebase is not configured.
 *
 * @module authService
 */

import { auth } from '@/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';

/**
 * Authentication service object containing all auth-related functionality
 */
const authService = {
  /**
   * Current user state
   * @type {Object|null}
   */
  currentUser: null,

  /**
   * Initializes the authentication listener
   *
   * Sets up an observer on the user's sign-in state that gets called
   * whenever the user's sign-in state changes.
   */
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

  /**
   * Signs in a user with email and password
   *
   * @param {string} email - The user's email
   * @param {string} password - The user's password
   * @returns {Promise<Object>} User credential object
   * @throws {Error} If authentication fails or Firebase is not configured
   */
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

  /**
   * Signs in a user with Google authentication
   *
   * Opens a popup window for Google authentication and returns the user credentials.
   *
   * @returns {Promise<Object>} User credential object
   * @throws {Error} If authentication fails or Firebase is not configured
   */
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

  /**
   * Creates a new user account with email and password
   *
   * @param {string} email - The user's email
   * @param {string} password - The user's password
   * @returns {Promise<Object>} User credential object
   * @throws {Error} If sign-up fails or Firebase is not configured
   */
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

  /**
   * Signs out the current user
   *
   * @returns {Promise<void>}
   * @throws {Error} If sign-out fails
   */
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

  /**
   * Gets the currently signed-in user
   *
   * @returns {Object|null} Current user object or null if no user is signed in
   */
  getCurrentUser() {
    return this.currentUser;
  },
};

export default authService;
