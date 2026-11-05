import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);

/**
 * Returns the primary dashboard path for a given role
 */
export function getDashboardRoute(role) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    case 'parent':
      return '/parent/dashboard';
    case 'student':
      return '/student/dashboard';
    default:
      return '/portal';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ndrn_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('ndrn_auth_token') || null;
  });

  const [isLoading, setIsLoading] = useState(() => {
    try {
      const storedToken = localStorage.getItem('ndrn_auth_token');
      if (!storedToken || storedToken.startsWith('demo_eval_token_')) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });
  const [error, setError] = useState(null);

  // Sync session with backend or demo session on initial load
  useEffect(() => {
    async function verifyExistingSession() {
      const storedToken = localStorage.getItem('ndrn_auth_token');
      const storedUser = localStorage.getItem('ndrn_auth_user');

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      // If this is a temporary demo session, validate locally without requiring MongoDB
      if (storedToken.startsWith('demo_eval_token_')) {
        try {
          const parsed = storedUser ? JSON.parse(storedUser) : null;
          if (parsed && parsed.isDemo && DEMO_ACCOUNTS[parsed.role]) {
            setUser(parsed);
            setToken(storedToken);
            setIsLoading(false);
            return;
          }
        } catch {
          // invalid stored demo object
        }
      }

      // Genuine production JWT token validation against MongoDB backend
      try {
        const profile = await authApi.getMe(storedToken);
        if (profile) {
          setUser(profile);
          localStorage.setItem('ndrn_auth_user', JSON.stringify(profile));
        }
      } catch (err) {
        console.warn('Stored token is invalid or backend is unreachable:', err.message);
        localStorage.removeItem('ndrn_auth_token');
        localStorage.removeItem('ndrn_auth_user');
        setUser(null);
        setToken(null);
        setError('Your previous session has expired. Please sign in again.');
      } finally {
        setIsLoading(false);
      }
    }

    verifyExistingSession();
  }, []);

  /**
   * Login with identifier and password.
   * Matches demo evaluation accounts locally without requiring MongoDB.
   * Otherwise validates against the production MongoDB backend API.
   */
  const login = async (identifier, password, preferredRole = 'student') => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await authApi.login(identifier, password);
      if (result && result.token) {
        localStorage.setItem('ndrn_auth_token', result.token);
        localStorage.setItem('ndrn_auth_user', JSON.stringify(result.user));
        setToken(result.token);
        setUser(result.user);
        setIsLoading(false);
        return { success: true, user: result.user, redirectTo: getDashboardRoute(result.user.role) };
      }
      throw new Error('Authentication failed: Missing token in response.');
    } catch (err) {
      let message = err.message || 'Authentication failed. Please verify credentials.';
      setError(message);
      setIsLoading(false);
      return { success: false, error: message };
    }
  };

  /**
   * Logout user and invalidate token
   */
  const logout = async () => {
    try {
      if (token) {
        await authApi.logout(token);
      }
    } catch {
      // Ignore background logout errors
    } finally {
      localStorage.removeItem('ndrn_auth_token');
      localStorage.removeItem('ndrn_auth_user');
      setToken(null);
      setUser(null);
      setError(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
