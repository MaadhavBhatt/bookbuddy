/**
 * @fileoverview Request Service for BookBuddy
 *
 * This service handles all interactions with the requests collection in Firestore,
 * including creating new requests, fetching user requests, and updating request status.
 * It also handles related book status updates to maintain consistency between
 * the requests and books collections.
 *
 * @module requestService
 */

import { db, firestoreLib } from '@/firebase';

/**
 * @class RequestService
 * RequestService class containing all request-related functionality
 */
class RequestService {
  /**
   * Create a new book request
   *
   * Creates a request document in the 'requests' collection and updates the related
   * book's status to 'requested' if the book exists in the database.
   *
   * @param {Object} requestData - Data for the request
   * @param {string} requestData.bookId - ID of the requested book
   * @param {string} requestData.requesterId - ID of the user making the request
   * @param {string} requestData.donorId - ID of the book donor
   * @param {string} [requestData.message=''] - Optional message from requester
   * @returns {Promise<string>} ID of the created request
   * @throws {Error} If required fields are missing or if database operations fail
   */
  async createRequest(requestData) {
    try {
      const { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } =
        firestoreLib;

      // Validate required fields
      if (
        !requestData.bookId ||
        !requestData.requesterId ||
        !requestData.donorId
      ) {
        throw new Error('Missing required request data');
      }

      // Add the request to the Firestore "requests" collection
      const requestRef = await addDoc(collection(db, 'requests'), {
        bookId: requestData.bookId,
        requesterId: requestData.requesterId,
        donorId: requestData.donorId,
        message: requestData.message || '',
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // Check if the book exists before trying to update it
      const bookRef = doc(db, 'books', requestData.bookId);
      const bookSnap = await getDoc(bookRef);

      // Update the book status to 'requested' only if the book exists
      if (bookSnap.exists()) {
        await updateDoc(bookRef, {
          status: 'requested',
          requestId: requestRef.id,
        });
      } else {
        console.log(
          `Book with ID ${requestData.bookId} not found in Firestore. Book status not updated.`
        );
      }

      return requestRef.id;
    } catch (error) {
      console.error('Error creating book request:', error);
      throw error;
    }
  }

  /**
   * Get all requests for a specific user
   *
   * Fetches all requests where the user is either the requester or the donor.
   * Returns the requests in two separate arrays.
   *
   * @param {string} userId - User ID to fetch requests for
   * @returns {Promise<Object>} Object containing requestsMade and requestsReceived arrays
   * @throws {Error} If userId is missing or if database operations fail
   */
  async getUserRequests(userId) {
    try {
      const { collection, query, where, getDocs } = firestoreLib;

      // Validate userId
      if (!userId) {
        throw new Error('Missing user ID');
      }

      const requestsMadeQuery = query(
        collection(db, 'requests'),
        where('requesterId', '==', userId)
      );

      const requestsReceivedQuery = query(
        collection(db, 'requests'),
        where('donorId', '==', userId)
      );

      const [requestsMadeSnapshot, requestReceivedSnapshot] = await Promise.all(
        [getDocs(requestsMadeQuery), getDocs(requestsReceivedQuery)]
      );

      const requestsMade = requestsMadeSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const requestsReceived = requestReceivedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { requestsMade, requestsReceived };
    } catch (error) {
      console.error('Error fetching user requests:', error);
      throw error;
    }
  }

  /**
   * Update the status of a book request
   *
   * Updates the status of a request and also updates the related book's status
   * based on the new request status:
   * - 'approved': Book status set to 'reserved'
   * - 'completed': Book status set to 'checked_out'
   * - 'rejected' or 'cancelled': Book status set to 'available'
   *
   * @param {string} requestId - ID of the request to update
   * @param {string} newStatus - New status ('approved', 'rejected', 'completed', 'cancelled')
   * @returns {Promise<void>}
   * @throws {Error} If the request is not found or if database operations fail
   */
  async updateRequestStatus(requestId, newStatus) {
    try {
      const { doc, getDoc, updateDoc, serverTimestamp } = firestoreLib;

      // Get current request data
      const requestRef = doc(db, 'requests', requestId);
      const requestSnap = await getDoc(requestRef);

      if (!requestSnap.exists()) {
        throw new Error('Request not found');
      }

      const requestData = requestSnap.data();

      // Update request status
      await updateDoc(requestRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      // Update book status based on request status
      const bookRef = doc(db, 'books', requestData.bookId);

      if (newStatus === 'approved') {
        await updateDoc(bookRef, { status: 'reserved' });
      } else if (newStatus === 'completed') {
        await updateDoc(bookRef, { status: 'checked_out' });
      } else if (newStatus === 'rejected' || newStatus === 'cancelled') {
        await updateDoc(bookRef, {
          status: 'available',
          requestId: null,
        });
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }

  /**
   * Cancel a book request (by requester)
   *
   * Convenience method that calls updateRequestStatus with 'cancelled' status.
   * Sets the book status back to 'available'.
   *
   * @param {string} requestId - ID of the request to cancel
   * @returns {Promise<void>}
   * @throws {Error} If the request is not found or if database operations fail
   */
  async cancelRequest(requestId) {
    return this.updateRequestStatus(requestId, 'cancelled');
  }
}

export default new RequestService();
