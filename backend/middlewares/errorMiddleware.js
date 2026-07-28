/**
 * Error Handling and Validation Middleware
 * Provides request logging, validation, and comprehensive error handling
 * for the Dashboard API endpoints
 */

/**
 * Request Logger Middleware
 * Logs incoming requests with timestamp, method, URL
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Handler Middleware
 * Handles all application errors with appropriate HTTP status codes
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle specific Supabase database errors
  if (err.code) {
    switch (err.code) {
      case 'PGRST116': // No rows returned
        statusCode = 404;
        message = 'Resource not found';
        break;
      case '23505': // Unique violation
        statusCode = 409;
        message = 'Duplicate entry - resource already exists';
        break;
      case '23503': // Foreign key violation
        statusCode = 400;
        message = 'Invalid reference - related resource not found';
        break;
      case '42P01': // Undefined table
        statusCode = 500;
        message = 'Database table not found';
        break;
      default:
        statusCode = 500;
        message = 'Database error occurred';
    }
  }

  // Log error details
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    statusCode,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      originalError: err.message 
    })
  });
};

/**
 * Bank Account Validation Middleware
 * Validates POST request data for adding bank accounts
 */
const validateBankAccount = (req, res, next) => {
  const { accountNumber, bankName, accountType, userId } = req.body;
  const errors = [];
  
  // Validate required fields
  if (!accountNumber || typeof accountNumber !== 'string' || accountNumber.trim().length === 0) {
    errors.push('Account number is required and must be a non-empty string');
  }
  
  if (!bankName || typeof bankName !== 'string' || bankName.trim().length === 0) {
    errors.push('Bank name is required and must be a non-empty string');
  }
  
  if (!accountType || typeof accountType !== 'string' || accountType.trim().length === 0) {
    errors.push('Account type is required and must be a non-empty string');
  }
  
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    errors.push('User ID is required and must be a non-empty string');
  }
  
  // Validate account number format (assuming Indian account numbers)
  if (accountNumber && !/^\d{9,18}$/.test(accountNumber.replace(/\s/g, ''))) {
    errors.push('Account number must be 9-18 digits');
  }
  
  // Validate account type
  const validAccountTypes = ['savings', 'current', 'salary', 'fixed_deposit', 'recurring_deposit'];
  if (accountType && !validAccountTypes.includes(accountType.toLowerCase())) {
    errors.push(`Account type must be one of: ${validAccountTypes.join(', ')}`);
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

/**
 * Dashboard Query Validation Middleware
 * Validates GET request parameters for dashboard data retrieval
 * Now specifically requires userId parameter for the new dashboard endpoint
 */
const validateDashboardQuery = (req, res, next) => {
  const { userId, user_id } = req.query;
  
  // Support both userId (camelCase) and user_id (snake_case)
  const userIdParam = userId || user_id;
  
  // Require userId parameter
  if (!userIdParam) {
    return res.status(400).json({
      success: false,
      message: 'userId query parameter is required',
      example: 'GET /api/dashboard?userId=2b06a9d7-a452-45a4-a31e-38e7c411c7ab'
    });
  }
  
  // Validate userId format (basic UUID validation)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userIdParam)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid userId format. Must be a valid UUID.',
      received: userIdParam
    });
  }
  
  next();
};

module.exports = {
  requestLogger,
  notFound,
  errorHandler,
  validateBankAccount,
  validateDashboardQuery
};