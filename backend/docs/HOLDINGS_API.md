# Holdings API Documentation

## Overview
The Holdings API provides endpoints to fetch stock holdings data from the banking database for users and their demat accounts.

## Endpoints

### 1. Get Holdings by Account Number (Recommended)
**Endpoint:** `GET /api/holdings/account/:accountNumber`

**Description:** Fetches stock holdings directly using the bank account number. This is the recommended method as it doesn't require user authentication mapping.

**Parameters:**
- `accountNumber` (path param): Bank account number

**Example Request:**
```bash
GET http://localhost:3000/api/holdings/account/5893143322
```

**Example Response:**
```json
{
  "success": true,
  "message": "Holdings fetched successfully",
  "data": {
    "customer": {
      "customer_id": 1,
      "full_name": "Tara Walia",
      "email": "dayaldiya@yahoo.com",
      "phone": "04759382421",
      "credit_score": 776.66
    },
    "bankAccount": {
      "account_id": 1,
      "account_number": "5893143322",
      "bank_name": "ICICI Bank",
      "account_type": "Savings",
      "balance": 313000.81,
      "status": "Active"
    },
    "holdings": [
      {
        "holding_id": 1,
        "demat_id": 1,
        "broker_name": "Zerodha",
        "name": "Raju-De",
        "symbol": "Raju-De",
        "quantity": 11,
        "bought_price": 261.23,
        "current_price": 282.27,
        "investment": 2873.53,
        "currentValue": 3104.97,
        "gainLoss": 231.44,
        "gainLossPercent": 8.05,
        "status": "Active"
      }
    ],
    "dematAccounts": [
      {
        "demat_id": 1,
        "broker_name": "Zerodha",
        "masked_demat": "XXXX1080",
        "total_value": 44225.10,
        "last_synced": "2025-09-07T14:28:04.797565"
      }
    ],
    "summary": {
      "totalHoldings": 2,
      "totalValue": 32684.29,
      "totalInvestment": 27625.87,
      "totalGainLoss": 5058.42,
      "totalGainLossPercent": 18.31
    }
  }
}
```

### 2. Get Holdings by User ID
**Endpoint:** `GET /api/holdings/user/:userId`

**Description:** Fetches holdings for a user by user_id. Requires the user to exist in the auth_users table.

**Parameters:**
- `userId` (path param): User UUID
- `accountNumber` (query param, optional): Filter by specific account number

**Example Request:**
```bash
GET http://localhost:3000/api/holdings/user/6b867f4e-6461-416e-8f6c-13ae8e177070
GET http://localhost:3000/api/holdings/user/6b867f4e-6461-416e-8f6c-13ae8e177070?accountNumber=5893143322
```

### 3. Get All Holdings (Admin)
**Endpoint:** `GET /api/holdings/all`

**Description:** Fetches all holdings from the database. Useful for admin/debug purposes.

**Example Request:**
```bash
GET http://localhost:3000/api/holdings/all
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "holding_id": 1,
      "demat_id": 1,
      "name": "Raju-De",
      "quantity": 11,
      "bought_price": 261.23,
      "current_price": 282.27,
      "status": "Active"
    }
  ],
  "count": 51
}
```

### 4. Get Holdings by Demat Account
**Endpoint:** `GET /api/holdings/demat/:dematId`

**Description:** Fetches holdings for a specific demat account.

**Parameters:**
- `dematId` (path param): Demat account ID

**Example Request:**
```bash
GET http://localhost:3000/api/holdings/demat/1
```

## Data Models

### Holdings Object
```typescript
{
  holding_id: number,
  demat_id: number,
  broker_name: string,
  name: string,
  symbol: string,
  quantity: number,
  bought_price: number,
  current_price: number,
  selling_price: number | null,
  selling_date: date | null,
  status: string,
  investment: number,          // Calculated: bought_price * quantity
  currentValue: number,        // Calculated: current_price * quantity
  gainLoss: number,           // Calculated: currentValue - investment
  gainLossPercent: number,    // Calculated: (gainLoss / investment) * 100
  created_at: timestamp
}
```

### Summary Object
```typescript
{
  totalHoldings: number,       // Count of holdings
  totalValue: number,          // Sum of all currentValue
  totalInvestment: number,     // Sum of all investment
  totalGainLoss: number,       // Sum of all gainLoss
  totalGainLossPercent: number // (totalGainLoss / totalInvestment) * 100
}
```

## Test Data
**User ID:** `6b867f4e-6461-416e-8f6c-13ae8e177070`  
**Account Number:** `5893143322`  
**Customer:** Tara Walia (dayaldiya@yahoo.com)  
**Bank:** ICICI Bank  
**Demat Broker:** Zerodha  

### Holdings:
1. **Raju-De**
   - Quantity: 11
   - Bought Price: ₹261.23
   - Current Price: ₹282.27
   - Gain: ₹231.44 (8.05%)

2. **Sankaran-Chatterjee**
   - Quantity: 34
   - Bought Price: ₹728.01
   - Current Price: ₹869.98
   - Gain: ₹4,826.98 (19.50%)

**Total Portfolio Value:** ₹32,684.29  
**Total Investment:** ₹27,625.87  
**Total Gain:** ₹5,058.42 (18.31%)

## Testing

### Run the test script:
```powershell
# From BackEnd directory
.\test\run_holdings_test.ps1

# OR
node test/test_holdings.js
```

### Manual testing with curl:
```bash
# Get holdings by account number
curl http://localhost:3000/api/holdings/account/5893143322

# Get all holdings
curl http://localhost:3000/api/holdings/all
```

## Files Created
1. **Controllers:** `BackEnd/controllers/holdingsController.js`
2. **Routes:** `BackEnd/routes/holdings.js`
3. **Tests:** 
   - `BackEnd/test/test_holdings.js`
   - `BackEnd/test/check_holdings_data.js`
   - `BackEnd/test/run_holdings_test.ps1`
4. **Server Integration:** Updated `BackEnd/server.js` to include holdings routes

## Database Schema

### Holdings Table
```sql
CREATE TABLE public.holdings (
  holding_id serial PRIMARY KEY,
  demat_id integer REFERENCES demat_accounts(demat_id),
  name character varying(255) NOT NULL,
  quantity numeric(15, 2),
  bought_price numeric(15, 2),
  current_price numeric(15, 2),
  selling_price numeric(15, 2),
  selling_date date,
  status character varying(30)
);
```

### Demat Accounts Table
```sql
CREATE TABLE public.demat_accounts (
  demat_id serial PRIMARY KEY,
  customer_id integer REFERENCES customers(customer_id),
  broker_name character varying NOT NULL,
  masked_demat character varying,
  total_value numeric,
  last_synced timestamp
);
```

## Error Handling
All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common status codes:
- `200`: Success
- `400`: Bad request / Query error
- `404`: Resource not found
- `500`: Internal server error
