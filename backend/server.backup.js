require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler, notFound, requestLogger } = require('./middlewares/errorMiddleware');

/**
 * Finatics.AI Backend Server
 * Multi-database API serving Banking DB and Application DB
 * Provides comprehensive financial dashboard functionality
 */

// Import routes
const dashboardRoutes = require('./routes/dashboard');
const loanAnalyzerRoutes = require('./routes/loanAnalyzer');
const goalRoutes = require('./routes/goals');
const userRoutes = require('./routes/users');
const bankAccountRoutes = require('./routes/bankAccounts');
const transactionRoutes = require('./routes/transactions');
const investmentRoutes = require('./routes/investments');
const holdingsRoutes = require('./routes/holdings');
const aiInsightsRoutes = require('./routes/aiInsights');
const chatbotRoutes = require('./routes/chatbot');
const newsRoutes = require('./routes/news');
const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.PORT || 3000;

// Core Middleware Configuration
// Allow both common Vite ports (5173 and 5174) plus configured URL
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Finatics.AI Backend API',
    version: '1.0.0',
    description: 'Multi-database API serving Banking DB and Application DB',
    databases: {
      banking: 'Financial data (accounts, transactions, holdings, FDs, MFs)',
      application: 'User data (profiles, account mappings, preferences)'
    },
    endpoints: [
      'POST /api/add-account - Add bank account',
      'GET /api/bank-accounts/:userId - Get user bank accounts',
      'DELETE /api/bank-accounts/:linkId - Remove bank account',
      'POST /api/dashboard - Add bank account (smart behavior)',
      'GET /api/dashboard?userId=xxx - Dashboard metrics (balance, expenses, savings, transactions)',
      'GET /api/users/:userId/profile - Get user profile',
      'PUT /api/users/:userId/profile - Update user profile',
      'PUT /api/users/:userId/pin - Update user PIN',
      'GET /api/users/:userId/linked-accounts - Get linked bank accounts',
      'POST /api/users/:userId/linked-accounts - Link bank account',
      'POST /api/loan-analyzer - Analyze loan with AI',
      'GET /api/goals?userId=xxx - Get user goals',
      'POST /api/goals - Analyze and save financial goal with AI',
      'PUT /api/goals/:goalId - Update goal progress',
      'DELETE /api/goals/:goalId - Delete a goal',
      'GET /api/investments?userId=xxx - Get investment data (stocks, MFs, FDs)',
      'GET /api/investments/by-account?accountNumber=xxx - Get investments by account',
      'GET /api/holdings/user/:userId - Get user stock holdings',
      'GET /api/holdings/all - Get all holdings (admin)',
      'GET /api/holdings/demat/:dematId - Get holdings by demat account',
      'GET /api/ai-insights - Get AI-powered market insights',
      'POST /api/chatbot - Chat with FinAI for finance and stock queries',
      'GET /api/news/markets - Get latest market news from RSS feeds',
      'GET /api/news/headlines - Get top news headlines',
      'GET /api/news/company/:name - Get company-specific news',
      'GET /api/news/search?q=keywords - Search news by keywords',
      'GET /health - Health check endpoint'
    ]
  });
});

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api', bankAccountRoutes);
app.use('/api/loan-analyzer', loanAnalyzerRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/holdings', holdingsRoutes);
app.use('/api/ai-insights', aiInsightsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    databases: {
      banking: 'Connected',
      application: 'Connected'
    }
  });
});

// Global Error Handling (must be last)
app.use(notFound);
app.use(errorHandler);

// Start Server
const server = app.listen(port, () => {
  console.log(`Finatics.AI Backend server running on port ${port}`);
  console.log(`Dashboard API available at http://localhost:${port}/api/dashboard`);
});

// Prevent the server from exiting
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions (log but don't exit)
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  console.error('Server continues running...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise);
  console.error('Reason:', reason);
  console.error('Server continues running...');
});
