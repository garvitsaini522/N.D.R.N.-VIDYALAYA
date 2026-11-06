/**
 * N.D.R.N. Vidyalaya - Centralized Frontend API Configuration
 *
 * Provides a unified source of truth for:
 * - Environment-aware API base URL resolution (VITE_API_URL / production fallback)
 * - Standardized authentication headers
 * - Network error handling and non-JSON response parsing
 * - Configuration diagnostic status inspection
 */

/**
 * Resolves the API base URL consistently across all frontend services.
 *
 * Resolution Order:
 * 1. Explicit `VITE_API_URL` from environment (e.g. 'https://api.ndrnvidyalaya.edu.in/api' or '/api').
 * 2. Production fallback: If `VITE_API_URL` is omitted in production, defaults to relative '/api'
 *    (preventing production visitors on mobile or remote devices from attempting to connect to localhost).
 * 3. Local development fallback: 'http://localhost:5000/api'.
 *
 * @param {Record<string, any>} [customEnv] Optional environment override (useful for testing)
 * @returns {string} Normalized API base URL without trailing slash
 */
export function getApiBaseUrl(customEnv = null) {
  let envUrl = null;
  let isProd = false;

  if (customEnv) {
    envUrl = customEnv.VITE_API_URL;
    isProd = Boolean(customEnv.PROD || customEnv.NODE_ENV === 'production');
  } else {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      envUrl = import.meta.env.VITE_API_URL;
      isProd = Boolean(import.meta.env.PROD);
    } else if (typeof process !== 'undefined' && process.env) {
      envUrl = process.env.VITE_API_URL;
      isProd = process.env.NODE_ENV === 'production';
    }
  }

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // In production builds without explicit VITE_API_URL, default to relative '/api'
  // so requests route through the hosting server's reverse proxy or same-domain deployment.
  if (isProd) {
    return '/api';
  }

  // Local development default
  return 'http://localhost:5000/api';
}

/**
 * Diagnostic helper to inspect active API configuration status.
 *
 * @param {Record<string, any>} [customEnv] Optional environment override (useful for testing)
 * @returns {{ isConfigured: boolean, baseUrl: string, isProduction: boolean, strategy: string }}
 */
export function getApiConfigStatus(customEnv = null) {
  let envUrl = null;
  let isProd = false;

  if (customEnv) {
    envUrl = customEnv.VITE_API_URL;
    isProd = Boolean(customEnv.PROD || customEnv.NODE_ENV === 'production');
  } else {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      envUrl = import.meta.env.VITE_API_URL;
      isProd = Boolean(import.meta.env.PROD);
    } else if (typeof process !== 'undefined' && process.env) {
      envUrl = process.env.VITE_API_URL;
      isProd = process.env.NODE_ENV === 'production';
    }
  }

  const isConfigured = Boolean(envUrl && typeof envUrl === 'string' && envUrl.trim() !== '');
  const baseUrl = getApiBaseUrl(customEnv);

  let strategy = 'development_localhost_fallback';
  if (isConfigured) {
    strategy = 'explicit_environment_variable';
  } else if (isProd) {
    strategy = 'production_relative_reverse_proxy';
  }

  return {
    isConfigured,
    baseUrl,
    isProduction: isProd,
    strategy,
  };
}

/**
 * Retrieve the active authentication token from localStorage
 */
export function getAuthToken() {
  try {
    return localStorage.getItem('ndrn_auth_token') || null;
  } catch {
    return null;
  }
}

/**
 * Build standard HTTP headers with authentication Bearer token
 */
export function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...extraHeaders,
  };

  if (token && !headers.Authorization && !headers.authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Safely parse response body as JSON or extract fallback text
 */
export async function parseResponseBody(response) {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (parseError) {
      throw new Error(`Invalid JSON response from server: ${parseError.message}`);
    }
  }

  // If server returned text/html (e.g. 502 Bad Gateway or 404 page)
  try {
    const text = await response.text();
    if (text && text.trim().startsWith('{')) {
      return JSON.parse(text);
    }
    return { message: text || response.statusText };
  } catch {
    return { message: response.statusText };
  }
}

/**
 * Standard HTTP request wrapper with robust error, JSON, and network handling
 */
export async function apiFetch(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = getAuthHeaders(options.headers);

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    const configStatus = getApiConfigStatus();
    const isLocalhost = configStatus.baseUrl.includes('localhost') || configStatus.baseUrl.includes('127.0.0.1');

    let hint = '';
    if (configStatus.isProduction && isLocalhost) {
      hint = ' (Configuration warning: Frontend is pointing to localhost in production mode. Set VITE_API_URL to your production API endpoint).';
    }

    const err = new Error(
      `Unable to connect to the N.D.R.N. Vidyalaya API server at ${url}. Please verify that the backend server is running and reachable.${hint}`
    );
    err.isNetworkError = true;
    err.originalError = networkError;
    err.configStatus = configStatus;
    throw err;
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const errorMsg =
      (data && (data.message || data.error)) ||
      `Request failed with status ${response.status} (${response.statusText})`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    err.errors = data?.errors;
    throw err;
  }

  return data;
}
