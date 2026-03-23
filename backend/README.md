# Finatics.AI Backend API

A Node.js/Express backend server that provides banking and financial data from two separate Supabase databases:
- **Banking DB**: Contains financial data (accounts, transactions, budgets, goals)
- **Application DB**: Contains user data (profiles, preferences, settings)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your Supabase credentials in `.env`:
```env
# Banking Database (Supabase)
BANKING_DB_URL=your_banking_db_supabase_url

# Application Database (Supabase)
APP_DB_URL=your_app_db_supabase_url
APP_DB_ANON_KEY=your_app_db_anon_key

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Dashboard APIs
#### GET `/api/dashboard?accountNumber=ACCOUNT123`
Returns complete dashboard data including accounts, transactions, budgets, goals, and analytics for a specific user account.

**Query Parameters:**
- `accountNumber` (required): User's account number

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "accountNumber": "ACCOUNT123",
      "memberSince": "2024-01-15T..."
    },
    "summary": {
      "totalBalance": 15000.50,
      "totalAccounts": 3,
      "monthlyIncome": 5000.00,
#### Loan Analyzer APIs

##### POST `/api/loan-analyzer`
Analyze a loan request with AI.

- Body: `{ "userId": "<uuid>", "loanAmount": 250000 }`
- Returns: `credit_score`, `average_savings`, `average_expenses`, `months_considered`, `ai_response`

##### GET `/api/loan-analyzer/metrics?userId=<uuid>`
Returns only computed metrics without calling AI.

- Response: `{ "creditScore": number|null, "avgSavings": number, "avgExpenses": number, "monthsConsidered": number }`
      "activeGoals": 2
    },
    "accounts": [...],
    "recentTransactions": [...],
    "budgets": [...],
    "goals": [...],
    "categories": [...],
    "analytics": {
      "categorySpending": [...],
      "monthlyTrend": {...}
    },
    "preferences": {
      "currency": "USD",
      "language": "en",
      "notifications": true
    },
    "lastUpdated": "2025-09-26T..."
  },
Analyze a loan request with AI
  "message": "Dashboard data retrieved successfully"
}
```

#### GET `/api/dashboard/accounts?accountNumber=ACCOUNT123`
Returns account summary grouped by account type for a specific user.

**Query Parameters:**
- `accountNumber` (required): User's account number

**Response:**
```json
{
  "success": true,
  "data": {
    "checking": {
      "count": 2,
      "totalBalance": 5000.00,
      "accounts": [...]
    },
    "savings": {
      "count": 1,
      "totalBalance": 10000.00,
      "accounts": [...]
    }
  },
  "message": "Account summary retrieved successfully"
}
```

#### GET `/api/dashboard/spending?accountNumber=ACCOUNT123&timeframe=30`
Returns spending analysis with optional timeframe for a specific user.

**Query Parameters:**
- `accountNumber` (required): User's account number
- `timeframe` (optional): Number of days to analyze (default: 30)

**Example:** `/api/dashboard/spending?accountNumber=ACCOUNT123&timeframe=7`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSpending": 1250.75,
    "transactionCount": 25,
    "averageTransaction": 50.03,
    "categoryAnalysis": {
      "Food": {
        "amount": 450.00,
        "count": 8,
        "percentage": 36.00
      },
      "Transport": {
        "amount": 200.00,
        "count": 5,
        "percentage": 16.00
      }
    },
    "dailySpending": {
      "2025-09-25": 85.50,
      "2025-09-24": 120.00
    },
    "timeframe": "30 days"
  },
  "message": "Spending analysis retrieved successfully"
}
```

#### GET `/api/dashboard/profile?accountNumber=ACCOUNT123`
Returns user profile information from Application DB.

**Query Parameters:**
- `accountNumber` (required): User's account number

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "accountNumber": "ACCOUNT123",
      "phone": "+1234567890",
      "created_at": "2024-01-15T..."
    },
    "preferences": {
      "currency": "USD",
      "language": "en",
      "notifications": true,
      "theme": "light"
    }
  },
  "message": "User profile retrieved successfully"
}
```

#### PUT `/api/dashboard/preferences?accountNumber=ACCOUNT123`
Updates user preferences in Application DB.

**Query Parameters:**
- `accountNumber` (required): User's account number

**Request Body:**
```json
{
  "currency": "EUR",
  "language": "es",
  "notifications": false,
  "theme": "dark"
}
```

### Other Endpoints

#### GET `/`
Returns API information and available endpoints.

#### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-26T...",
  "uptime": 1234.567
}
```

## Database Schema Expected

The API expects the following Supabase tables across two databases:

### Banking DB Tables

### `accounts`
- `id` (uuid, primary key)
- `account_number` (text, foreign key to Application DB users)
- `account_name` (text)
- `account_type` (text) - e.g., 'checking', 'savings', 'credit'
- `balance` (numeric)
- `created_at` (timestamp)

### `transactions`
- `id` (uuid, primary key)
- `account_id` (uuid, foreign key to accounts)
- `account_number` (text, for filtering)
- `amount` (numeric)
- `type` (text) - 'income' or 'expense'
- `category` (text)
- `description` (text)
- `transaction_date` (date)
- `created_at` (timestamp)

### `budgets`
- `id` (uuid, primary key)
- `account_number` (text, for filtering)
- `category` (text)
- `amount` (numeric)
- `period` (text) - e.g., 'monthly'
- `created_at` (timestamp)

### `goals`
- `id` (uuid, primary key)
- `account_number` (text, for filtering)
- `name` (text)
- `target_amount` (numeric)
- `current_amount` (numeric)
- `target_date` (date)
- `created_at` (timestamp)

### `categories`
- `id` (uuid, primary key)
- `name` (text)
- `type` (text) - 'income' or 'expense'
- `created_at` (timestamp)

### Application DB Tables

### `users`
- `id` (uuid, primary key)
- `account_number` (text, unique) - Links to Banking DB
- `name` (text)
- `email` (text, unique)
- `phone` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `user_preferences`
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to users)
- `currency` (text) - e.g., 'USD', 'EUR'
- `language` (text) - e.g., 'en', 'es'
- `notifications` (boolean)
- `theme` (text) - e.g., 'light', 'dark'
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Error Handling

All endpoints return errors in the following format:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## CORS

The server is configured to accept requests from `http://localhost:5173` (Vite default) or the URL specified in `FRONTEND_URL` environment variable.

## Development

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Dependencies

- `express` - Web framework
- `@supabase/supabase-js` - Supabase client
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `nodemon` - Development server (dev dependency)