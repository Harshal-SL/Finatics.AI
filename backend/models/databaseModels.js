/**
 * Database Models and Schema Definitions
 * Reference documentation for Banking DB and Application DB table structures
 * Used by Supabase for data operations in the Dashboard API
 */

/**
 * Banking Database Tables
 * Actual structure based on the provided Banking DB design
 * Contains comprehensive financial data across multiple entities
 */
const BankingDBModels = {
  // Customer information
  Customers: {
    customer_id: 'int (Primary Key)',
    full_name: 'varchar(255)',
    email: 'varchar(255)',
    phone: 'varchar(20)',
    address: 'text',
    dob: 'date',
    aadhaar_number: 'varchar(20)',
    pan_number: 'varchar(20)',
    credit_score: 'decimal(5,2)',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },

  // Bank account information
  BankAccounts: {
    account_id: 'int (Primary Key)',
    customer_id: 'int (Foreign Key)',
    bank_name: 'varchar(100)',
    account_number: 'varchar(20)',
    account_type: 'varchar(50)',
    ifsc_code: 'varchar(20)',
    account_holder: 'varchar(255)',
    opening: 'varchar(20)',
    balance: 'decimal(15,2)',
    status: 'varchar(20)',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },

  // Demand account details
  DemandAccounts: {
    demand_id: 'int (Primary Key)',
    customer_id: 'int (Foreign Key)',
    facility_name: 'varchar(255)',
    principal_amount: 'decimal(15,2)',
    initial_value: 'decimal(15,2)',
    fav_symbol: 'varchar(10)',
    created_at: 'timestamp'
  },

  // Certificate of deposits
  CertificateOfDeposits: {
    cd_id: 'int (Primary Key)',
    account_id: 'int (Foreign Key)',
    cd_type: 'varchar(50)',
    cd_number: 'varchar(50)',
    cd_amount: 'decimal(15,2)',
    cd_maturity: 'date',
    cd_rate: 'decimal(5,2)',
    penalty_cd: 'decimal(15,2)',
    opening_cd: 'date',
    created_at: 'timestamp'
  },

  // Transaction records
  Transactions: {
    transaction_id: 'int (Primary Key)',
    account_id: 'int (Foreign Key)',
    trf_date: 'date',
    trf_type: 'varchar(50)',
    category: 'varchar(100)',
    merchant: 'varchar(255)',
    description: 'text',
    created_at: 'timestamp'
  },

  // Loan information
  Loans: {
    loan_id: 'int (Primary Key)',
    customer_id: 'int (Foreign Key)',
    amount_id: 'int (Foreign Key)',
    principal: 'decimal(15,2)',
    interest_rate: 'decimal(5,4)',
    loan_months: 'int',
    outstanding_amount: 'decimal(15,2)',
    status: 'varchar(20)',
    start_date: 'date',
    maturity_date: 'date',
    member_name: 'varchar(255)',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },

  // Fixed deposits
  FixedDeposits: {
    fd_id: 'int (Primary Key)',
    customer_id: 'int (Foreign Key)',
    account_id: 'int (Foreign Key)',
    principal_amount: 'decimal(15,2)',
    interest_rate: 'decimal(5,4)',
    tenure_months: 'int',
    maturity_amount: 'decimal(15,2)',
    status: 'varchar(20)',
    created_at: 'timestamp'
  },

  // Stock holdings
  Holdings: {
    holding_id: 'int (Primary Key)',
    customer_id: 'int (Foreign Key)',
    symbol: 'varchar(20)',
    name: 'varchar(255)',
    shares: 'int',
    bought_price: 'decimal(10,4)',
    current_price: 'decimal(10,4)',
    status: 'varchar(20)',
    created_at: 'timestamp'
  },

  // Mutual funds
  MutualFunds: {
    mf_id: 'int (Primary Key)',
    customer_id: 'int (Foreign Key)',
    fund_name: 'varchar(255)',
    units: 'decimal(12,4)',
    nav: 'decimal(10,4)',
    invested_amount: 'decimal(15,2)',
    current_value: 'decimal(15,2)',
    status: 'varchar(20)',
    created_at: 'timestamp'
  },

  // SIPs (Systematic Investment Plans)
  SIPs: {
    sip_id: 'int (Primary Key)',
    customer_id: 'int (Foreign Key)',
    avg_id: 'int',
    investment_id: 'int',
    amount: 'decimal(15,2)',
    frequency: 'varchar(20)',
    created_at: 'timestamp'
  }
};

/**
 * Application Database Tables  
 * Actual structure based on the provided Application DB design
 * Contains user management, security, AI features, financial goals, and educational content
 */
const ApplicationDBModels = {
  // Core user information
  Users: {
    user_id: 'uuid (Primary Key)',
    full_name: 'text',
    email: 'text (Unique)',
    password_hash: 'text',
    phone: 'text',
    created_at: 'datetime'
  },

  // User security and authentication
  UserSecurity: {
    user_id: 'uuid (Primary Key, Foreign Key)',
    pin_hash: 'text',
    two_factor: 'boolean',
    failed_attempts: 'int',
    locked_until: 'datetime'
  },

  // AI-powered insights and analytics
  AIInsights: {
    insight_id: 'uuid (Primary Key)',
    user_id: 'uuid (Foreign Key)',
    req_id: 'uuid',
    category: 'text',
    message: 'text',
    created_at: 'datetime'
  },

  // AI request tracking
  AIRequests: {
    req_id: 'uuid (Primary Key)',
    user_id: 'uuid (Foreign Key)',
    request_type: 'text',
    prompt: 'text',
    response: 'json',
    model: 'text',
    created_at: 'datetime'
  },

  // User's linked bank accounts
  LinkedBankAccounts: {
    link_id: 'uuid (Primary Key)',
    user_id: 'uuid (Foreign Key)',
    account_ref_id: 'uuid',
    linked_at: 'datetime'
  },

  // Financial goals and targets
  FinancialGoals: {
    goal_id: 'uuid (Primary Key)',
    user_id: 'uuid (Foreign Key)',
    title: 'text',
    description: 'text',
    target_amount: 'numeric',
    current_saved: 'numeric',
    target_date: 'date',
    status: 'text',
    created_at: 'datetime'
  },

  // Finance education categories
  FinanceTeacherCategories: {
    category_id: 'uuid (Primary Key)',
    name: 'text',
    description: 'text'
  },

  // Finance education videos
  FinanceTeacherVideos: {
    video_id: 'uuid (Primary Key)',
    category_id: 'uuid (Foreign Key)',
    title: 'text',
    description: 'text',
    media_url: 'text',
    duration: 'text',
    created_at: 'datetime'
  },

  // User subscriptions
  Subscriptions: {
    sub_id: 'uuid (Primary Key)',
    user_id: 'uuid (Foreign Key)',
    type: 'text',
    provider: 'text',
    amount: 'numeric',
    frequency: 'text',
    next_due_date: 'date',
    category: 'text',
    status: 'text',
    created_at: 'datetime'
  },

  // User alerts and notifications
  Alerts: {
    alert_id: 'uuid (Primary Key)',
    user_id: 'uuid (Foreign Key)',
    alert_type: 'text',
    channel: 'text',
    message: 'text',
    due_date: 'datetime',
    is_sent: 'boolean',
    created_at: 'datetime'
  }
};

module.exports = {
  BankingDBModels,
  ApplicationDBModels
};