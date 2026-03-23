import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Particles } from "@/components/ui/particles";

import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Target,
  Wallet
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const monthlyData = [
    { month: 'Jan', income: 4500, expenses: 3200, savings: 1300 },
    { month: 'Feb', income: 4800, expenses: 3400, savings: 1400 },
    { month: 'Mar', income: 4600, expenses: 3600, savings: 1000 },
    { month: 'Apr', income: 5000, expenses: 3800, savings: 1200 },
    { month: 'May', income: 4700, expenses: 3500, savings: 1200 },
    { month: 'Jun', income: 5200, expenses: 3900, savings: 1300 }
  ];

  const expensesByCategory = [
    { name: 'Housing', value: 1200, color: 'hsl(var(--primary))' },
    { name: 'Food', value: 800, color: 'hsl(var(--success))' },
    { name: 'Transportation', value: 400, color: 'hsl(var(--warning))' },
    { name: 'Entertainment', value: 300, color: 'hsl(var(--destructive))' },
    { name: 'Utilities', value: 250, color: 'hsl(var(--muted))' },
    { name: 'Others', value: 450, color: 'hsl(var(--accent))' }
  ];

  const goalProgress = [
    { goal: 'Emergency Fund', target: 10000, current: 7500, percentage: 75 },
    { goal: 'Vacation', target: 3000, current: 1200, percentage: 40 },
    { goal: 'New Car', target: 15000, current: 4500, percentage: 30 },
    { goal: 'Investment', target: 5000, current: 2800, percentage: 56 }
  ];

  const reports = [
    {
      title: "Monthly Financial Summary",
      description: "Complete overview of income, expenses, and savings",
      period: "June 2024",
      type: "monthly",
      insights: ["Expenses increased by 8.5%", "Savings target achieved", "Investment growth: +12%"]
    },
    {
      title: "Quarterly Investment Report", 
      description: "Portfolio performance and recommendations",
      period: "Q2 2024",
      type: "quarterly",
      insights: ["Portfolio up 15.2%", "Tech stocks outperformed", "Rebalancing recommended"]
    },
    {
      title: "Annual Tax Planning",
      description: "Tax optimization opportunities and deductions",
      period: "2024",
      type: "annual", 
      insights: ["₹2,400 in potential savings", "Max out retirement contributions", "Consider tax-loss harvesting"]
    },
    {
      title: "Goal Achievement Analysis",
      description: "Progress tracking and timeline adjustments",
      period: "2024 YTD",
      type: "goals",
      insights: ["Emergency fund 75% complete", "Vacation goal on track", "Car fund needs acceleration"]
    }
  ];

  const getReportIcon = (type) => {
    switch (type) {
      case "monthly": return <Calendar className="w-5 h-5" />;
      case "quarterly": return <BarChart3 className="w-5 h-5" />;
      case "annual": return <FileText className="w-5 h-5" />;
      case "goals": return <Target className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getReportColor = (type) => {
    switch (type) {
      case "monthly": return "bg-primary/10 text-primary border-primary/30";
      case "quarterly": return "bg-success/10 text-success border-success/30";
      case "annual": return "bg-warning/10 text-warning border-warning/30";
      case "goals": return "bg-destructive/10 text-destructive border-destructive/30";
      default: return "bg-muted/10 text-muted-foreground border-muted/30";
    }
  };

  const formatINR = (value) => {
    const numericValue = typeof value === "number" ? value : Number(value) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  };

  return (
    <div className="min-h-screen bg-transparent relative">
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color="#ffffff"
        refresh={false}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Financial Reports</h1>
            <p className="text-muted-foreground">Comprehensive insights into your financial health</p>
          </div>
          <AnimatedButton className="bg-gradient-to-r from-primary to-success">
            <Download className="w-4 h-4 mr-2" />
            Export All Reports
          </AnimatedButton>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income-expense">Income & Expenses</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="reports">Generated Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Net Worth</p>
                      <p className="text-2xl font-bold text-success">{formatINR(47250)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success" />
                  </div>
                  <p className="text-xs text-success mt-2">+12.5% this month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Savings</p>
                      <p className="text-2xl font-bold text-primary">{formatINR(1300)}</p>
                    </div>
                    <Wallet className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">25% of income</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Investment Growth</p>
                      <p className="text-2xl font-bold text-success">+15.2%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success" />
                  </div>
                  <p className="text-xs text-success mt-2">YTD performance</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Goals Progress</p>
                      <p className="text-2xl font-bold text-warning">65%</p>
                    </div>
                    <Target className="w-8 h-8 text-warning" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Average completion</p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trend */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">6-Month Financial Trend</CardTitle>
                <CardDescription>Income vs Expenses vs Savings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="hsl(var(--success))" strokeWidth={3} />
                      <Line type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={3} />
                      <Line type="monotone" dataKey="savings" stroke="hsl(var(--primary))" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income-expense" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Monthly Income vs Expenses */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Monthly Comparison</CardTitle>
                  <CardDescription>Income vs Expenses breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="income" fill="hsl(var(--success))" />
                        <Bar dataKey="expenses" fill="hsl(var(--destructive))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Expense Categories */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Expense Categories</CardTitle>
                  <CardDescription>Current month breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percentage }) => `${name} ${(percentage * 100).toFixed(0)}%`}
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="grid gap-6">
              {goalProgress.map((goal, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{goal.goal}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatINR(goal.current)} of {formatINR(goal.target)}
                        </p>
                      </div>
                      <Badge variant="outline" className={`${goal.percentage >= 50 ? 'text-success border-success/30' : 'text-warning border-warning/30'}`}>
                        {goal.percentage}% Complete
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-primary to-success h-3 rounded-full transition-all duration-300"
                        style={{ width: `${goal.percentage}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-6">
              {reports.map((report, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${getReportColor(report.type)}`}>
                          {getReportIcon(report.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{report.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Period: {report.period}</p>
                            <div className="space-y-1">
                              {report.insights.map((insight, i) => (
                                <div key={i} className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                  <span className="text-xs text-muted-foreground">{insight}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <AnimatedButton variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </AnimatedButton>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Reports;
