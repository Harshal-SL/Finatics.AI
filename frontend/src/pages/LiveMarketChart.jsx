import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TradingViewWidget from "@/components/TradingViewWidget";

const LiveMarketChart = () => {
  const navigate = useNavigate();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const marketIndices = [
    { 
      symbol: "SENSEX", 
      name: "BSE SENSEX", 
      price: 70856.23, 
      change: -89.45, 
      changePercent: -0.13,
      description: "India's benchmark stock market index"
    },
    { 
      symbol: "NIFTY", 
      name: "NIFTY 50", 
      price: 21450.75, 
      change: 125.30, 
      changePercent: 0.59,
      description: "NSE's flagship index of top 50 companies"
    },
    { 
      symbol: "BANKNIFTY", 
      name: "BANK NIFTY", 
      price: 46780.40, 
      change: 245.80, 
      changePercent: 0.53,
      description: "Banking sector index"
    },
  ];

  const watchlistStocks = [
    { symbol: "SBIN", name: "State Bank of India", price: 598.50, change: 12.30, changePercent: 2.10 },
    { symbol: "TCS", name: "Tata Consultancy Services", price: 3845.75, change: -25.50, changePercent: -0.66 },
    { symbol: "INFY", name: "Infosys", price: 1567.90, change: 18.40, changePercent: 1.19 },
    { symbol: "RELIANCE", name: "Reliance Industries", price: 2456.80, change: -15.20, changePercent: -0.61 },
    { symbol: "HDFCBANK", name: "HDFC Bank", price: 1678.45, change: 23.90, changePercent: 1.44 },
  ];

  const handleRefresh = () => {
    setLastRefresh(new Date());
    // Force widget reload by remounting
    window.location.reload();
  };

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
              Back to Portfolio
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Live Market Charts</h1>
              <p className="text-muted-foreground">
                Real-time Indian stock market data powered by TradingView
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last refreshed: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <AnimatedButton 
            onClick={handleRefresh}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Charts
          </AnimatedButton>
        </div>

        {/* Market Indices Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {marketIndices.map((index) => (
            <Card key={index.symbol} className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-foreground">
                    {index.name}
                  </CardTitle>
                  {index.change >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-success" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <CardDescription className="text-xs">{index.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {index.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className={`text-sm font-medium ${index.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main TradingView Chart */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Live Market Charts</CardTitle>
            <CardDescription>
              Interactive charts for BSE SENSEX, NIFTY, SBI, TCS, and Infosys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[600px] w-full">
              <TradingViewWidget />
            </div>
          </CardContent>
        </Card>

        {/* Watchlist Stocks */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Quick Watchlist</CardTitle>
            <CardDescription>Top stocks being tracked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlistStocks.map((stock) => (
                <div 
                  key={stock.symbol} 
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{stock.symbol}</h3>
                      <p className="text-xs text-muted-foreground">{stock.name}</p>
                    </div>
                    {stock.change >= 0 ? (
                      <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stock.changePercent.toFixed(2)}%
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        {stock.changePercent.toFixed(2)}%
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-lg font-bold text-foreground">
                      ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`text-xs font-medium ${stock.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {stock.change >= 0 ? '+' : ''}₹{stock.change.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Footer */}
        <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground text-center">
            📊 Charts powered by TradingView • Data updates in real-time • Click on any stock in the chart to view detailed analysis
          </p>
        </div>
      </main>
    </div>
  );
};

export default LiveMarketChart;
