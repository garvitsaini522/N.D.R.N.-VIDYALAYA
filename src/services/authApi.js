/**
 * Authentication API Service
 * Handles communication with the Node.js/Express backend authentication endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authApi = {
  /**
   * Login with identifier (email, phone, or ID) and password
   */
  async login(identifier, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      return data.data; // { token, user }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get current authenticated user profile
   */
  async getMe(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to authenticate session token');
      }

      return data.data; // user profile
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register a new user account
   */
  async register(userData, adminSetupKey = null) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (adminSetupKey) {
        headers['x-admin-setup-key'] = adminSetupKey;
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Invalidate session token on server
   */
  async logout(token) {
    try {
      if (!token) return;

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Non-blocking logout error
      console.warn('Backend logout notification failed:', error.message);
    }
  },
};
