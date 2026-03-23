const axios = require('axios');
const { 
  fetchAllIndices, 
  fetchMultipleStockPrices, 
  fetchHistoricalPrices,
  SYMBOL_MAPPING 
} = require('./nseStockService');

/**
 * Market Trends Service
 * Provides daily/weekly/monthly market trends, top gainers/losers, sector analysis
 */

// Cache for market trends data
let trendsCache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000 // 5 minutes cache
};

// Top Nifty 50 stocks by sector
const NIFTY50_STOCKS = {
  IT: ['TCS.NS', 'INFY.NS', 'WIPRO.NS', 'TECHM.NS', 'HCLTECH.NS', 'LTI.NS'],
  Banking: ['HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'AXISBANK.NS', 'KOTAKBANK.NS', 'INDUSINDBK.NS'],
  Auto: ['MARUTI.NS', 'M&M.NS', 'TATAMOTORS.NS', 'BAJAJ-AUTO.NS', 'EICHERMOT.NS'],
  Pharma: ['SUNPHARMA.NS', 'DRREDDY.NS', 'CIPLA.NS', 'DIVISLAB.NS', 'APOLLOHOSP.NS'],
  Energy: ['RELIANCE.NS', 'ONGC.NS', 'NTPC.NS', 'POWERGRID.NS', 'BPCL.NS'],
  FMCG: ['HINDUNILVR.NS', 'ITC.NS', 'NESTLEIND.NS', 'BRITANNIA.NS', 'DABUR.NS'],
  Metals: ['TATASTEEL.NS', 'HINDALCO.NS', 'JSWSTEEL.NS', 'COALINDIA.NS'],
  Telecom: ['BHARTIARTL.NS', 'IDEA.NS'],
  Realty: ['DLF.NS', 'GODREJPROP.NS'],
  Cement: ['ULTRACEMCO.NS', 'GRASIM.NS', 'SHREECEM.NS']
};

/**
 * Get all Nifty 50 stocks flattened
 */
function getAllNifty50Stocks() {
  const allStocks = [];
  Object.values(NIFTY50_STOCKS).forEach(sectorStocks => {
    allStocks.push(...sectorStocks);
  });
  return [...new Set(allStocks)]; // Remove duplicates
}

/**
 * Fetch top gainers and losers from Nifty 50
 * @returns {Promise<Object>} - Top gainers and losers with their data
 */
async function fetchTopGainersLosers() {
  try {
    const nifty50Stocks = getAllNifty50Stocks();
    
    // Fetch prices for all Nifty 50 stocks
    const priceMap = await fetchMultipleStockPrices(nifty50Stocks);
    
    // Filter successful responses and sort
    const stocksWithPrices = Object.entries(priceMap)
      .filter(([symbol, data]) => data.success && data.lastPrice)
      .map(([symbol, data]) => ({
        symbol: symbol.replace('.NS', ''),
        name: symbol.replace('.NS', ''),
        price: data.lastPrice,
        change: data.change,
        pChange: data.pChange,
        volume: data.volume
      }));

    // Sort by percentage change
    stocksWithPrices.sort((a, b) => b.pChange - a.pChange);

    const topGainers = stocksWithPrices.slice(0, 10); // Top 10 gainers
    const topLosers = stocksWithPrices.slice(-10).reverse(); // Top 10 losers

    return {
      success: true,
      topGainers,
      topLosers,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching top gainers/losers:', error.message);
    return {
      success: false,
      error: error.message,
      topGainers: [],
      topLosers: []
    };
  }
}

/**
 * Calculate sector-wise performance
 * @returns {Promise<Array>} - Sector performance data
 */
async function fetchSectorPerformance() {
  try {
    const sectorPerformance = [];

    for (const [sectorName, stocks] of Object.entries(NIFTY50_STOCKS)) {
      const priceMap = await fetchMultipleStockPrices(stocks);
      
      // Calculate average sector performance
      const successfulStocks = Object.values(priceMap).filter(data => data.success);
      
      if (successfulStocks.length > 0) {
        const avgChange = successfulStocks.reduce((sum, stock) => sum + stock.pChange, 0) / successfulStocks.length;
        
        let trend = 'Neutral';
        if (avgChange > 1) trend = 'Strong Positive';
        else if (avgChange > 0) trend = 'Positive';
        else if (avgChange < -1) trend = 'Strong Negative';
        else if (avgChange < 0) trend = 'Negative';

        sectorPerformance.push({
          name: sectorName,
          change: parseFloat(avgChange.toFixed(2)),
          trend: trend,
          stocksAnalyzed: successfulStocks.length
        });
      }
    }

    // Sort by performance
    sectorPerformance.sort((a, b) => b.change - a.change);

    return sectorPerformance;
  } catch (error) {
    console.error('Error calculating sector performance:', error.message);
    return [];
  }
}

/**
 * Determine overall market sentiment
 * @param {Object} indices - Market indices data
 * @param {Array} topGainers - Top gaining stocks
 * @param {Array} topLosers - Top losing stocks
 * @returns {string} - Market sentiment
 */
function determineMarketSentiment(indices, topGainers, topLosers) {
  let score = 0;

  // Index performance (weight: 40%)
  if (indices.nifty50 && indices.nifty50.pChange) {
    if (indices.nifty50.pChange > 1) score += 2;
    else if (indices.nifty50.pChange > 0) score += 1;
    else if (indices.nifty50.pChange < -1) score -= 2;
    else if (indices.nifty50.pChange < 0) score -= 1;
  }

  if (indices.sensex && indices.sensex.pChange) {
    if (indices.sensex.pChange > 1) score += 2;
    else if (indices.sensex.pChange > 0) score += 1;
    else if (indices.sensex.pChange < -1) score -= 2;
    else if (indices.sensex.pChange < 0) score -= 1;
  }

  // Gainers vs Losers ratio (weight: 30%)
  const gainersCount = topGainers.filter(g => g.pChange > 0).length;
  const losersCount = topLosers.filter(l => l.pChange < 0).length;
  const ratio = gainersCount / (losersCount || 1);

  if (ratio > 2) score += 2;
  else if (ratio > 1) score += 1;
  else if (ratio < 0.5) score -= 2;
  else if (ratio < 1) score -= 1;

  // VIX (weight: 30%)
  if (indices.indiaVIX && indices.indiaVIX.value) {
    if (indices.indiaVIX.value > 25) score -= 1; // High volatility is bearish
    else if (indices.indiaVIX.value < 15) score += 1; // Low volatility is bullish
  }

  // Determine sentiment
  if (score >= 4) return 'Very Bullish';
  else if (score >= 2) return 'Bullish';
  else if (score <= -4) return 'Very Bearish';
  else if (score <= -2) return 'Bearish';
  else return 'Neutral';
}

/**
 * Fetch FII/DII activity (simulated - real data requires NSE API or paid service)
 * In production, this should fetch from NSE or a reliable data provider
 * @returns {Object} - FII/DII activity data
 */
function getFIIDIIActivity() {
  // This is simulated data. In production, integrate with NSE API or data provider like:
  // - NSE India API (requires registration)
  // - MoneyControl API
  // - Economic Times API
  // For now, returning placeholder structure
  
  return {
    available: false,
    note: 'FII/DII data requires paid API subscription or NSE official API',
    fii: {
      net: null, // Net FII activity in Crores
      buy: null,
      sell: null
    },
    dii: {
      net: null, // Net DII activity in Crores
      buy: null,
      sell: null
    },
    date: new Date().toISOString().split('T')[0]
  };
}

/**
 * Calculate support and resistance for Nifty 50
 * @param {Object} niftyData - Nifty 50 current data
 * @param {Array} historicalPrices - Historical Nifty prices
 * @returns {Object} - Support and resistance levels
 */
function calculateNiftyLevels(niftyData, historicalPrices) {
  if (!niftyData || !historicalPrices || historicalPrices.length < 20) {
    return null;
  }

  const currentPrice = niftyData.value;
  const high = niftyData.high || Math.max(...historicalPrices.slice(-20));
  const low = niftyData.low || Math.min(...historicalPrices.slice(-20));

  // Calculate pivot points
  const pivot = (high + low + currentPrice) / 3;
  const resistance1 = (2 * pivot) - low;
  const support1 = (2 * pivot) - high;
  const resistance2 = pivot + (high - low);
  const support2 = pivot - (high - low);

  return {
    resistance2: Math.round(resistance2),
    resistance1: Math.round(resistance1),
    pivot: Math.round(pivot),
    support1: Math.round(support1),
    support2: Math.round(support2)
  };
}

/**
 * Get comprehensive market trends (with caching)
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} - Complete market trends data
 */
async function getMarketTrends(forceRefresh = false) {
  // Check cache
  if (!forceRefresh && trendsCache.data && trendsCache.timestamp) {
    const cacheAge = Date.now() - trendsCache.timestamp;
    if (cacheAge < trendsCache.ttl) {
      console.log('📊 Returning cached market trends');
      return trendsCache.data;
    }
  }

  console.log('📊 Fetching fresh market trends data...');

  try {
    // Fetch all data in parallel
    const [indices, gainersLosers, sectors, niftyHistorical] = await Promise.all([
      fetchAllIndices(),
      fetchTopGainersLosers(),
      fetchSectorPerformance(),
      fetchHistoricalPrices('^NSEI', 30) // Nifty 50 last 30 days
    ]);

    // Determine trend for each index
    const niftyTrend = indices.nifty50 ? 
      (indices.nifty50.pChange > 0 ? 'Bullish' : 'Bearish') : 'Unknown';
    const sensexTrend = indices.sensex ? 
      (indices.sensex.pChange > 0 ? 'Bullish' : 'Bearish') : 'Unknown';

    // Calculate Nifty levels
    const niftyLevels = indices.nifty50 && niftyHistorical.success ? 
      calculateNiftyLevels(indices.nifty50, niftyHistorical.prices) : null;

    // Determine overall sentiment
    const overallSentiment = determineMarketSentiment(
      indices,
      gainersLosers.topGainers,
      gainersLosers.topLosers
    );

    // Get FII/DII data
    const fiiDii = getFIIDIIActivity();

    const trendsData = {
      success: true,
      timestamp: new Date().toISOString(),
      
      // Indices
      nifty50: indices.nifty50 ? {
        ...indices.nifty50,
        trend: niftyTrend
      } : null,
      sensex: indices.sensex ? {
        ...indices.sensex,
        trend: sensexTrend
      } : null,
      bankNifty: indices.bankNifty,
      
      // Volatility
      vix: indices.indiaVIX ? indices.indiaVIX.value : null,
      vixChange: indices.indiaVIX ? indices.indiaVIX.change : null,
      vixTrend: indices.indiaVIX && indices.indiaVIX.value ? 
        (indices.indiaVIX.value > 20 ? 'High Volatility' : 
         indices.indiaVIX.value < 15 ? 'Low Volatility' : 'Moderate') : 'Unknown',
      
      // Market movers
      topGainers: gainersLosers.topGainers || [],
      topLosers: gainersLosers.topLosers || [],
      
      // Sectors
      sectors: sectors || [],
      topSector: sectors.length > 0 ? sectors[0].name : null,
      bottomSector: sectors.length > 0 ? sectors[sectors.length - 1].name : null,
      
      // Sentiment
      overallSentiment: overallSentiment,
      
      // Technical levels
      niftyLevels: niftyLevels,
      
      // FII/DII
      fii: fiiDii.fii,
      dii: fiiDii.dii,
      fiiDiiAvailable: fiiDii.available,
      
      // Historical performance
      nifty30dPerformance: niftyHistorical.success ? niftyHistorical.performance : null,
      
      // Cache info
      cached: false
    };

    // Update cache
    trendsCache = {
      data: trendsData,
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000 // 5 minutes
    };

    return trendsData;

  } catch (error) {
    console.error('Error fetching market trends:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Clear trends cache
 */
function clearTrendsCache() {
  trendsCache = {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000
  };
  console.log('📊 Market trends cache cleared');
}

/**
 * Get daily market summary (for AI context)
 * @returns {Promise<string>} - Text summary of market
 */
async function getDailyMarketSummary() {
  try {
    const trends = await getMarketTrends();
    
    if (!trends.success) {
      return 'Market data unavailable';
    }

    let summary = `Market Sentiment: ${trends.overallSentiment}. `;
    
    if (trends.nifty50) {
      summary += `Nifty 50 at ${trends.nifty50.value.toLocaleString()} (${trends.nifty50.pChange > 0 ? '+' : ''}${trends.nifty50.pChange}%). `;
    }
    
    if (trends.sensex) {
      summary += `Sensex at ${trends.sensex.value.toLocaleString()} (${trends.sensex.pChange > 0 ? '+' : ''}${trends.sensex.pChange}%). `;
    }
    
    if (trends.topSector) {
      summary += `Leading sector: ${trends.topSector}. `;
    }
    
    if (trends.vix) {
      summary += `India VIX: ${trends.vix} (${trends.vixTrend}). `;
    }
    
    if (trends.topGainers && trends.topGainers.length > 0) {
      const topGainer = trends.topGainers[0];
      summary += `Top gainer: ${topGainer.symbol} (+${topGainer.pChange}%). `;
    }

    return summary;
  } catch (error) {
    console.error('Error generating market summary:', error.message);
    return 'Market summary unavailable';
  }
}

module.exports = {
  getMarketTrends,
  fetchTopGainersLosers,
  fetchSectorPerformance,
  clearTrendsCache,
  getDailyMarketSummary,
  NIFTY50_STOCKS
};
