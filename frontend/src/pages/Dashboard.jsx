import { BentoGrid } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/ui/particles";
import Navbar from "@/components/layout/Navbar";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  CreditCard, 
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  MoreHorizontal,
  Building2,
  ChevronRight,
  Home,
  Wallet,
  LineChart as LineChartIcon,
  Target,
  BookOpen,
  MessageSquare,
  LogOut,
  Calculator
} from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [investmentData, setInvestmentData] = useState(null);
  const [isLoadingInvestments, setIsLoadingInvestments] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  
  // Navigation items for navbar
  const navItems = [
    { name: "Dashboard", url: "/dashboard", icon: Home },
    { name: "Investments", url: "/stocks", icon: LineChartIcon },
    { name: "Goals", url: "/goals", icon: Target },
    { name: "Loan Analyzer", url: "/loan-analyzer", icon: Calculator },
    { name: "Learn", url: "/learn", icon: BookOpen },
  ];

  // Logout handler
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  
  // Developer tools detection - DISABLED
  // useEffect(() => {
  //   const detectDevTools = () => {
  //     if (
  //       window.outerHeight - window.innerHeight > 200 || 
  //       window.outerWidth - window.innerWidth > 200
  //     ) {
  //       document.body.innerHTML = 'Access Denied';
  //       window.location.href = '/access-denied';
  //     }
  //   };

  //   window.addEventListener('resize', detectDevTools);
  //   return () => window.removeEventListener('resize', detectDevTools);
  // }, []);
  
  // Check if user has bank accounts (from dashboard data OR bank accounts list)
  const hasBankAccounts = (dashboardData?.linked_accounts_count > 0) || (bankAccounts.length > 0);

  console.log('Dashboard State:', {
    userId: user?.id,
    isLoadingAccounts,
    isLoadingDashboard,
    bankAccountsCount: bankAccounts.length,
    linkedAccountsCount: dashboardData?.linked_accounts_count,
    hasBankAccounts,
    accountBalance: dashboardData?.account_balance,
    monthlyExpenses: dashboardData?.monthly_expenses
  });

  // Fetch all data in parallel for better performance
  useEffect(() => {
    const fetchAllData = async () => {
      if (!user?.id) {
        console.log('Dashboard: No user ID, skipping fetch');
        return;
      }
      
      console.log('Dashboard: Starting data fetch for user:', user.id);
      
      try {
        // Fetch all 3 APIs in parallel using Promise.all
        console.log('Dashboard: Fetching from 3 APIs...');
        const [bankAccountsRes, dashboardRes, investmentRes, holdingsRes] = await Promise.all([
          fetch(`http://localhost:3000/api/bank-accounts/${user.id}`),
          fetch(`http://localhost:3000/api/dashboard?userId=${user.id}`),
          fetch(`http://localhost:3000/api/investments?userId=${user.id}`),
          fetch(`http://localhost:3000/api/holdings/user/${user.id}`)
        ]);

        console.log('Dashboard: API responses received', {
          bankAccounts: bankAccountsRes.status,
          dashboard: dashboardRes.status,
          investments: investmentRes.status,
          holdings: holdingsRes.status
        });

        // Check for HTTP errors
        if (!bankAccountsRes.ok) {
          console.error('Bank accounts API error:', bankAccountsRes.status);
        }
        if (!dashboardRes.ok) {
          console.error('Dashboard API error:', dashboardRes.status);
        }
        if (!investmentRes.ok) {
          console.error('Investments API error:', investmentRes.status);
        }
        if (!holdingsRes.ok) {
          console.error('Holdings API error:', holdingsRes.status);
        }

        // Parse all responses in parallel
        console.log('Dashboard: Parsing JSON responses...');
        const [bankAccountsData, dashboardData, investmentsData, holdingsData] = await Promise.all([
          bankAccountsRes.json(),
          dashboardRes.json(),
          investmentRes.json(),
          holdingsRes.json()
        ]);

        console.log('Dashboard: Data parsed successfully', {
          bankAccountsSuccess: bankAccountsData.success,
          dashboardSuccess: dashboardData.success,
          investmentSuccess: investmentsData.success,
          holdingsSuccess: holdingsData.success
        });

        // Set bank accounts
        if (bankAccountsData.success) {
          console.log('Dashboard: Setting bank accounts', bankAccountsData.data?.length || 0, 'accounts');
          setBankAccounts(bankAccountsData.data || []);
        } else {
          console.error('Failed to fetch bank accounts:', bankAccountsData.error);
        }

        // Set dashboard data
        if (dashboardData.success) {
          console.log('Dashboard: Setting dashboard data', {
            balance: dashboardData.data?.account_balance,
            linkedAccounts: dashboardData.data?.linked_accounts_count
          });
          setDashboardData(dashboardData.data);
        } else {
          console.error('Failed to fetch dashboard data:', dashboardData.error);
        }

        // Set investment data
        if (investmentsData.success) {
          console.log('✅ Dashboard: Setting investment data', {
            total: investmentsData.data?.totalInvestments,
            stocks: investmentsData.data?.stocks?.totalValue,
            mutualFunds: investmentsData.data?.mutualFunds?.totalValue,
            fixedDeposits: investmentsData.data?.fixedDeposits?.totalValue,
            fullData: investmentsData.data
          });
          setInvestmentData(investmentsData.data);
          console.log('✅ Investment data state set, should re-render now');
        } else {
          console.error('❌ Failed to fetch investment data:', investmentsData.error);
        }

        // Extract customer name from holdings data (same as Stocks page)
        if (holdingsData.success && holdingsData.data?.customer?.full_name) {
          setUserProfile({ full_name: holdingsData.data.customer.full_name });
          console.log('Dashboard: Customer name from holdings:', holdingsData.data.customer.full_name);
        }

        console.log('Dashboard: All data set successfully');

      } catch (error) {
        console.error('🚨 Dashboard: CRITICAL ERROR in fetchAllData:', error);
        console.error('Error stack:', error.stack);
      } finally {
        console.log('Dashboard: Fetch complete, setting loading states to false');
        setIsLoadingAccounts(false);
        setIsLoadingDashboard(false);
        setIsLoadingInvestments(false);
      }
    };

    fetchAllData();
  }, [user?.id]);
  
  // Use real data from API or default to 0
  const accountData = {
    balance: dashboardData?.account_balance || 0,
    monthlyExpenses: dashboardData?.monthly_expenses || 0,
    monthlySavings: dashboardData?.monthly_savings || 0,
    monthlyIncome: dashboardData?.monthly_savings_summary?.income || 0,
    mutualFunds: investmentData?.mutualFunds?.totalValue || 0,
    stocks: investmentData?.stocks?.totalValue || 0,
    totalInvestments: investmentData?.totalInvestments || 0
  };

  console.log('🔍 Dashboard Render - accountData composition:', {
    investmentDataExists: !!investmentData,
    investmentData_totalInvestments: investmentData?.totalInvestments,
    investmentData_stocks: investmentData?.stocks?.totalValue,
    investmentData_mutualFunds: investmentData?.mutualFunds?.totalValue,
    investmentData_fixedDeposits: investmentData?.fixedDeposits?.totalValue,
    accountData_totalInvestments: accountData.totalInvestments,
    accountData_stocks: accountData.stocks,
    accountData_mutualFunds: accountData.mutualFunds,
    accountData_monthlyExpenses: accountData.monthlyExpenses,
    accountData_monthlySavings: accountData.monthlySavings,
    accountData_monthlyIncome: accountData.monthlyIncome,
    dashboardData_summary: dashboardData?.monthly_savings_summary,
    isLoadingInvestments,
    isLoadingAccounts,
    isLoadingDashboard
  });

  // Use real transactions from API or empty array
  const recentTransactions = dashboardData?.recent_transactions?.map(txn => ({
    id: txn.txn_id,
    description: txn.description,
    amount: txn.txn_type === 'Debit' ? -txn.amount : txn.amount,
    date: new Date(txn.txn_date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    category: txn.category,
    type: txn.txn_type === 'Debit' ? 'expense' : 'income'
  })) || [];

  // Use real 6-month trend data from API or default mock data
  let monthlyData = dashboardData?.six_month_trend || [
    { month: "Jan", income: 3500, expenses: 2800 },
    { month: "Feb", income: 3500, expenses: 2600 },
    { month: "Mar", income: 3700, expenses: 2900 },
    { month: "Apr", income: 3500, expenses: 2340 },
    { month: "May", income: 3800, expenses: 2450 },
    { month: "Jun", income: 3600, expenses: 2680 },
  ];

  // Add current month's actual data to the chart if we have it
  if (dashboardData?.monthly_savings_summary) {
    const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'short' });
    const currentMonthData = {
      month: `${currentMonthName} (Current)`,
      income: dashboardData.monthly_savings_summary.income || 0,
      expenses: dashboardData.monthly_savings_summary.expenses || 0
    };
    
    // Replace last item or add if using mock data
    if (monthlyData.length > 0) {
      monthlyData = [...monthlyData.slice(0, -1), currentMonthData];
    } else {
      monthlyData = [currentMonthData];
    }
  }

  // Use real expense categories from API or default mock data
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#14b8a6', // teal
  ];
  
  const defaultExpenseCategories = [
    { name: 'Housing', value: 1200 },
    { name: 'Food', value: 450 },
    { name: 'Transportation', value: 320 },
    { name: 'Entertainment', value: 180 },
    { name: 'Utilities', value: 190 }
  ];

  const rawExpenseCategories = dashboardData?.expense_categories;
  const expenseCategoriesSource = Array.isArray(rawExpenseCategories) && rawExpenseCategories.length > 0
    ? rawExpenseCategories
    : defaultExpenseCategories;

  const expenseCategories = expenseCategoriesSource.map((cat, index) => ({
    ...cat,
    color: colors[index % colors.length]
  }));

  const formatCurrencyINR = (value, { includePlus = false } = {}) => {
    const numericValue = typeof value === 'number' ? value : Number(value) || 0;
    const absoluteFormatted = Math.abs(numericValue).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (numericValue > 0 && includePlus) {
      return `+₹${absoluteFormatted}`;
    }

    const sign = numericValue < 0 ? '-' : '';
    return `${sign}₹${absoluteFormatted}`;
  };

  // Safety check - if something is critically wrong, show error UI
  if (!user) {
    console.error('Dashboard: No user found in context!');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Authentication Error</h1>
          <p className="text-muted-foreground">No user session found. Please log in again.</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  console.log('Dashboard: About to render, all checks passed');

  return (
    <div className="min-h-screen bg-background relative">
      {/* Particles Background */}
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color="#ffffff"
        refresh={false}
      />

      {/* Navbar */}
      <Navbar items={navItems} className="" showLogo={true} />
      
      {/* Logout Button - Fixed top right */}
      <button
        onClick={handleLogout}
        className="fixed top-8 right-8 flex items-center gap-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 rounded-full text-destructive hover:text-destructive transition-all duration-200 backdrop-blur-lg"
        style={{ zIndex: 9999 }}
      >
        <LogOut size={18} />
        <span className="hidden sm:inline">Logout</span>
      </button>
      
      <main 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative pt-24" 
        style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
      >
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {userProfile?.full_name || 'Test User'}!
          </h1>
          <p className="text-white">Here's your financial overview</p>
        </div>

        {/* New User Welcome Card - Show if no bank accounts */}
        {!hasBankAccounts && (
          <div 
            className="mb-8 p-6 rounded-xl border border-white/10 bg-gradient-to-r from-primary/10 via-success/10 to-primary/5 backdrop-blur-lg shadow-lg"
            style={{ 
              position: 'relative', 
              zIndex: 1001, 
              pointerEvents: 'auto'
            }}
          >
            <div 
              className="flex flex-col md:flex-row items-start md:items-start justify-between gap-4" 
              style={{ 
                position: 'relative', 
                zIndex: 1003, 
                pointerEvents: 'auto' 
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Connect Your Bank Account
                  </h3>
                  <p className="text-muted-foreground">
                    Get started by connecting your bank account to track expenses and get personalized insights
                  </p>
                </div>
              </div>
              <Button
                variant="solid"
                size="default"
                className="font-semibold flex items-center gap-2 shrink-0"
                onClick={() => {
                  console.log('Button clicked!');
                  navigate('/add-bank-account');
                }}
              >
                <Plus className="w-4 h-4" />
                Add Bank Account
              </Button>
            </div>
          </div>
        )}

        {/* Account Overview Cards */}
        <BentoGrid 
          className="grid-cols-1 md:grid-cols-4"
          items={[
            {
              title: "Account Balance",
              description: hasBankAccounts 
                ? `₹${accountData.balance.toLocaleString('en-IN')}` 
                : '₹0.00',
              icon: <DollarSign className="h-4 w-4 text-primary" />,
              status: hasBankAccounts ? "+2.5% from last month" : "Connect bank account",
              meta: hasBankAccounts ? "" : "",
              hasPersistentHover: hasBankAccounts,
              colSpan: 1
            },
            {
              title: "Monthly Expenses",
              description: hasBankAccounts 
                ? `₹${accountData.monthlyExpenses.toLocaleString('en-IN')}` 
                : '₹0.00',
              icon: <CreditCard className="h-4 w-4 text-destructive" />,
              status: hasBankAccounts ? "-5.2% from last month" : "Connect to track",
              colSpan: 1
            },
            {
              title: "Monthly Savings",
              description: hasBankAccounts 
                ? `₹${Math.abs(accountData.monthlySavings).toLocaleString('en-IN')}${accountData.monthlySavings < 0 ? ' (deficit)' : ''}` 
                : '₹0.00',
              icon: <PiggyBank className="h-4 w-4 text-success" />,
              status: hasBankAccounts 
                ? accountData.monthlySavings >= 0 
                  ? `Income: ₹${accountData.monthlyIncome.toLocaleString('en-IN')} - Expenses: ₹${accountData.monthlyExpenses.toLocaleString('en-IN')}`
                  : `⚠️ Spending exceeds income by ₹${Math.abs(accountData.monthlySavings).toLocaleString('en-IN')}`
                : "Connect to track",
              hasPersistentHover: hasBankAccounts,
              colSpan: 1
            },
            {
              title: "Investments",
              description: hasBankAccounts 
                ? `₹${(accountData.mutualFunds + accountData.stocks).toLocaleString('en-IN')}`
                : '₹0.00',
              icon: <TrendingUp className="h-4 w-4 text-success" />,
              status: hasBankAccounts ? "+12.3% this month" : "Connect to track",
              colSpan: 1
            }
          ]}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Income vs Expenses Chart */}
            <div className="p-6 rounded-xl border border-white/10 bg-card/70 backdrop-blur-lg shadow-lg">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-foreground">Income vs Expenses</h3>
                <p className="text-sm text-muted-foreground">6-month financial trend</p>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={3}
                      name="Income"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={3}
                      name="Expenses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Categories Chart */}
            <div className="p-6 rounded-xl border border-white/10 bg-card/70 backdrop-blur-lg shadow-lg">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white">Expense Categories</h3>
                <p className="text-sm text-white">Current month breakdown</p>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`₹${value.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'Amount']}
                        contentStyle={{ 
                          backgroundColor: '#111827',
                          border: '1px solid rgba(148, 163, 184, 0.6)',
                          borderRadius: '10px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
                          color: '#f8fafc'
                        }}
                        labelStyle={{ color: '#f8fafc', fontWeight: 600 }}
                        itemStyle={{ color: '#e2e8f0', fontWeight: 500 }}
                        wrapperStyle={{ zIndex: 1100 }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            {/* Recent Transactions */}
            <div className="p-6 rounded-xl border border-white/10 bg-card/70 backdrop-blur-lg shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Recent Transactions</h3>
                  <p className="text-sm text-muted-foreground">Your latest financial activities</p>
                </div>
                <Button
                  variant="solid"
                  size="default"
                  className="font-semibold flex items-center gap-2"
                  onClick={() => navigate('/transactions')}
                >
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </Button>
              </div>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' 
                          ? 'bg-success/20 text-success' 
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.category} • {transaction.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${
                        transaction.type === 'income' ? 'text-success' : 'text-foreground'
                      }`}>
                        {transaction.type === 'income'
                          ? formatCurrencyINR(transaction.amount, { includePlus: true })
                          : formatCurrencyINR(transaction.amount)
                        }
                      </span>
                      <button
                        type="button"
                        style={{
                          padding: '4px',
                          backgroundColor: 'transparent',
                          color: 'inherit',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <MoreHorizontal style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Investment Overview */}
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-white/10 bg-card/70 backdrop-blur-lg shadow-lg">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">Investment Portfolio</h3>
                <p className="text-sm text-muted-foreground">
                  {isLoadingInvestments 
                    ? 'Loading investment data...' 
                    : investmentData 
                      ? `Total: ₹${accountData.totalInvestments.toLocaleString('en-IN')}` 
                      : 'No investment data available'}
                </p>
              </div>
              <div className="space-y-4">
                {isLoadingInvestments ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    Loading investments...
                  </div>
                ) : investmentData ? (
                  <>
                    {/* Stocks/Holdings - Always show */}
                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground text-base">Holdings (Stocks)</p>
                          <p className="text-xs text-muted-foreground">
                            {investmentData.stocks?.holdings?.length || 0} holdings
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground text-lg">
                            ₹{(investmentData.stocks?.totalValue || 0).toLocaleString('en-IN')}
                          </p>
                          {investmentData.stocks?.totalProfitLoss !== undefined && investmentData.stocks.totalValue > 0 && (
                            <p className={`text-xs font-semibold ${
                              investmentData.stocks.totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {investmentData.stocks.totalProfitLoss >= 0 ? '+' : ''}
                              ₹{investmentData.stocks.totalProfitLoss.toLocaleString('en-IN')}
                              {investmentData.stocks.profitLossPercentage !== undefined && 
                                ` (${Number(investmentData.stocks.profitLossPercentage).toFixed(2)}%)`
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mutual Funds - Always show */}
                    <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground text-base">Mutual Funds</p>
                          <p className="text-xs text-muted-foreground">
                            {investmentData.mutualFunds?.funds?.length || 0} funds
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground text-lg">
                            ₹{(investmentData.mutualFunds?.totalValue || 0).toLocaleString('en-IN')}
                          </p>
                          {investmentData.mutualFunds?.totalProfitLoss !== undefined && investmentData.mutualFunds.totalValue > 0 && (
                            <p className={`text-xs font-semibold ${
                              investmentData.mutualFunds.totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {investmentData.mutualFunds.totalProfitLoss >= 0 ? '+' : ''}
                              ₹{investmentData.mutualFunds.totalProfitLoss.toLocaleString('en-IN')}
                              {investmentData.mutualFunds.profitLossPercentage !== undefined && 
                                ` (${Number(investmentData.mutualFunds.profitLossPercentage).toFixed(2)}%)`
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Fixed Deposits - Always show */}
                    <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground text-base">Fixed Deposits</p>
                          <p className="text-xs text-muted-foreground">
                            {investmentData.fixedDeposits?.deposits?.length || 0} deposits
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground text-lg">
                            ₹{(investmentData.fixedDeposits?.totalValue || 0).toLocaleString('en-IN')}
                          </p>
                          {investmentData.fixedDeposits?.totalInterest !== undefined && investmentData.fixedDeposits.totalValue > 0 && (
                            <p className="text-xs font-semibold text-green-500">
                              +₹{investmentData.fixedDeposits.totalInterest.toLocaleString('en-IN')} interest
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* No investments message only if ALL are 0 */}
                    {(!investmentData.stocks || investmentData.stocks.totalValue === 0) &&
                     (!investmentData.mutualFunds || investmentData.mutualFunds.totalValue === 0) &&
                     (!investmentData.fixedDeposits || investmentData.fixedDeposits.totalValue === 0) && (
                      <div className="text-center py-4 text-muted-foreground border-t border-border/50 mt-4">
                        <p className="text-sm">Connect your demat account to track investments</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30 text-muted-foreground" />
                    <p className="text-white font-semibold mb-1">No investment data available</p>
                    <p className="text-white text-xs">Link your demat account to track your investments</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 rounded-xl border border-white/10 bg-card/70 backdrop-blur-lg shadow-lg">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">Monthly Summary</h3>
                <p className="text-sm text-muted-foreground">Income vs Expenses</p>
              </div>
              <div>
                <div className="space-y-4">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{data.month}</span>
                        <span className="text-foreground font-medium">
                          {formatCurrencyINR(data.income - data.expenses)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-success h-2 rounded-full"
                          style={{ 
                            width: `${Math.min(((data.income - data.expenses) / data.income) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
