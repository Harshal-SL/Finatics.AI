const { fetchMarketNews } = require('./newsService');
const { getMarketTrends } = require('./marketTrendsService');
const { fetchStockPrice } = require('./nseStockService');

/**
 * Market Data Cache Service - OPTIMIZED VERSION
 * Pre-fetches and caches all market data to reduce API calls
 * Refreshes automatically every 30 minutes
 * Reduces chatbot API calls from 50+ to just 1 per query
 */

// Global market data cache
let marketDataCache = {
  news: [],
  trends: null,
  nifty50: null,
  sensex: null,
  lastUpdate: null,
  isInitialized: false
};

/**
 * Refresh market data cache
 * NO Gemini API calls - only Yahoo Finance & RSS feeds
 */
async function refreshMarketDataCache() {
  try {
    console.log('📊 Refreshing market data cache...');
    
    const startTime = Date.now();
    
    // Fetch all data in parallel (NO Gemini API calls)
    const [newsResult, trendsResult, niftyResult, sensexResult] = await Promise.allSettled([
      fetchMarketNews(['moneycontrol', 'economictimes']).catch(err => {
        console.error('News fetch error:', err.message);
        return { success: false, articles: [] };
      }),
      getMarketTrends().catch(err => {
        console.error('Trends fetch error:', err.message);
        return { success: false };
      }),
      fetchStockPrice('^NSEI').catch(err => {
        console.error('Nifty fetch error:', err.message);
        return { success: false };
      }),
      fetchStockPrice('^BSESN').catch(err => {
        console.error('Sensex fetch error:', err.message);
        return { success: false };
      })
    ]);
    
    // Update cache with successful results
    if (newsResult.status === 'fulfilled' && newsResult.value.success) {
      marketDataCache.news = newsResult.value.articles || [];
    } else {
      console.warn('⚠️ News fetch failed, keeping old cache');
    }
    
    if (trendsResult.status === 'fulfilled' && trendsResult.value.success) {
      marketDataCache.trends = trendsResult.value;
    } else {
      console.warn('⚠️ Trends fetch failed, keeping old cache');
    }
    
    if (niftyResult.status === 'fulfilled' && niftyResult.value.success) {
      marketDataCache.nifty50 = niftyResult.value;
    }
    
    if (sensexResult.status === 'fulfilled' && sensexResult.value.success) {
      marketDataCache.sensex = sensexResult.value;
    }
    
    marketDataCache.lastUpdate = new Date();
    marketDataCache.isInitialized = true;
    
    const duration = Date.now() - startTime;
    console.log(`✅ Market data cached in ${duration}ms:`);
    console.log(`   - News articles: ${marketDataCache.news.length}`);
    console.log(`   - Trends: ${marketDataCache.trends ? 'Yes' : 'No'}`);
    console.log(`   - Nifty 50: ${marketDataCache.nifty50 ? marketDataCache.nifty50.lastPrice : 'N/A'}`);
    console.log(`   - Sensex: ${marketDataCache.sensex ? marketDataCache.sensex.lastPrice : 'N/A'}`);
    
  } catch (error) {
    console.error('❌ Error refreshing market data cache:', error.message);
  }
}

/**
 * Get cached market data
 */
function getMarketDataCache() {
  return {
    ...marketDataCache,
    cacheAge: marketDataCache.lastUpdate 
      ? Math.floor((Date.now() - marketDataCache.lastUpdate.getTime()) / 1000 / 60) 
      : null // Age in minutes
  };
}

/**
 * Check if cache needs refresh
 */
function needsRefresh() {
  if (!marketDataCache.lastUpdate) return true;
  const ageMinutes = (Date.now() - marketDataCache.lastUpdate.getTime()) / 1000 / 60;
  return ageMinutes > 30;
}

/**
 * Initialize cache service
 */
function initializeCacheService() {
  console.log('🚀 Initializing Market Data Cache Service...');
  
  // Initial cache load
  refreshMarketDataCache().catch(err => {
    console.error('❌ Initial cache load failed:', err.message);
  });
  
  // Auto-refresh every 30 minutes
  setInterval(() => {
    console.log('⏰ Auto-refresh triggered (30 min interval)');
    refreshMarketDataCache().catch(err => {
      console.error('❌ Auto-refresh failed:', err.message);
    });
  }, 30 * 60 * 1000);
  
  console.log('✅ Cache service initialized (30 min refresh interval)');
}

module.exports = {
  initializeCacheService,
  refreshMarketDataCache,
  getMarketDataCache,
  needsRefresh
};
