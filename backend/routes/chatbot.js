/**
 * Chatbot Routes
 * AI-powered finance advisor chatbot
 */

const express = require('express');
const router = express.Router();
const { processChatQuery, getChatbotHealth } = require('../controllers/chatbotController');

/**
 * POST /api/chatbot/query
 * Process user query with AI
 * Body: { userId: string, query: string }
 */
router.post('/query', processChatQuery);

/**
 * GET /api/chatbot/health
 * Check chatbot service health
 */
router.get('/health', getChatbotHealth);

module.exports = router;
