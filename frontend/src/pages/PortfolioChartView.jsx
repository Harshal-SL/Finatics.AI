import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PortfolioPerformanceChart from "@/components/PortfolioPerformanceChart";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const PortfolioChartView = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [dematData, setDematData] = useState(null);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalHoldings: 0,
    totalValue: 0,
    totalInvestment: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch holdings from API
  const fetchHoldings = async (useRealtime = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        setError('Please log in to view your portfolio');
        setLoading(false);
        return;
      }

      let url = `${API_BASE_URL}/holdings/user/${user.id}${useRealtime ? '?realtime=true' : ''}`;
      console.log('Fetching holdings from:', url);
      
      let response = await fetch(url);
      let result = await response.json();
      
      // Fallback to account number if user endpoint fails
      if (!response.ok || !result.success) {
        console.warn('User endpoint failed, trying account number fallback...');
        const fallbackAccountNumber = '5893143322';
        url = `${API_BASE_URL}/holdings/account/${fallbackAccountNumber}${useRealtime ? '?realtime=true' : ''}`;
        response = await fetch(url);
        result = await response.json();
      }
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
      
      if (result.success && result.data) {
        const apiData = result.data;
        
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
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching holdings:', error);
      setError(error.message || 'Failed to fetch holdings');
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

  // Initial load
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchHoldings(false);
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent relative">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-lg text-muted-foreground">Loading portfolio...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent relative">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="text-destructive text-lg font-semibold mb-2">{error}</div>
                <AnimatedButton onClick={() => navigate('/stocks')} className="mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Stocks
                </AnimatedButton>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/stocks')}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stocks
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {customerData ? `${customerData.full_name}'s Portfolio` : 'My Portfolio'}
              </h1>
              <p className="text-muted-foreground">
                Detailed analysis of your stock investments
              </p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <AnimatedButton 
            onClick={refreshRealtime}
            disabled={refreshing}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Prices'}
          </AnimatedButton>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{summary.totalValue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs opacity-90 mt-1">Current portfolio value</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ₹{summary.totalInvestment?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Total invested</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gain/Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.totalGainLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                {summary.totalGainLoss >= 0 ? '+' : ''}₹{summary.totalGainLoss?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className={`text-xs font-medium ${summary.totalGainLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                {summary.totalGainLossPercent >= 0 ? '+' : ''}{summary.totalGainLossPercent?.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{portfolio.length}</div>
              <p className="text-xs text-muted-foreground">
                {dematData ? `via ${dematData.broker_name}` : 'Total stocks'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Portfolio Chart */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Portfolio Performance Analysis</CardTitle>
            <CardDescription>
              Visual breakdown of your investment performance and distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            {portfolio.length > 0 ? (
              <PortfolioPerformanceChart portfolio={portfolio} summary={summary} />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No portfolio data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Holdings List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Holdings Breakdown</CardTitle>
            <CardDescription>Detailed view of all your stock positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolio.map((stock, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground">{stock.stock_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Qty: {stock.quantity}</span>
                          <span>Avg: ₹{stock.average_price?.toFixed(2)}</span>
                          <span>Current: ₹{stock.current_price?.toFixed(2)}</span>
                          {stock.priceSource && (
                            <Badge variant="outline" className="text-xs">
                              {stock.priceSource === 'realtime' ? '🟢 Live' : '⚪ DB'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-foreground">
                        ₹{stock.current_value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-sm font-medium flex items-center justify-end gap-1 ${stock.gain_loss >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {stock.gain_loss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {stock.gain_loss >= 0 ? '+' : ''}₹{stock.gain_loss?.toFixed(2)}
                        ({stock.gain_loss_percent >= 0 ? '+' : ''}{stock.gain_loss_percent?.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border grid grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Investment:</span>
                      <div className="font-medium text-foreground">
                        ₹{(stock.quantity * stock.average_price)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current Value:</span>
                      <div className="font-medium text-foreground">
                        ₹{stock.current_value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">P&L:</span>
                      <div className={`font-medium ${stock.gain_loss >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {stock.gain_loss >= 0 ? '+' : ''}₹{stock.gain_loss?.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Return:</span>
                      <div className={`font-medium ${stock.gain_loss_percent >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {stock.gain_loss_percent >= 0 ? '+' : ''}{stock.gain_loss_percent?.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PortfolioChartView;
