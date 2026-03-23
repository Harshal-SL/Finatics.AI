
## Overview
The Goals API provides comprehensive financial goal management with AI-powered analysis. It allows users to create, retrieve, update, and delete financial goals while providing intelligent investment recommendations based on their financial profile.

## Base URL
```
http://localhost:3000/api/goals
```

---

## Endpoints

### 1. Get User Goals
Retrieve all financial goals for a specific user.

**Endpoint:** `GET /api/goals`

**Query Parameters:**
- `userId` (required): User's UUID

**Example Request:**
```bash
GET /api/goals?userId=6b867f4e-6461-416e-8f6c-13ae8e177070
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Found 3 goals",
  "data": [
    {
      "goal_id": "14f58df7-af32-46d2-954c-01eaf367d5b1",
      "user_id": "6b867f4e-6461-416e-8f6c-13ae8e177070",
      "title": "Buy a New Laptop",
      "description": "Saving to buy a high-performance laptop",
      "target_amount": 120000,
      "current_saved": 25000,
      "target_date": "2026-03-01",
      "status": "in-progress",
      "created_at": "2025-10-24T22:05:56.691339+00:00"
    }
  ]
}
```

---

### 2. Analyze and Save Goal
Analyze a financial goal using AI and optionally save it to the database.

**Endpoint:** `POST /api/goals`

**Request Body:**
```json
{
  "userId": "6b867f4e-6461-416e-8f6c-13ae8e177070",
  "title": "Buy a Car",
  "description": "Save for a new car purchase",
  "targetAmount": 500000,
  "targetDate": "2027-12-31",
  "riskTolerance": "Medium",
  "saveToDatabase": true
}
```

**Field Descriptions:**
- `userId` (required): User's UUID
- `targetAmount` (required): Target amount in INR (must be positive number)
- `targetDate` (required): Target date in YYYY-MM-DD format (must be future date)
- `title` (optional): Goal title (auto-generated if not provided)
- `description` (optional): Goal description (auto-generated if not provided)
- `riskTolerance` (optional): "Low", "Medium", or "High" (default: "Medium")
- `saveToDatabase` (optional): Boolean to save goal to database (default: true)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Goal analysis completed successfully",
  "data": {
    "userMetrics": {
      "monthlyIncome": 165380,
      "monthlyExpenses": 130260.46,
      "monthlySavings": 35119.54,
      "creditScore": 776.66
    },
    "goalAnalysis": {
      "disclaimer": "This is an AI-generated analysis...",
      "goalAnalysis": {
        "targetAmount": "₹5,00,000",
        "currentSavings": "₹0",
        "goalGap": "₹5,00,000",
        "timeHorizonMonths": "27"
      },
      "baselineSavingsProjection": {
        "projectedValue": "₹9,48,228",
        "isGoalMet": true,
        "summary": "This is the projected value if you only save..."
      },
      "riskBasedPlans": {
        "lowRiskPlan": {
          "planName": "Low Risk (Conservative)",
          "assumedCAGR": "8%",
          "actionPlan": {
            "requiredMonthlySIP": "₹16,907",
            "savingsShortfallOrSurplus": "₹18,212",
            "analysisSummary": "Great news! Your current monthly savings..."
          },
          "investmentStrategy": {
            "recommendedPortfolio": [
              {
                "category": "Large-Cap Index Fund (Nifty 50)",
                "allocationPercent": 100,
                "reasoning": "Provides stable growth..."
              }
            ]
          }
        },
        "mediumRiskPlan": { /* ... */ },
        "highRiskPlan": { /* ... */ }
      }
    },
    "savedGoal": {
      "goal_id": "bc58b513-a3af-4fdb-a619-aa02fd662009",
      "user_id": "6b867f4e-6461-416e-8f6c-13ae8e177070",
      "title": "Buy a Car",
      "description": "Save for a new car purchase",
      "target_amount": 500000,
      "current_saved": 0,
      "target_date": "2027-12-31",
      "status": "active",
      "created_at": "2025-10-24T22:53:58.29791+00:00"
    }
  }
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "success": false,
  "message": "Missing required fields: userId, targetAmount, targetDate are required"
}
```

```json
{
  "success": false,
  "message": "targetAmount must be a positive number"
}
```

```json
{
  "success": false,
  "message": "targetDate must be in YYYY-MM-DD format",
  "example": "2030-12-31"
}
```

```json
{
  "success": false,
  "message": "targetDate must be in the future"
}
```

```json
{
  "success": false,
  "message": "riskTolerance must be one of: Low, Medium, High"
}
```

---

### 3. Update Goal Progress
Update the current savings or status of an existing goal.

**Endpoint:** `PUT /api/goals/:goalId`

**URL Parameters:**
- `goalId`: Goal's UUID

**Request Body:**
```json
{
  "currentSaved": 50000,
  "status": "active"
}
```

**Field Descriptions:**
- `currentSaved` (optional): Updated amount saved
- `status` (optional): Goal status ("pending", "active", "completed")

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Goal updated successfully",
  "data": {
    "goal_id": "bc58b513-a3af-4fdb-a619-aa02fd662009",
    "user_id": "6b867f4e-6461-416e-8f6c-13ae8e177070",
    "title": "Buy a Car",
    "target_amount": 500000,
    "current_saved": 50000,
    "status": "active",
    "target_date": "2027-12-31",
    "created_at": "2025-10-24T22:53:58.29791+00:00"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Goal not found"
}
```

---

### 4. Delete Goal
Delete an existing goal.

**Endpoint:** `DELETE /api/goals/:goalId`

**URL Parameters:**
- `goalId`: Goal's UUID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Goal deleted successfully"
}
```

---

## Risk-Based Plans

The API provides three investment strategies based on risk tolerance:

### Low Risk (Conservative)
- **Assumed CAGR:** 8%
- **Portfolio:** 100% Large-Cap Index Fund (Nifty 50)
- **Best for:** Conservative investors seeking stable returns

### Medium Risk (Balanced)
- **Assumed CAGR:** 10%
- **Portfolio:** 
  - 60% Large-Cap Index Fund
  - 40% Flexi-Cap Fund
- **Best for:** Balanced investors seeking moderate growth

### High Risk (Aggressive)
- **Assumed CAGR:** 12%
- **Portfolio:**
  - 50% Flexi-Cap Fund
  - 50% Mid-Cap Fund
- **Best for:** Aggressive investors with long-term horizon

---

## Database Schema

### financialgoals Table
```sql
CREATE TABLE public.financialgoals (
  goal_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(user_id),
  title text NOT NULL,
  description text,
  target_amount numeric,
  current_saved numeric DEFAULT 0,
  target_date date,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);
```

---

## Testing

Run the comprehensive test suite:
```bash
cd BackEnd
node test/test_goals_endpoint.js
```

The test suite covers:
1. ✅ Get User Goals
2. ✅ Analyze and Save Goal
3. ✅ Update Goal Progress
4. ✅ Delete Goal

---

## Error Handling

All endpoints return standardized error responses:

**Format:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

1. **AI Analysis**: Uses Google Gemini AI with local fallback if API fails
2. **Auto-save**: Goals are automatically saved to database unless `saveToDatabase: false`
3. **User Metrics**: Calculated from user's transaction history
4. **Goal Status**: Can be "pending", "active", or "completed"
5. **Currency**: All amounts in Indian Rupees (INR)
