/**
 * Central API base URL.
 * Set VITE_API_URL in your .env / build args to point to the deployed backend.
 * Automatically normalizes trailing slashes and ensures the '/api' prefix.
 * Falls back to localhost:3000/api for local development.
 */
const getApiBaseUrl = () => {
  let url = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').trim();
  // Strip all trailing slashes
  url = url.replace(/\/+$/, '');
  // If user provided a base host without /api (e.g. https://backend.onrender.com), append /api
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL;

