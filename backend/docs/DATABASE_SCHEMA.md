# Finatics.AI Database Schema Documentation

## Overview
This document provides a comprehensive overview of the Finatics.AI database architecture, including both the **Application Database** and **Banking Database** schemas, table structures, relationships, and usage patterns.

## Database Architecture
Finatics.AI uses a dual-database architecture:

1. **Application Database** (`appDb`): Handles user authentication, profiles, goals, and app-specific data
2. **Banking Database** (`bankingDb`): Manages comprehensive financial data including accounts, transactions, investments

## Application Database Structure

### Core User Tables

#### `auth_users`
Primary authentication table managed by Supabase Auth.
- **Purpose**: Stores basic user authentication information
- **Key Fields**: 
  - `id` (UUID): Primary key
  - `email`: Unique user email
  - `first_name`, `last_name`: User's name
  - `email_verified`: Email verification status
  - `profile_completed`: Profile completion status
  - `pin_created`: PIN creation status

#### `user_profiles`
Extended user profile information.
- **Purpose**: Stores detailed user profile data
- **Key Fields**:
  - `user_id` (UUID): Foreign key to auth.users
  - `phone`: Contact number
  - `date_of_birth`: User's birth date
  - `occupation`: Professional information
  - `monthly_income`: Income data
  - `financial_goals`: Array of goals
  - `secret_pin`: Encrypted PIN for app access
  - `full_name`: Complete name

#### `users`
Legacy/additional user data table.
- **Purpose**: Additional user information
- **Key Fields**:
  - `user_id` (UUID): Primary key, references auth.users
  - `full_name`: User's complete name
  - `phone`: Contact information
  - `pin_hash`: Hashed PIN

#### `user_pins`
Dedicated PIN storage table.
- **Purpose**: Secure PIN storage
- **Key Fields**:
  - `user_id` (UUID): References auth_users
  - `pin_hash`: Encrypted PIN

### Financial Data Tables

#### `linkedbankaccounts`
Bank account linking information.
- **Purpose**: Store user's linked bank accounts
- **Key Fields**:
  - `link_id` (UUID): Primary key
  - `user_id` (UUID): References users table
  - `account_number` (UUID): Bank account identifier
  - `ifsc_code`: Bank routing code
  - `account_type`: Type of account (savings, current, etc.)
  - `linked_at`: Timestamp of account linking

#### `financialgoals`
User's financial goal tracking.
- **Purpose**: Track and manage financial objectives
- **Key Fields**:
  - `goal_id` (UUID): Primary key
  - `user_id` (UUID): References users table
  - `title`: Goal name
  - `description`: Detailed description
  - `target_amount`: Target monetary value
  - `current_saved`: Current progress
  - `target_date`: Goal deadline
  - `status`: Current status (pending, active, completed)

#### `subscriptions`
Subscription and recurring payment tracking.
- **Purpose**: Monitor recurring financial commitments
- **Key Fields**:
  - `sub_id` (UUID): Primary key
  - `user_id` (UUID): References users table
  - `type`: Subscription type
  - `provider`: Service provider
  - `amount`: Payment amount
  - `frequency`: Payment frequency
  - `next_due_date`: Next payment date
  - `category`: Subscription category
  - `status`: Active/inactive status

### AI and Analytics Tables

#### `airequests`
AI service request logging.
- **Purpose**: Track AI-powered feature usage
- **Key Fields**:
  - `req_id` (UUID): Primary key
  - `user_id` (UUID): References users table
  - `request_type`: Type of AI request
  - `prompt`: User input/query
  - `response` (JSON): AI response data
  - `model`: AI model used

#### `aiinsights`
AI-generated financial insights.
- **Purpose**: Store personalized financial insights
- **Key Fields**:
  - `insight_id` (UUID): Primary key
  - `user_id` (UUID): References users table
  - `req_id` (UUID): References airequests table
  - `category`: Insight category
  - `message`: Insight content

### Notification and Alert Tables

#### `alerts`
User notification and alert system.
- **Purpose**: Manage user notifications and reminders
- **Key Fields**:
  - `alert_id` (UUID): Primary key
  - `user_id` (UUID): References users table
  - `alert_type`: Type of alert
  - `channel`: Delivery channel (email, push, etc.)
  - `message`: Alert content
  - `due_date`: When alert should be sent
  - `is_sent`: Delivery status

### Educational Content Tables

#### `financeteachercategories`
Financial education content categories.
- **Purpose**: Organize educational content
- **Key Fields**:
  - `category_id` (UUID): Primary key
  - `name`: Category name
  - `description`: Category description

#### `financeteachervideos`
Educational video content.
- **Purpose**: Store financial education videos
- **Key Fields**:
  - `video_id` (UUID): Primary key
  - `category_id` (UUID): References financeteachercategories
  - `title`: Video title
  - `description`: Video description
  - `media_url`: Video file location
  - `duration`: Video length

## Banking Database Structure

### Core Financial Tables

#### `customers`
Customer information in the banking system.

- **Purpose**: Store comprehensive customer data for banking operations
- **Key Fields**:
  - `customer_id` (integer): Primary key
  - `full_name`: Customer's complete name
  - `email`: Contact email (links to app database)
  - `phone`: Contact number (links to app database)
  - `address`: Physical address
  - `dob`: Date of birth
  - `aadhar_number`: Government ID
  - `pan_number`: Tax ID
  - `credit_score`: Credit rating

#### `bank_accounts`
Bank account information and details.

- **Purpose**: Store comprehensive bank account data
- **Key Fields**:
  - `account_id` (integer): Primary key
  - `customer_id`: References customers table
  - `bank_name`: Name of the bank
  - `masked_account`: Masked account number for display
  - `account_number`: Full account number (unique)
  - `ifsc_code`: Bank routing code
  - `account_type`: Type of account (savings, current, etc.)
  - `account_holder`: Account holder name
  - `currency`: Account currency
  - `balance`: Current account balance
  - `status`: Account status (active, inactive, closed)

#### `transactions`
Transaction history and details.

- **Purpose**: Track all financial transactions
- **Key Fields**:
  - `txn_id` (integer): Primary key
  - `account_id`: References bank_accounts table
  - `txn_date`: Transaction timestamp
  - `amount`: Transaction amount
  - `txn_type`: Type of transaction (credit, debit, transfer)
  - `description`: Transaction description
  - `category`: Transaction category
  - `balance_after`: Account balance after transaction

#### `card_details`
Credit/Debit card information.

- **Purpose**: Manage card-related data
- **Key Fields**:
  - `card_id` (integer): Primary key
  - `account_id`: References bank_accounts table
  - `card_type`: Type of card (credit, debit)
  - `card_number`: Card number (unique)
  - `card_network`: Card network (Visa, Mastercard, etc.)
  - `expiry_date`: Card expiration date
  - `status`: Card status

### Investment Tables

#### `demat_accounts`
Demat account information for stock trading.

- **Purpose**: Store demat account details for investment tracking
- **Key Fields**:
  - `demat_id` (integer): Primary key
  - `customer_id`: References customers table
  - `broker_name`: Stock broker name
  - `masked_demat`: Masked demat account number
  - `total_value`: Total portfolio value
  - `last_synced`: Last synchronization timestamp

#### `holdings`
Stock holdings and portfolio information.

- **Purpose**: Track individual stock holdings
- **Key Fields**:
  - `holding_id` (integer): Primary key
  - `demat_id`: References demat_accounts table
  - `name`: Stock/security name
  - `quantity`: Number of shares
  - `bought_price`: Purchase price
  - `current_price`: Current market price
  - `selling_price`: Sale price (if sold)
  - `status`: Holding status

#### `mutual_funds`
Mutual fund investments.

- **Purpose**: Track mutual fund investments
- **Key Fields**:
  - `mf_id` (integer): Primary key
  - `customer_id`: References customers table
  - `fund_name`: Mutual fund name
  - `fund_type`: Type of fund
  - `units`: Number of units held
  - `nav`: Net Asset Value
  - `invested_amount`: Total invested amount
  - `current_value`: Current portfolio value

#### `sips`
Systematic Investment Plans.

- **Purpose**: Manage SIP investments
- **Key Fields**:
  - `sip_id` (integer): Primary key
  - `mf_id`: References mutual_funds table
  - `customer_id`: References customers table
  - `amount`: SIP amount
  - `frequency`: Investment frequency
  - `start_date`: SIP start date
  - `end_date`: SIP end date

#### `swps`
Systematic Withdrawal Plans.

- **Purpose**: Manage SWP withdrawals
- **Key Fields**:
  - `swp_id` (integer): Primary key
  - `mf_id`: References mutual_funds table
  - `customer_id`: References customers table
  - `amount`: Withdrawal amount
  - `frequency`: Withdrawal frequency

### Lending Tables

#### `loans`
Loan information and management.

- **Purpose**: Track loan details and repayments
- **Key Fields**:
  - `loan_id` (integer): Primary key
  - `customer_id`: References customers table
  - `account_id`: References bank_accounts table
  - `loan_type`: Type of loan (personal, home, auto, etc.)
  - `principal`: Loan principal amount
  - `interest_rate`: Interest rate
  - `tenure_months`: Loan tenure in months
  - `emi_amount`: EMI amount
  - `outstanding_amount`: Remaining loan amount

#### `fixed_deposits`
Fixed deposit investments.

- **Purpose**: Manage fixed deposit investments
- **Key Fields**:
  - `fd_id` (integer): Primary key
  - `customer_id`: References customers table
  - `account_id`: References bank_accounts table
  - `deposit_amount`: FD amount
  - `interest_rate`: Interest rate
  - `tenure_months`: FD tenure
  - `start_date`: FD start date
  - `maturity_date`: FD maturity date
  - `maturity_amount`: Amount at maturity

## Key Relationships

### Application Database Relationships

1. **User Authentication Flow**:
   - `auth_users` → `user_profiles` (1:1)
   - `auth_users` → `user_pins` (1:1)
   - `auth_users` → `users` (1:1)

2. **Financial Data**:
   - `users` → `linkedbankaccounts` (1:many)
   - `users` → `financialgoals` (1:many)
   - `users` → `subscriptions` (1:many)

3. **AI Features**:
   - `users` → `airequests` (1:many)
   - `airequests` → `aiinsights` (1:many)

4. **Educational Content**:
   - `financeteachercategories` → `financeteachervideos` (1:many)

### Banking Database Relationships

1. **Customer-Centric Structure**:
   - `customers` → `bank_accounts` (1:many)
   - `customers` → `demat_accounts` (1:many)
   - `customers` → `mutual_funds` (1:many)
   - `customers` → `loans` (1:many)
   - `customers` → `fixed_deposits` (1:many)

2. **Account-Based Transactions**:
   - `bank_accounts` → `transactions` (1:many)
   - `bank_accounts` → `card_details` (1:many)
   - `bank_accounts` → `loans` (1:many)
   - `bank_accounts` → `fixed_deposits` (1:many)

3. **Investment Relationships**:
   - `demat_accounts` → `holdings` (1:many)
   - `mutual_funds` → `sips` (1:many)
   - `mutual_funds` → `swps` (1:many)

### Cross-Database Relationships

1. **User Linking**:
   - Application `auth_users.email` ↔ Banking `customers.email`
   - Application `user_profiles.phone` ↔ Banking `customers.phone`

2. **Account Integration**:
   - Application `linkedbankaccounts` references Banking `bank_accounts` via account_number
   - Data synchronization between both databases for user financial overview

## Usage Notes

### Security Considerations
- All PINs are stored as hashes, never plain text
- UUID primary keys provide better security than sequential IDs
- Foreign key constraints ensure data integrity

### Performance Considerations
- Indexes should be added on frequently queried fields
- Consider partitioning large tables by user_id or date
- JSON fields in airequests.response may need specialized indexing

### Data Migration
- Multiple user tables exist for historical reasons
- New implementations should primarily use `auth_users` and `user_profiles`
- Legacy `users` table maintained for backward compatibility

## API Integration Points

### Application Database APIs

#### Bank Account Management
- Primary table: `linkedbankaccounts`
- API endpoints: `/api/add-account`, `/api/get-accounts`, `/api/remove-account`

#### User Profile Management
- Primary table: `user_profiles`
- Secondary: `user_pins` for PIN operations
- API endpoints: `/api/profile`, `/api/verify-pin`

#### Financial Goals
- Primary table: `financialgoals`
- Integration with dashboard analytics

#### AI Features
- Tables: `airequests`, `aiinsights`
- Real-time response generation and storage

### Banking Database APIs

#### Account Information
- Primary table: `bank_accounts`
- Related: `customers`, `transactions`
- API endpoints: `/api/banking/accounts`, `/api/banking/balance`

#### Transaction History
- Primary table: `transactions`
- API endpoints: `/api/banking/transactions`, `/api/banking/statements`

#### Investment Portfolio
- Tables: `demat_accounts`, `holdings`, `mutual_funds`
- API endpoints: `/api/banking/portfolio`, `/api/banking/holdings`

#### Loan Management
- Primary table: `loans`
- API endpoints: `/api/banking/loans`, `/api/banking/emi`

#### Card Services
- Primary table: `card_details`
- API endpoints: `/api/banking/cards`, `/api/banking/card-transactions`

### Data Synchronization
- Cross-database sync for user linking via email/phone
- Real-time balance updates from banking to application database
- Investment data aggregation for dashboard display