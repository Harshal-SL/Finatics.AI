const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

/**
 * News Routes
 * API endpoints for Indian stock market and finance news
 */

// Get all market news from multiple sources
// Query params: sources (comma-separated), limit (number)
// Example: GET /api/news/markets?sources=moneycontrol,economictimes&limit=20
router.get('/markets', newsController.getMarketNews);

// Get top headlines
// Query params: limit (number, default: 10)
// Example: GET /api/news/headlines?limit=15
router.get('/headlines', newsController.getTopHeadlines);

// Get company-specific news
// Example: GET /api/news/company/Reliance
router.get('/company/:companyName', newsController.getCompanyNews);

// Get news by category (markets, ipo, commodities, etc.)
// Example: GET /api/news/category/ipo
router.get('/category/:category', newsController.getNewsByCategory);

// Search news by keywords
// Query params: q (comma-separated keywords), limit (number)
// Example: GET /api/news/search?q=Nifty,Sensex&limit=10
router.get('/search', newsController.searchNews);

// Clear news cache (force refresh)
// Example: POST /api/news/cache/clear
router.post('/cache/clear', newsController.clearCache);

module.exports = router;
