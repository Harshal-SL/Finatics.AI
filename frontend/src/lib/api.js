/**
 * Central API base URL.
 * Set VITE_API_URL in your .env / build args to point to the deployed backend.
 * Falls back to localhost only for local development.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default API_BASE_URL;
