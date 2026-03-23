import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const PortfolioPerformanceChart = ({ portfolio, summary }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);

  useEffect(() => {
    if (portfolio && portfolio.length > 0) {
      // Generate timeline data based on portfolio holdings
      // This simulates a day's performance based on gain/loss
      const generateTimelineData = () => {
        const times = ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30'];
        
        return times.map((time, index) => {
          const dataPoint = { time };
          
          portfolio.forEach(stock => {
            // Calculate progression through the day
            const progress = index / (times.length - 1);
            const startValue = stock.current_value - stock.gain_loss; // Investment value
            const currentValue = stock.current_value;
            
            // Interpolate value between start and current
            const interpolatedValue = startValue + (currentValue - startValue) * progress;
            
            // Add some realistic variation (±1%)
            const variation = interpolatedValue * (Math.random() * 0.02 - 0.01);
            const finalValue = interpolatedValue + variation;
            
            dataPoint[stock.stock_name] = parseFloat(finalValue.toFixed(2));
          });
          
          // Calculate total portfolio value at this time
          dataPoint.total = portfolio.reduce((sum, stock) => {
            return sum + (dataPoint[stock.stock_name] || 0);
          }, 0);
          
          return dataPoint;
        });
      };

      // Generate distribution data for pie chart
      const generateDistributionData = () => {
        return portfolio.map(stock => ({
          name: stock.stock_name,
          value: parseFloat(stock.current_value.toFixed(2)),
          percentage: ((stock.current_value / summary.totalValue) * 100).toFixed(1),
          gainLoss: stock.gain_loss,
          gainLossPercent: stock.gain_loss_percent
        }));
      };

      setTimelineData(generateTimelineData());
      setDistributionData(generateDistributionData());
    }
  }, [portfolio, summary]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-3 text-xs">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-semibold">₹{entry.value?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{data.name}</p>
          <p className="text-xs text-muted-foreground">
            ₹{data.value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({data.percentage}%)
          </p>
          <p className={`text-xs font-medium mt-1 ${data.gainLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
            {data.gainLoss >= 0 ? '+' : ''}₹{data.gainLoss?.toFixed(2)} ({data.gainLossPercent?.toFixed(2)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!portfolio || portfolio.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        No portfolio data available
      </div>
    );
  }

  return (
    <Tabs defaultValue="timeline" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="timeline">Performance Timeline</TabsTrigger>
        <TabsTrigger value="distribution">Portfolio Distribution</TabsTrigger>
      </TabsList>
      
      <TabsContent value="timeline" className="mt-0">
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {portfolio.map((stock, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <span 
                  className="inline-block w-2 h-2 rounded-full mr-1" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                {stock.stock_name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                {portfolio.map((stock, index) => (
                  <linearGradient key={index} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.05}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              {portfolio.map((stock, index) => (
                <Area
                  key={index}
                  type="monotone"
                  dataKey={stock.stock_name}
                  stroke={COLORS[index % COLORS.length]}
                  fill={`url(#color${index})`}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground">
            Intraday performance • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </TabsContent>
      
      <TabsContent value="distribution" className="mt-0">
        <div className="h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {distributionData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                <span className="text-sm font-semibold text-foreground">
                  ₹{item.value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className={`text-xs font-medium ${item.gainLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {item.gainLoss >= 0 ? '+' : ''}{item.gainLossPercent?.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground">
            Portfolio allocation by current value
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default PortfolioPerformanceChart;
