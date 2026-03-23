const axios = require('axios');

/**
 * Stock Price Service
 * Fetches real-time stock prices from Yahoo Finance API (more reliable than NSE direct)
 */

// Stock symbol mapping for NSE stocks to Yahoo Finance format
const SYMBOL_MAPPING = {
  // Map common company names to Yahoo Finance symbols (NSE stocks use .NS suffix)
  'RELIANCE': 'RELIANCE.NS',
  'TCS': 'TCS.NS',
  'INFY': 'INFY.NS',
  'INFOSYS': 'INFY.NS',
  'HDFC': 'HDFCBANK.NS',
  'HDFCBANK': 'HDFCBANK.NS',
  'ICICIBANK': 'ICICIBANK.NS',
  'SBIN': 'SBIN.NS',
  'SBI': 'SBIN.NS',
  'BHARTIARTL': 'BHARTIARTL.NS',
  'AIRTEL': 'BHARTIARTL.NS',
  'ITC': 'ITC.NS',
  'KOTAKBANK': 'KOTAKBANK.NS',
  'LT': 'LT.NS',
  'AXISBANK': 'AXISBANK.NS',
  'TATASTEEL': 'TATASTEEL.NS',
  'TATA STEEL': 'TATASTEEL.NS',
  'WIPRO': 'WIPRO.NS',
  'HINDUNILVR': 'HINDUNILVR.NS',
  'HUL': 'HINDUNILVR.NS',
  'MARUTI': 'MARUTI.NS',
  'SUNPHARMA': 'SUNPHARMA.NS',
  'TITAN': 'TITAN.NS',
  'ASIANPAINT': 'ASIANPAINT.NS',
  'NESTLEIND': 'NESTLEIND.NS',
  'ULTRACEMCO': 'ULTRACEMCO.NS',
  'BAJFINANCE': 'BAJFINANCE.NS',
  'BAJAJFINSV': 'BAJAJFINSV.NS',
  'ONGC': 'ONGC.NS',
  'NTPC': 'NTPC.NS',
  'POWERGRID': 'POWERGRID.NS',
  'M&M': 'M&M.NS',
  'TECHM': 'TECHM.NS'
};

/**
 * Extract stock symbol from stock name and convert to Yahoo Finance format
 * Tries to find symbol from the stock name
 */
function extractSymbol(stockName) {
  if (!stockName) return null;
  
  // Clean the stock name
  const cleanName = stockName.toUpperCase().trim();
  
  // Check if it's already in our mapping
  if (SYMBOL_MAPPING[cleanName]) {
    return SYMBOL_MAPPING[cleanName];
  }
  
  // Try to extract symbol from patterns like "RELIANCE-EQ", "TCS Ltd", etc.
  const patterns = [
    /^([A-Z]+)-/,           // Match "RELIANCE-EQ" -> "RELIANCE"
    /^([A-Z]+)\s/,          // Match "TCS Ltd" -> "TCS"
    /^([A-Z]+)$/,           // Match "RELIANCE" -> "RELIANCE"
  ];
  
  for (const pattern of patterns) {
    const match = cleanName.match(pattern);
    if (match && match[1]) {
      const symbol = match[1];
      if (SYMBOL_MAPPING[symbol]) {
        return SYMBOL_MAPPING[symbol];
      }
      // Add .NS suffix for NSE stocks if not already there
      return symbol.endsWith('.NS') ? symbol : `${symbol}.NS`;
    }
  }
  
  // If no pattern matches, return the first word with .NS suffix
  const firstWord = cleanName.split(/[\s-]/)[0];
  return firstWord ? (firstWord.endsWith('.NS') ? firstWord : `${firstWord}.NS`) : null;
}

/**
 * Fetch real-time stock price from Yahoo Finance
 * @param {string} symbol - Stock symbol in Yahoo Finance format (e.g., 'RELIANCE.NS', 'TCS.NS')
 * @returns {Promise<Object>} - Stock price data
 */
async function fetchStockPrice(symbol) {
  if (!symbol) {
    throw new Error('Stock symbol is required');
  }

  // Don't add .NS suffix to index symbols (^NSEI, ^BSESN, ^NSEBANK, etc.)
  // Only add .NS suffix to regular stock symbols
  let yahooSymbol = symbol;
  if (!symbol.startsWith('^') && !symbol.endsWith('.NS')) {
    yahooSymbol = `${symbol}.NS`;
  }
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`;

  try {
    const response = await axios.get(url, {
      params: {
        interval: '1d',
        range: '1d'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    if (!response.data || !response.data.chart || !response.data.chart.result || !response.data.chart.result[0]) {
      throw new Error('Invalid response from Yahoo Finance API');
    }

    const result = response.data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];

    const lastPrice = meta.regularMarketPrice || 0;
    const previousClose = meta.previousClose || meta.chartPreviousClose || 0;
    const change = lastPrice - previousClose;
    const pChange = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      success: true,
      symbol: yahooSymbol,
      companyName: meta.symbol || yahooSymbol,
      lastPrice: parseFloat(lastPrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      pChange: parseFloat(pChange.toFixed(2)),
      previousClose: parseFloat(previousClose.toFixed(2)),
      open: parseFloat((quote.open?.[0] || 0).toFixed(2)),
      close: parseFloat((quote.close?.[quote.close.length - 1] || lastPrice).toFixed(2)),
      high: parseFloat((quote.high?.[0] || 0).toFixed(2)),
      low: parseFloat((quote.low?.[0] || 0).toFixed(2)),
      volume: quote.volume?.[0] || 0,
      lastUpdated: new Date().toISOString(),
      source: 'Yahoo Finance'
    };

  } catch (error) {
    console.error(`Error fetching price for ${yahooSymbol}:`, error.message);
    
    // Return error but don't throw, so we can continue with other stocks
    return {
      success: false,
      symbol: yahooSymbol,
      error: error.message,
      lastPrice: null
    };
  }
}

/**
 * Fetch prices for multiple stocks in parallel
 * @param {Array<string>} symbols - Array of NSE stock symbols
 * @returns {Promise<Object>} - Map of symbol to price data
 */
async function fetchMultipleStockPrices(symbols) {
  if (!symbols || symbols.length === 0) {
    return {};
  }

  // Remove duplicates
  const uniqueSymbols = [...new Set(symbols)];

  // Fetch all prices in parallel with a small delay between requests
  const pricePromises = uniqueSymbols.map((symbol, index) => {
    // Add delay to avoid rate limiting
    return new Promise(resolve => {
      setTimeout(async () => {
        const priceData = await fetchStockPrice(symbol);
        resolve({ symbol, data: priceData });
      }, index * 200); // 200ms delay between each request
    });
  });

  const results = await Promise.all(pricePromises);

  // Convert array to map
  const priceMap = {};
  results.forEach(({ symbol, data }) => {
    priceMap[symbol] = data;
  });

  return priceMap;
}

/**
 * Get real-time price for a stock by name
 * Attempts to extract symbol from stock name and fetch price
 */
async function getStockPriceByName(stockName) {
  const symbol = extractSymbol(stockName);
  
  if (!symbol) {
    return {
      success: false,
      error: 'Could not extract stock symbol from name',
      stockName,
      lastPrice: null
    };
  }

  return await fetchStockPrice(symbol);
}

/**
 * Fetch historical stock prices from Yahoo Finance
 * @param {string} symbol - Stock symbol in Yahoo Finance format (e.g., 'RELIANCE.NS')
 * @param {number} days - Number of days of historical data (30, 90, 252 for 1 year, 365)
 * @returns {Promise<Object>} - Historical price data
 */
async function fetchHistoricalPrices(symbol, days = 90) {
  if (!symbol) {
    throw new Error('Stock symbol is required');
  }

  // Ensure symbol has .NS suffix for NSE stocks
  const yahooSymbol = symbol.endsWith('.NS') ? symbol : `${symbol}.NS`;
  
  // Calculate date range
  const endDate = Math.floor(Date.now() / 1000); // Current time in seconds
  const startDate = endDate - (days * 24 * 60 * 60); // days ago in seconds

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`;

  try {
    const response = await axios.get(url, {
      params: {
        period1: startDate,
        period2: endDate,
        interval: '1d',
        events: 'history'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });

    if (!response.data || !response.data.chart || !response.data.chart.result || !response.data.chart.result[0]) {
      throw new Error('Invalid response from Yahoo Finance API');
    }

    const result = response.data.chart.result[0];
    const timestamps = result.timestamp || [];
    const quote = result.indicators.quote[0];
    
    // Extract closing prices
    const closingPrices = quote.close.filter(price => price !== null && !isNaN(price));
    
    // Calculate performance metrics
    const currentPrice = closingPrices[closingPrices.length - 1];
    const startPrice = closingPrices[0];
    const performance = ((currentPrice - startPrice) / startPrice) * 100;
    
    // Find 52-week high and low (if enough data)
    const high52week = Math.max(...closingPrices);
    const low52week = Math.min(...closingPrices);

    return {
      success: true,
      symbol: yahooSymbol,
      days: days,
      prices: closingPrices,
      dates: timestamps.map(ts => new Date(ts * 1000).toISOString().split('T')[0]),
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      startPrice: parseFloat(startPrice.toFixed(2)),
      performance: parseFloat(performance.toFixed(2)),
      high52week: parseFloat(high52week.toFixed(2)),
      low52week: parseFloat(low52week.toFixed(2)),
      dataPoints: closingPrices.length
    };

  } catch (error) {
    console.error(`Error fetching historical prices for ${yahooSymbol}:`, error.message);
    return {
      success: false,
      symbol: yahooSymbol,
      error: error.message,
      prices: []
    };
  }
}

/**
 * Fetch Nifty 50 index data
 * @returns {Promise<Object>} - Nifty 50 index data
 */
async function fetchNifty50() {
  return await fetchStockPrice('^NSEI'); // Yahoo Finance symbol for Nifty 50
}

/**
 * Fetch Sensex index data
 * @returns {Promise<Object>} - Sensex index data
 */
async function fetchSensex() {
  return await fetchStockPrice('^BSESN'); // Yahoo Finance symbol for Sensex
}

/**
 * Fetch Bank Nifty index data
 * @returns {Promise<Object>} - Bank Nifty index data
 */
async function fetchBankNifty() {
  return await fetchStockPrice('^NSEBANK'); // Yahoo Finance symbol for Bank Nifty
}

/**
 * Fetch India VIX (Volatility Index)
 * @returns {Promise<Object>} - India VIX data
 */
async function fetchIndiaVIX() {
  return await fetchStockPrice('INDIA VIX'); // Yahoo Finance symbol for India VIX
}

/**
 * Fetch all major indices at once
 * @returns {Promise<Object>} - All indices data
 */
async function fetchAllIndices() {
  try {
    const [nifty50, sensex, bankNifty, indiaVIX] = await Promise.all([
      fetchNifty50(),
      fetchSensex(),
      fetchBankNifty(),
      fetchIndiaVIX()
    ]);

    return {
      success: true,
      nifty50: nifty50.success ? {
        value: nifty50.lastPrice,
        change: nifty50.change,
        pChange: nifty50.pChange,
        high: nifty50.high,
        low: nifty50.low
      } : null,
      sensex: sensex.success ? {
        value: sensex.lastPrice,
        change: sensex.change,
        pChange: sensex.pChange,
        high: sensex.high,
        low: sensex.low
      } : null,
      bankNifty: bankNifty.success ? {
        value: bankNifty.lastPrice,
        change: bankNifty.change,
        pChange: bankNifty.pChange
      } : null,
      indiaVIX: indiaVIX.success ? {
        value: indiaVIX.lastPrice,
        change: indiaVIX.change
      } : null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching indices:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  fetchStockPrice,
  fetchMultipleStockPrices,
  getStockPriceByName,
  extractSymbol,
  SYMBOL_MAPPING,
  fetchHistoricalPrices,
  fetchNifty50,
  fetchSensex,
  fetchBankNifty,
  fetchIndiaVIX,
  fetchAllIndices
};
