/**
 * Simple in-memory cache with TTL
 * Reduces API calls by caching responses
 */

class ResponseCache {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }

  /**
   * Set cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = 60000) {
    this.cache.set(key, value);
    
    // Clear existing timeout
    if (this.ttls.has(key)) {
      clearTimeout(this.ttls.get(key));
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.ttls.delete(key);
    }, ttl);
    
    this.ttls.set(key, timeout);
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {any} Cached value or undefined
   */
  get(key) {
    return this.cache.get(key);
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    if (this.ttls.has(key)) {
      clearTimeout(this.ttls.get(key));
      this.ttls.delete(key);
    }
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.ttls.forEach(timeout => clearTimeout(timeout));
    this.cache.clear();
    this.ttls.clear();
  }

  /**
   * Get cache size
   * @returns {number}
   */
  size() {
    return this.cache.size;
  }
}

// Create singleton instances
const chatbotCache = new ResponseCache();
const contextCache = new ResponseCache();

module.exports = {
  ResponseCache,
  chatbotCache,
  contextCache
};
