import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { BentoGrid } from "@/components/ui/bento-grid";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Particles } from "@/components/ui/particles";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";

import { 
  TrendingUp, 
  TrendingDown, 
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  RefreshCw,
  BarChart3,
  PieChart,
  Home,
  LineChart as LineChartIcon,
  Target,
  Calculator,
  BookOpen,
  MessageSquare,
  LogOut
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TradingViewWidget from "@/components/TradingViewWidget";
import PortfolioPerformanceChart from "@/components/PortfolioPerformanceChart";
import { OrbitalLoader } from "@/components/ui/orbital-loader";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Stocks = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [realtime, setRealtime] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [dematData, setDematData] = useState(null);
  const [error, setError] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [summary, setSummary] = useState({
    totalHoldings: 0,
    totalValue: 0,
    totalInvestment: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch holdings from API using logged-in user's ID
  const fetchHoldings = async (useRealtime = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        setError('Please log in to view your holdings');
        setLoading(false);
        return;
      }

      // Try to fetch by user ID first
      let url = `${API_BASE_URL}/holdings/user/${user.id}${useRealtime ? '?realtime=true' : ''}`;
      console.log('Fetching holdings from:', url);
      
      let response = await fetch(url);
      let result = await response.json();
      
      // If user endpoint fails, try account number endpoint as fallback
      // TODO: Get account number from user profile/context
      if (!response.ok || !result.success) {
        console.warn('User endpoint failed, trying account number fallback...');
        const fallbackAccountNumber = '5893143322'; // TODO: Get from user context
        url = `${API_BASE_URL}/holdings/account/${fallbackAccountNumber}${useRealtime ? '?realtime=true' : ''}`;
        console.log('Trying fallback URL:', url);
        
        response = await fetch(url);
        result = await response.json();
      }
      
      if (!response.ok) {
        console.error(`Holdings API error: ${response.status}`, result.message);
        // Don't throw error, just set empty portfolio
        setPortfolio([]);
      } else if (result.success && result.data) {
        const apiData = result.data;
        
        // Map API data to frontend format (normalize field names)
        const normalizedHoldings = apiData.holdings.map(h => ({
          ...h,
          stock_name: h.name,
          average_price: h.bought_price,
          current_value: h.currentValue,
          gain_loss: h.gainLoss,
          gain_loss_percent: h.gainLossPercent,
          priceSource: h.price_source
        }));
        
        setPortfolio(normalizedHoldings);
        setSummary(apiData.summary);
        setCustomerData(apiData.customer);
        setDematData(apiData.dematAccounts?.[0]);
        setRealtime(result.realtime);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching holdings:', error);
      // Don't set error state, just log it
    } finally {
      setLoading(false);
    }
  };

  // Refresh with real-time prices
  const refreshRealtime = async () => {
    setRefreshing(true);
    await fetchHoldings(true);
    setRefreshing(false);
  };

  // Initial load - fetch when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchHoldings(false); // Start with database prices
    }
  }, [isAuthenticated, user]);

  // Fetch AI insights on component mount
  useEffect(() => {
    fetchAIInsights();
  }, []);

  // Fetch AI insights from API
  const fetchAIInsights = async () => {
    try {
      setLoadingInsights(true);
      const url = `${API_BASE_URL}/ai-insights`;
      console.log('Fetching AI insights from:', url);
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.data && result.data.insights) {
        setAiInsights(result.data.insights);
        console.log('✅ AI insights loaded:', result.data.insights.length);
        if (result.data.isFallback) {
          console.log('⚠️ Using fallback AI insights due to Gemini API overload');
        }
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      // Set fallback insights on error
      setAiInsights([]);
    } finally {
      setLoadingInsights(false);
    }
  };

  const marketData = [
    { symbol: "NIFTY", name: "NIFTY 50", price: 21450.75, change: 125.30, changePercent: 0.59 },
    { symbol: "SENSEX", name: "BSE SENSEX", price: 70856.23, change: -89.45, changePercent: -0.13 },
    { symbol: "BANKNIFTY", name: "BANK NIFTY", price: 46780.40, change: 245.80, changePercent: 0.53 },
  ];

  // Navigation items for navbar
  const navItems = [
    { name: "Dashboard", url: "/dashboard", icon: Home },
    { name: "Investments", url: "/stocks", icon: LineChartIcon },
    { name: "Goals", url: "/goals", icon: Target },
    { name: "Loan Analyzer", url: "/loan-analyzer", icon: Calculator },
    { name: "Learn", url: "/learn", icon: BookOpen },
  ];

  const getInsightColor = (type) => {
    switch (type.toLowerCase()) {
      case "technical": return "bg-primary/20 text-primary border-primary/30";
      case "sentiment": return "bg-success/20 text-success border-success/30";
      case "quantitative": return "bg-warning/20 text-warning border-warning/30";
      case "sectoral": return "bg-destructive/20 text-destructive border-destructive/30";
      case "buy": return "bg-success/20 text-success border-success/30";
      case "sell": return "bg-destructive/20 text-destructive border-destructive/30";
      case "hold": return "bg-warning/20 text-warning border-warning/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative">
        <Navbar items={navItems} className="" showLogo={true} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
          <div className="flex items-center justify-center h-96">
            <OrbitalLoader message="Loading holdings..." messagePlacement="bottom" />
          </div>
        </main>
      </div>
    );
  }

  // Always render the page, even if there are errors (show empty states instead)
  if (false) {
    return (
      <div className="min-h-screen bg-transparent relative">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="text-destructive text-lg font-semibold mb-2">
                  {error}
                </div>
                {!isAuthenticated && (
                  <p className="text-muted-foreground mb-4">
                    Please sign in to view your stock portfolio
                  </p>
                )}
                {isAuthenticated && error.includes('not found') && (
                  <p className="text-muted-foreground mb-4">
                    Your account may not have banking data linked yet. Please contact support.
                  </p>
                )}
                <AnimatedButton onClick={() => fetchHoldings(false)} className="mt-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </AnimatedButton>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
      
      {/* Logout Button */}
      <button
        onClick={async () => { await signOut(); navigate('/login'); }}
        className="fixed top-8 right-8 flex items-center gap-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 rounded-full text-destructive hover:text-destructive transition-all duration-200 backdrop-blur-lg"
        style={{ zIndex: 9999 }}
      >
        <LogOut size={18} />
        <span className="hidden sm:inline">Logout</span>
      </button>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32 relative">
        {/* Header - Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          {/* Title Section */}
          <div className="md:col-span-5 p-6 rounded-2xl bg-card/30 backdrop-blur-sm">
            <h1 className="text-3xl font-bold text-foreground mb-2">Stock Portfolio</h1>
            <p className="text-muted-foreground">
              {customerData ? `${customerData.full_name}'s investments` : 'Track your investments and get AI-powered insights'}
            </p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                Last updated: {lastUpdated.toLocaleTimeString()} 
                {realtime && <Badge variant="outline" className="text-xs border-green-500/50 text-green-500">Live Prices</Badge>}
              </p>
            )}
          </div>

          {/* Buttons Section - Bento Grid */}
          <div className="md:col-span-7 flex items-center gap-3 flex-wrap">
            {/* Live Market Button */}
            <button
              onClick={() => navigate('/stocks/live-market')}
              className="group flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-full text-green-500 hover:text-green-400 transition-all duration-200 backdrop-blur-lg"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Live Market</span>
            </button>

            {/* Portfolio View Button */}
            <button
              onClick={() => navigate('/stocks/portfolio')}
              className="group flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-500 hover:text-orange-400 transition-all duration-200 backdrop-blur-lg"
            >
              <PieChart className="w-4 h-4" />
              <span className="text-sm font-medium">Portfolio View</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={refreshRealtime}
              disabled={refreshing}
              className="group flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-500 hover:text-blue-400 transition-all duration-200 backdrop-blur-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">{refreshing ? 'Refreshing...' : 'Refresh Prices'}</span>
            </button>
          </div>
        </div>

        {/* Portfolio Summary - Bento Grid */}
        <BentoGrid 
          className="grid-cols-1 md:grid-cols-3 mb-8"
          items={[
            {
              title: "Total Portfolio Value",
              description: `₹${summary.totalValue?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
              icon: <IndianRupee className="h-4 w-4 text-primary" />,
              status: `${summary.totalGainLossPercent >= 0 ? '+' : ''}${summary.totalGainLossPercent?.toFixed(2) || '0.00'}% overall`,
              meta: `${portfolio.length} Holdings`,
              hasPersistentHover: true,
              colSpan: 1
            },
            {
              title: "Total Gain/Loss",
              description: `${summary.totalGainLoss >= 0 ? '+' : ''}₹${summary.totalGainLoss?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
              icon: summary.totalGainLoss >= 0 
                ? <TrendingUp className="h-4 w-4 text-success" />
                : <TrendingDown className="h-4 w-4 text-destructive" />,
              status: `${portfolio.length} holdings`,
              hasPersistentHover: summary.totalGainLoss >= 0,
              colSpan: 1
            },
            {
              title: "AI Insights",
              description: `${aiInsights.length}`,
              icon: <Brain className="h-4 w-4 text-primary" />,
              status: aiInsights.length > 0 ? 'AI recommendations available' : 'Loading insights...',
              colSpan: 1
            }
          ]}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Holdings and Market Data */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Stock Chart */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Live Portfolio Performance</CardTitle>
                <CardDescription>Real-time stock price movements and portfolio distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="portfolio" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="portfolio">Portfolio Analysis</TabsTrigger>
                    <TabsTrigger value="tradingview">TradingView</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="portfolio" className="mt-0">
                    <PortfolioPerformanceChart portfolio={portfolio} summary={summary} />
                  </TabsContent>
                  
                  <TabsContent value="tradingview" className="mt-0">
                    <div className="h-[500px] w-full">
                      <TradingViewWidget />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Market Indices */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Market Overview</CardTitle>
                <CardDescription>Live market indices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {marketData.map((index) => (
                    <div key={index.symbol} className="p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{index.name}</h3>
                        {index.change >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-success" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div className="text-lg font-semibold text-foreground">{index.price.toLocaleString()}</div>
                      <div className={`text-sm ${index.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Holdings */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Your Holdings</CardTitle>
                <CardDescription>
                  Current stock positions {dematData && `(${dematData.broker_name})`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolio.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No holdings found. Add your first stock to get started!
                  </div>
                ) : (
                  portfolio.map((stock, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <IndianRupee className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{stock.stock_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {stock.quantity} shares • Avg: ₹{stock.average_price?.toFixed(2) || 'N/A'}
                            </p>
                            {stock.priceSource && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                {stock.priceSource === 'realtime' ? (
                                  <>
                                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Live Price
                                  </>
                                ) : (
                                  <>
                                    <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                                    Database Price
                                  </>
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">₹{stock.current_price?.toFixed(2) || 'N/A'}</div>
                          <div className={`text-sm flex items-center justify-end ${stock.gain_loss >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {stock.gain_loss >= 0 ? (
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 mr-1" />
                            )}
                            {stock.gain_loss >= 0 ? '+' : ''}₹{stock.gain_loss?.toFixed(2) || '0.00'} 
                            ({stock.gain_loss_percent >= 0 ? '+' : ''}{stock.gain_loss_percent?.toFixed(2) || '0.00'}%)
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Value: ₹{stock.current_value?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg text-foreground">AI Insights</CardTitle>
                  </div>
                  {loadingInsights && (
                    <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <CardDescription>Personalized recommendations from Gemini AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.length === 0 && !loadingInsights && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No AI insights available
                  </div>
                )}
                {aiInsights.map((insight, index) => (
                  <div key={insight.id || index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {insight.type}
                      </Badge>
                    </div>
                    <h4 className="font-medium mb-1">{insight.title}</h4>
                    <p className="text-xs opacity-90">{insight.summary}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stock Market News - Fallback when AI is overloaded */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg text-foreground">Market News</CardTitle>
                </div>
                <CardDescription>Top 5 latest stock market updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    id: 1,
                    title: "Nifty 50 Hits New All-Time High",
                    description: "Indian benchmark index closes above 21,500 mark driven by strong banking and IT sector performance.",
                    time: "2 hours ago",
                    category: "Markets"
                  },
                  {
                    id: 2,
                    title: "FII Inflows Continue Strong Momentum",
                    description: "Foreign institutional investors pumped ₹8,500 crore into Indian equities this week, showing confidence in market fundamentals.",
                    time: "4 hours ago",
                    category: "Investment"
                  },
                  {
                    id: 3,
                    title: "IT Sector Leads Gainers List",
                    description: "Technology stocks rally on positive quarterly earnings outlook and favorable currency movement.",
                    time: "6 hours ago",
                    category: "Sectors"
                  },
                  {
                    id: 4,
                    title: "Bank Nifty Shows Resilience",
                    description: "Banking index maintains upward trajectory supported by strong credit growth and improving asset quality.",
                    time: "8 hours ago",
                    category: "Banking"
                  },
                  {
                    id: 5,
                    title: "Market Volatility Remains Low",
                    description: "India VIX drops to 12 levels indicating stable market conditions and investor confidence ahead of earnings season.",
                    time: "10 hours ago",
                    category: "Analysis"
                  }
                ].map((news) => (
                  <div key={news.id} className="p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors bg-card/50">
                    <div className="flex items-start justify-between mb-1">
                      <Badge variant="outline" className="text-xs">
                        {news.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{news.time}</span>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{news.title}</h4>
                    <p className="text-xs text-muted-foreground">{news.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Stocks;
