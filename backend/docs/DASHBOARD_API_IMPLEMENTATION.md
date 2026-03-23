# Dashboard API Implementation Guide

## Overview
The `/api/dashboard` endpoint provides comprehensive financial dashboard data for users based on their linked bank accounts. It aggregates data from both Application DB (user account linkages) and Banking DB (financial data).

## API Endpoint

### GET /api/dashboard

**Description**: Retrieves dashboard metrics including account balance, monthly expenses, monthly savings, and recent transactions.

**Parameters**:
- `userId` (required): User UUID to fetch dashboard data for

**Example Request**:
```
GET /api/dashboard?userId=5de1d2f2-2d00-41f2-9149-1ac67849cb08
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "account_balance": 15000.50,
    "monthly_expenses": 3200.00,
    "monthly_savings": 1800.00,
    "monthly_savings_summary": {
      "income": 5000.00,
      "expenses": 3200.00,
      "savings": 1800.00,
      "savings_rate": 36.00
    },
    "recent_transactions": [
      {
        "transaction_id": 123,
        "account_id": 1,
        "trf_type": "debit",
        "amount": "250.00",
        "description": "Coffee Shop",
        "trf_date": "2025-10-15",
        "category": "Food",
        "merchant": "Starbucks"
      }
    ],
    "linked_accounts_count": 2,
    "bank_accounts": [
      {
        "account_id": 1,
        "account_number": "5893143322",
        "balance": 10000.00,
        "account_holder": "John Doe",
        "bank_name": "HDFC Bank",
        "account_type": "savings"
      }
    ]
  }
}
```

**Error Responses**:

400 - Invalid userId:
```json
{
  "success": false,
  "message": "Invalid userId format. Must be a valid UUID.",
  "received": "invalid-id"
}
```

404 - No linked accounts:
```json
{
  "success": false,
  "message": "No linked bank accounts found for this user",
  "data": {
    "account_balance": 0,
    "monthly_expenses": 0,
    "monthly_savings": 0,
    "monthly_savings_summary": {
      "income": 0,
      "expenses": 0,
      "savings": 0,
      "savings_rate": 0
    },
    "recent_transactions": [],
    "linked_accounts_count": 0
  }
}
```

## Implementation Architecture

### Data Flow
1. **Application DB Query**: Get user's linked account numbers from `linkedbankaccounts` table
2. **Banking DB Query**: Use account numbers to get account details and account_ids (primary keys)
3. **Transaction Queries**: Use account_ids to fetch recent and monthly transactions
4. **Financial Calculations**: Compute expenses, savings, and metrics
5. **Response Assembly**: Format data according to API specification

### Key Components

#### Service Layer (`services/dashboardService.js`)
- `getDashboardDataForEndpoint(userId)` - Main orchestration function
- `getUserLinkedAccountNumbers(userId)` - Gets account numbers from Application DB
- `getBankAccountDetailsByAccountNumbers(accountNumbers)` - Gets Banking DB account details
- `getRecentTransactionsByAccountIds(accountIds)` - Fetches last 5 transactions
- `getMonthlyTransactionsByAccountIds(accountIds)` - Gets current month transactions
- `calculateFinancialMetrics(accounts, transactions)` - Computes financial metrics

#### Controller Layer (`controllers/dashboardController.js`)
- `getDashboardData(req, res)` - HTTP request handler
- Parameter validation and error handling
- Response formatting

#### Middleware (`middlewares/errorMiddleware.js`)
- `validateDashboardQuery` - Validates userId parameter format
- UUID format validation
- Comprehensive error responses

### Database Relationships

```
Application DB:
users (user_id) 
  ↓
linkedbankaccounts (user_id, account_number)
  ↓
Banking DB:
bank_accounts (account_number → account_id [PK], customer_id)
  ↓
transactions (account_id [FK])
holdings (customer_id [FK])
loans (customer_id [FK])
```

## Financial Calculations

### Account Balance
Sum of all linked bank account balances:
```javascript
totalBalance = bankAccounts.reduce((sum, account) => 
  sum + parseFloat(account.balance || 0), 0
);
```

### Monthly Expenses
Sum of current month debit transactions:
```javascript
monthlyExpenses = monthlyTransactions
  .filter(txn => txn.trf_type === 'debit')
  .reduce((sum, txn) => sum + parseFloat(txn.amount || 0), 0);
```

### Monthly Savings
Difference between income and expenses:
```javascript
monthlySavings = monthlyIncome - monthlyExpenses;
savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
```

## Testing

### Manual Testing
```bash
# Start the server
cd BackEnd && npm run dev

# Test with curl or PowerShell
curl -X GET "http://localhost:3000/api/dashboard?userId=USER_UUID"

# PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/dashboard?userId=USER_UUID" -Method GET
```

### Automated Testing
```bash
# Run test suite
node test/test_dashboard_endpoint.js

# Test database connections
node test/test_db_connections.js
```

## Error Handling

The endpoint implements comprehensive error handling:

1. **Validation Errors**: Invalid userId format, missing parameters
2. **Database Errors**: Connection failures, query errors
3. **Data Errors**: No linked accounts, account mismatches
4. **Graceful Degradation**: Returns partial data if some queries fail

## Performance Considerations

1. **Parallel Queries**: Uses `Promise.all()` for concurrent database operations
2. **Limited Queries**: Restricts transaction queries with date ranges and limits
3. **Error Isolation**: Database failures don't cascade to other operations
4. **Efficient Joins**: Uses `IN` queries for batch operations

## Security

1. **UUID Validation**: Strict UUID format validation for user identification
2. **Parameter Sanitization**: All inputs validated before database queries
3. **Error Information**: Limited error details in production responses
4. **Database Separation**: Maintains strict separation between Application and Banking DB access

This implementation provides a robust, scalable foundation for financial dashboard functionality while maintaining security and performance best practices.