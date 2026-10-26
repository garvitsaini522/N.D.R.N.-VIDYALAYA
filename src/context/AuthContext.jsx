import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';
import { DEMO_ACCOUNTS, findDemoAccount, getDemoAccountByIdentifier } from '../config/demoAccounts';

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

    // 1. Check if matching a temporary demo evaluation account
    const matchedDemo = findDemoAccount(identifier, password);
    if (matchedDemo) {
      const demoToken = `demo_eval_token_${matchedDemo.role}_${Date.now()}`;
      localStorage.setItem('ndrn_auth_token', demoToken);
      localStorage.setItem('ndrn_auth_user', JSON.stringify(matchedDemo));
      setToken(demoToken);
      setUser(matchedDemo);
      setIsLoading(false);
      return {
        success: true,
        user: matchedDemo,
        isDemo: true,
        redirectTo: getDashboardRoute(matchedDemo.role),
      };
    }

    // 1b. Check if identifier matched a known demo account, but password was incorrect
    const demoAccountForId = getDemoAccountByIdentifier(identifier);
    if (demoAccountForId) {
      const message = `Incorrect password for evaluation account (${demoAccountForId.name}). Please check credentials or click "Auto-Fill".`;
      setError(message);
      setIsLoading(false);
      return { success: false, error: message };
    }

    // 2. Production MongoDB backend authentication
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
      if (
        message.toLowerCase().includes('database connection is currently unavailable') ||
        message.toLowerCase().includes('failed to fetch') ||
        message.toLowerCase().includes('networkerror') ||
        message.toLowerCase().includes('load failed')
      ) {
        message = 'Invalid credentials. Note: Production MongoDB database is currently offline; please use the Evaluation / Demo Administrator credentials shown on this screen, or start MongoDB.';
      }
      setError(message);
      setIsLoading(false);
      return { success: false, error: message };
    }
  };

  /**
   * Quick 1-click helper to sign in as a specific demo role
   */
  const loginAsDemoRole = (role) => {
    const demoAccount = DEMO_ACCOUNTS[role];
    if (!demoAccount) return { success: false, error: 'Invalid demo role' };

    const demoToken = `demo_eval_token_${demoAccount.role}_${Date.now()}`;
    localStorage.setItem('ndrn_auth_token', demoToken);
    localStorage.setItem('ndrn_auth_user', JSON.stringify(demoAccount));
    setToken(demoToken);
    setUser(demoAccount);
    setError(null);
    return {
      success: true,
      user: demoAccount,
      isDemo: true,
      redirectTo: getDashboardRoute(demoAccount.role),
    };
  };

  /**
   * Logout user and invalidate token
   */
  const logout = async () => {
    try {
      if (token && !token.startsWith('demo_eval_token_')) {
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
        isDemoSession: !!user?.isDemo,
        login,
        loginAsDemoRole,
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
