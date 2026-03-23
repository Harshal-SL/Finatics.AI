const axios = require('axios');

/**
 * Market Analysis Service
 * Provides technical indicators, historical data analysis, and trend detection
 */

/**
 * Calculate Relative Strength Index (RSI)
 * @param {Array<number>} prices - Array of closing prices
 * @param {number} period - Period for RSI calculation (default: 14)
 * @returns {number} RSI value (0-100)
 */
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) {
    return null; // Not enough data
  }

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const difference = prices[i] - prices[i - 1];
    if (difference >= 0) {
      gains += difference;
    } else {
      losses -= difference;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Calculate RSI for remaining prices
  for (let i = period + 1; i < prices.length; i++) {
    const difference = prices[i] - prices[i - 1];
    if (difference >= 0) {
      avgGain = (avgGain * (period - 1) + difference) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - difference) / period;
    }
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return Math.round(rsi * 100) / 100;
}

/**
 * Calculate Simple Moving Average (SMA)
 * @param {Array<number>} prices - Array of closing prices
 * @param {number} period - Period for SMA calculation
 * @returns {number} SMA value
 */
function calculateSMA(prices, period) {
  if (prices.length < period) {
    return null;
  }

  const slice = prices.slice(-period);
  const sum = slice.reduce((acc, price) => acc + price, 0);
  return Math.round((sum / period) * 100) / 100;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array<number>} prices - Array of closing prices
 * @param {number} period - Period for EMA calculation
 * @returns {number} EMA value
 */
function calculateEMA(prices, period) {
  if (prices.length < period) {
    return null;
  }

  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(prices.slice(0, period), period);

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return Math.round(ema * 100) / 100;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param {Array<number>} prices - Array of closing prices
 * @returns {Object} MACD line, signal line, and histogram
 */
function calculateMACD(prices) {
  if (prices.length < 26) {
    return null;
  }

  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;

  // Calculate signal line (9-period EMA of MACD)
  const macdValues = [];
  for (let i = 26; i < prices.length; i++) {
    const slice = prices.slice(0, i + 1);
    const e12 = calculateEMA(slice, 12);
    const e26 = calculateEMA(slice, 26);
    macdValues.push(e12 - e26);
  }

  const signalLine = calculateEMA(macdValues, 9);
  const histogram = macdLine - signalLine;

  return {
    value: Math.round(macdLine * 100) / 100,
    signal: Math.round(signalLine * 100) / 100,
    histogram: Math.round(histogram * 100) / 100
  };
}

/**
 * Calculate Bollinger Bands
 * @param {Array<number>} prices - Array of closing prices
 * @param {number} period - Period for calculation (default: 20)
 * @param {number} stdDev - Standard deviation multiplier (default: 2)
 * @returns {Object} Upper band, middle band (SMA), lower band
 */
function calculateBollingerBands(prices, period = 20, stdDev = 2) {
  if (prices.length < period) {
    return null;
  }

  const sma = calculateSMA(prices, period);
  const slice = prices.slice(-period);

  // Calculate standard deviation
  const squaredDiffs = slice.map(price => Math.pow(price - sma, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / period;
  const standardDeviation = Math.sqrt(variance);

  return {
    upper: Math.round((sma + stdDev * standardDeviation) * 100) / 100,
    middle: sma,
    lower: Math.round((sma - stdDev * standardDeviation) * 100) / 100
  };
}

/**
 * Detect trend based on moving averages
 * @param {number} currentPrice - Current stock price
 * @param {Array<number>} prices - Historical prices
 * @returns {string} Trend: 'Strong Uptrend', 'Uptrend', 'Sideways', 'Downtrend', 'Strong Downtrend'
 */
function detectTrend(currentPrice, prices) {
  if (prices.length < 50) {
    return 'Insufficient data';
  }

  const ma20 = calculateSMA(prices, 20);
  const ma50 = calculateSMA(prices, 50);

  if (currentPrice > ma20 && ma20 > ma50) {
    const momentum = ((currentPrice - ma50) / ma50) * 100;
    return momentum > 10 ? 'Strong Uptrend' : 'Uptrend';
  } else if (currentPrice < ma20 && ma20 < ma50) {
    const momentum = ((currentPrice - ma50) / ma50) * 100;
    return momentum < -10 ? 'Strong Downtrend' : 'Downtrend';
  } else {
    return 'Sideways';
  }
}

/**
 * Analyze stock with all technical indicators
 * @param {string} symbol - Stock symbol
 * @param {Array<number>} historicalPrices - Array of historical closing prices
 * @returns {Object} Complete technical analysis
 */
function performTechnicalAnalysis(symbol, historicalPrices) {
  if (!historicalPrices || historicalPrices.length < 50) {
    return {
      error: 'Insufficient historical data for analysis',
      requiredDays: 50,
      availableDays: historicalPrices?.length || 0
    };
  }

  const currentPrice = historicalPrices[historicalPrices.length - 1];
  const rsi = calculateRSI(historicalPrices, 14);
  const macd = calculateMACD(historicalPrices);
  const ma20 = calculateSMA(historicalPrices, 20);
  const ma50 = calculateSMA(historicalPrices, 50);
  const bollingerBands = calculateBollingerBands(historicalPrices, 20, 2);
  const trend = detectTrend(currentPrice, historicalPrices);

  // Generate signals
  const signals = {
    rsi: rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral',
    macd: macd.value > macd.signal ? 'Bullish' : 'Bearish',
    trend: trend,
    bollingerPosition: currentPrice > bollingerBands.upper ? 'Above upper band' :
                        currentPrice < bollingerBands.lower ? 'Below lower band' : 'Within bands'
  };

  // Overall recommendation
  let recommendation = 'Hold';
  let score = 0;

  if (rsi < 30) score += 2; // Oversold - buy signal
  if (rsi > 70) score -= 2; // Overbought - sell signal
  if (macd.value > macd.signal && macd.histogram > 0) score += 1; // Bullish MACD
  if (macd.value < macd.signal && macd.histogram < 0) score -= 1; // Bearish MACD
  if (trend.includes('Uptrend')) score += 1;
  if (trend.includes('Downtrend')) score -= 1;
  if (currentPrice < bollingerBands.lower) score += 1; // Below lower band - potential buy
  if (currentPrice > bollingerBands.upper) score -= 1; // Above upper band - potential sell

  if (score >= 3) recommendation = 'Buy';
  else if (score >= 1) recommendation = 'Accumulate';
  else if (score <= -3) recommendation = 'Sell';
  else if (score <= -1) recommendation = 'Reduce';

  return {
    symbol: symbol,
    currentPrice: currentPrice,
    technicalIndicators: {
      rsi: rsi,
      macd: macd,
      ma20: ma20,
      ma50: ma50,
      bollingerBands: bollingerBands
    },
    signals: signals,
    trend: trend,
    recommendation: recommendation,
    score: score,
    timestamp: new Date().toISOString()
  };
}

/**
 * Calculate performance metrics
 * @param {Array<number>} prices - Historical prices
 * @param {number} days - Number of days to calculate performance
 * @returns {Object} Performance metrics
 */
function calculatePerformance(prices, days) {
  if (prices.length < days + 1) {
    return null;
  }

  const currentPrice = prices[prices.length - 1];
  const pastPrice = prices[prices.length - 1 - days];
  const change = currentPrice - pastPrice;
  const changePercent = (change / pastPrice) * 100;

  // Find high and low in the period
  const periodPrices = prices.slice(-days);
  const high = Math.max(...periodPrices);
  const low = Math.min(...periodPrices);

  return {
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    high: high,
    low: low,
    volatility: Math.round(((high - low) / low) * 10000) / 100 // Percentage volatility
  };
}

/**
 * Get support and resistance levels
 * @param {Array<number>} prices - Historical prices
 * @returns {Object} Support and resistance levels
 */
function getSupportResistanceLevels(prices) {
  if (prices.length < 20) {
    return null;
  }

  // Use recent 60 days for level calculation
  const recentPrices = prices.slice(-60);
  const sorted = [...recentPrices].sort((a, b) => a - b);

  // Find pivot points
  const high = Math.max(...recentPrices);
  const low = Math.min(...recentPrices);
  const close = recentPrices[recentPrices.length - 1];

  const pivot = (high + low + close) / 3;
  const resistance1 = (2 * pivot) - low;
  const support1 = (2 * pivot) - high;
  const resistance2 = pivot + (high - low);
  const support2 = pivot - (high - low);

  return {
    resistance2: Math.round(resistance2 * 100) / 100,
    resistance1: Math.round(resistance1 * 100) / 100,
    pivot: Math.round(pivot * 100) / 100,
    support1: Math.round(support1 * 100) / 100,
    support2: Math.round(support2 * 100) / 100
  };
}

/**
 * Comprehensive stock analysis with all metrics
 * @param {string} symbol - Stock symbol
 * @param {Object} currentData - Current stock data
 * @param {Array<number>} historicalPrices - Historical closing prices
 * @returns {Object} Complete analysis
 */
function analyzeStock(symbol, currentData, historicalPrices) {
  if (!historicalPrices || historicalPrices.length < 50) {
    return {
      symbol: symbol,
      error: 'Insufficient historical data',
      currentData: currentData
    };
  }

  const technicalAnalysis = performTechnicalAnalysis(symbol, historicalPrices);
  const performance30d = calculatePerformance(historicalPrices, 30);
  const performance90d = calculatePerformance(historicalPrices, 90);
  const performance1y = historicalPrices.length >= 252 ? calculatePerformance(historicalPrices, 252) : null;
  const supportResistance = getSupportResistanceLevels(historicalPrices);

  return {
    symbol: symbol,
    currentData: currentData,
    technicalAnalysis: technicalAnalysis,
    performance: {
      '30d': performance30d,
      '90d': performance90d,
      '1y': performance1y
    },
    levels: supportResistance,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  calculateRSI,
  calculateSMA,
  calculateEMA,
  calculateMACD,
  calculateBollingerBands,
  detectTrend,
  performTechnicalAnalysis,
  calculatePerformance,
  getSupportResistanceLevels,
  analyzeStock
};
