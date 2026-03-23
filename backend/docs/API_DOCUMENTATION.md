# Dashboard API Documentation

## Overview
The Dashboard API provides endpoints to manage bank accounts and retrieve comprehensive financial data from both Banking DB and Application DB.

## Base URL
```
http://localhost:3000/api/dashboa### Application DB Tables:
- `Users`: Core user information and profiles
- `UserSecurity`: User authentication and security settings
- `LinkedBankAccounts`: Links users to their bank accounts
- `AIInsights`: AI-powered financial insights and analytics
- `AIRequests`: AI request tracking and history
- `FinancialGoals`: User financial goals and targets
- `FinanceTeacherCategories`: Finance education categories
- `FinanceTeacherVideos`: Educational finance content
- `Subscriptions`: User subscription management
- `Alerts`: User alerts and notifications```

## Endpoints

### 1. Add Bank Account
**POST** `/api/dashboard`

Add a new bank account to the Application DB for a user.

**Behavior:**
- **First Account**: Simply adds the account to Application DB
- **Additional Accounts**: Adds account to Application DB AND fetches complete dashboard data from Banking DB for all user accounts

#### Request Body
```json
{
  "accountNumber": "1234567890123456",
  "bankName": "State Bank of India",
  "accountType": "savings",
  "userId": "user_12345"
}
```

#### Request Body Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| accountNumber | string | Yes | Bank account number (9-18 digits) |
| bankName | string | Yes | Name of the bank |
| accountType | string | Yes | Type of account (savings, current, salary, fixed_deposit, recurring_deposit) |
| userId | string | Yes | User ID from Application DB |

#### Success Response for First Account (201)
```json
{
  "success": true,
  "message": "First bank account added successfully",
  "data": {
    "accountAdded": {
      "id": "account_uuid",
      "user_id": "user_12345",
      "account_number": "1234567890123456",
      "bank_name": "State Bank of India",
      "account_type": "savings",
      "is_primary": true,
      "is_active": true,
      "created_at": "2025-09-26T10:30:00.000Z"
    },
    "isFirstAccount": true,
    "totalAccounts": 1
  }
}
```

#### Success Response for Additional Account (201)
```json
{
  "success": true,
  "message": "Additional bank account added successfully. You now have 2 linked accounts.",
  "data": {
    "accountAdded": {
      "id": "account_uuid_2",
      "user_id": "user_12345",
      "account_number": "9876543210987654",
      "bank_name": "HDFC Bank",
      "account_type": "current",
      "is_primary": false,
      "is_active": true,
      "created_at": "2025-09-26T10:35:00.000Z"
    },
    "isFirstAccount": false,
    "totalAccounts": 2,
    "dashboardData": {
      "accounts": [...],
      "totalBalance": 45000.75,
      "transactionHistory": [...],
      "currentHoldings": [...],
      "fixedDeposits": [...],
      "mutualFunds": [...],
      "expenses": {...}
    }
  }
}
```

#### Error Responses
- **400 Bad Request**: Missing required fields or validation errors
- **409 Conflict**: Bank account already exists for this user
- **500 Internal Server Error**: Database or server error

---

### 2. Get Dashboard Data
**GET** `/api/dashboard`

Retrieve comprehensive financial data including account balance, transaction history, holdings, FDs, mutual funds, and calculated expenses.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| accountNumber | string | No* | Specific bank account number |
| userId | string | No* | User ID to fetch all associated accounts |

*Either `accountNumber` or `userId` is required.

#### Examples
```
GET /api/dashboard?accountNumber=1234567890123456
GET /api/dashboard?userId=user_12345
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "accounts": [
      {
        "accountNumber": "1234567890123456",
        "balance": 25000.50
      }
    ],
    "totalBalance": 25000.50,
    "transactionHistory": [
      {
        "transaction_id": "txn_12345",
        "account_number": "1234567890123456",
        "transaction_type": "debit",
        "amount": -500.00,
        "description": "Online purchase",
        "merchant": "Amazon India",
        "transaction_date": "2025-09-25",
        "balance_after": 24500.50,
        "status": "completed"
      }
    ],
    "currentHoldings": [
      {
        "holding_id": "holding_12345",
        "symbol": "RELIANCE",
        "security_name": "Reliance Industries Ltd",
        "quantity": 10,
        "average_price": 2500.00,
        "current_price": 2600.00,
        "market_value": 26000.00,
        "profit_loss": 1000.00,
        "status": "active"
      }
    ],
    "fixedDeposits": [
      {
        "fd_id": "fd_12345",
        "principal_amount": 100000.00,
        "interest_rate": 6.5,
        "tenure_months": 12,
        "maturity_amount": 106500.00,
        "start_date": "2025-01-01",
        "maturity_date": "2026-01-01",
        "status": "active"
      }
    ],
    "mutualFunds": [
      {
        "mf_id": "mf_12345",
        "scheme_name": "SBI Blue Chip Fund",
        "folio_number": "12345678",
        "units": 100.25,
        "nav": 125.50,
        "invested_amount": 10000.00,
        "current_value": 12581.38,
        "profit_loss": 2581.38,
        "status": "active"
      }
    ],
    "expenses": {
      "totalExpenses": 8500.75,
      "categoryBreakdown": {
        "Food & Dining": 2500.00,
        "Transportation": 1200.50,
        "Shopping": 3000.25,
        "Utilities": 800.00,
        "Others": 1000.00
      },
      "monthlyTrend": [
        {
          "month": "2025-09",
          "totalExpenses": 8500.75,
          "transactionCount": 15
        }
      ]
    }
  }
}
```

#### Error Responses
- **400 Bad Request**: Missing required query parameters or invalid format
- **404 Not Found**: Account or user not found
- **500 Internal Server Error**: Database or server error

---

## Data Flow

### 1. Add Bank Account (POST)
1. Request validation (middleware)
2. Check if this specific account already exists for this user in Application DB
3. Check if user has any existing accounts in Application DB
4. Insert new bank account record in Application DB
   - Mark as primary if it's the first account
   - Mark as non-primary if user has existing accounts
5. **If First Account**: Return simple success response
6. **If Additional Account**: 
   - Fetch dashboard data from Banking DB for all user accounts
   - Return success response with complete dashboard data

### 2. Get Dashboard Data (GET)
1. Query validation (middleware)
2. Fetch user's bank accounts from Application DB (if userId provided)
3. For each account, fetch data from Banking DB:
   - Account balance from `accounts` table
   - Current month transactions from `transactions` table
   - Active holdings from `holdings` table
   - Active FDs from `fixed_deposits` table
   - Active mutual funds from `mutual_funds` table
4. Calculate expenses using transaction history:
   - Total expenses (sum of debit transactions)
   - Category-wise breakdown (auto-categorization)
   - Monthly trend analysis
5. Aggregate data from multiple accounts (if applicable)
6. Return comprehensive dashboard response

---

## Database Schema

### Application DB Tables
- `user_bank_accounts`: Links users to their bank accounts
- `users`: User profile information
- `user_preferences`: User settings and preferences

### Banking DB Tables
- `Customers`: Customer information and profiles
- `BankAccounts`: Bank account details and balances  
- `Transactions`: Transaction history and records
- `Holdings`: Stock/securities holdings
- `FixedDeposits`: Fixed deposit investments
- `MutualFunds`: Mutual fund investments
- `Loans`: Loan information and EMI details
- `SIPs`: Systematic Investment Plans
- `CertificateOfDeposits`: Certificate of deposit details
- `DemandAccounts`: Demand account information

---

## Expense Categorization

The system automatically categorizes expenses based on transaction descriptions and merchant names:

- **Food & Dining**: Restaurants, food delivery, cafes
- **Transportation**: Fuel, taxis, public transport
- **Shopping**: E-commerce, retail stores, groceries
- **Entertainment**: Movies, subscriptions, events
- **Utilities**: Bills, mobile recharge, internet
- **Healthcare**: Medical expenses, pharmacy
- **Education**: Fees, courses, books
- **Finance**: Bank charges, loan EMIs, insurance
- **Others**: Uncategorized transactions

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // For validation errors
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created successfully
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `409`: Conflict (duplicate entry)
- `500`: Internal Server Error

---

## Environment Variables Required

```env
# Banking Database (Supabase)
BANKING_DB_URL=your_banking_db_url
BANKING_DB_ANON_KEY=your_banking_db_anon_key

# Application Database (Supabase)
APP_DB_URL=your_app_db_url
APP_DB_ANON_KEY=your_app_db_anon_key

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```