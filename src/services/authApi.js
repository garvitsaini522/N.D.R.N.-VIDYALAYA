/**
 * Authentication API Service
 * Handles communication with the Node.js/Express backend authentication endpoints.
 * Uses centralized apiConfig for environment-aware API URL and robust error handling.
 */

import { apiFetch } from './apiConfig';

export const authApi = {
  /**
   * Login with identifier (email, phone, or ID) and password
   */
  async login(identifier, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    return data.data; // { token, user }
  },

  /**
   * Get current authenticated user profile
   */
  async getMe(token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const data = await apiFetch('/auth/me', {
      method: 'GET',
      headers,
    });

    return data.data; // user profile
  },

  /**
   * Register a new user account
   */
  async register(userData, adminSetupKey = null) {
    const headers = {};
    if (adminSetupKey) {
      headers['x-admin-setup-key'] = adminSetupKey;
    }

    const data = await apiFetch('/auth/register', {
      method: 'POST',
      headers,
      body: JSON.stringify(userData),
    });

    return data.data;
  },

  /**
   * Invalidate session token on server
   */
  async logout(token) {
    try {
      if (!token) return;

      await apiFetch('/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      // Non-blocking logout error
      console.warn('Backend logout notification failed:', error.message);
    }
  },
};
