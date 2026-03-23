require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler, notFound, requestLogger } = require('./middlewares/errorMiddleware');

/**
 * Finatics.AI Backend Server
 * Multi-database API serving Banking DB and Application DB
 * Provides comprehensive financial dashboard functionality
 * Simplified Chatbot: 1 Query = 1 API Call (Gemini's knowledge + user data)
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
const newsRoutes = require('./routes/news');
const adminRoutes = require('./routes/admin');
const chatbotRoutes = require('./routes/chatbot');

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

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Finatics.AI Backend API',
    version: '2.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/loan-analyzer', loanAnalyzerRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/holdings', holdingsRoutes);
app.use('/api/ai-insights', aiInsightsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
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
