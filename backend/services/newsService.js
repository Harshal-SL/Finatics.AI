const Parser = require('rss-parser');
const parser = new Parser();

/**
 * Indian Stock Market News Service
 * Fetches news from RSS feeds (MoneyControl, Economic Times, Live Mint, Business Standard)
 * Pattern matches existing nseStockService.js
 */

// Gemini API configuration for sentiment analysis
const GCP_GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// RSS Feed Configuration for Indian Financial News
const RSS_FEEDS = {
  moneycontrol: {
    markets: 'https://www.moneycontrol.com/rss/marketreports.xml',
    news: 'https://www.moneycontrol.com/rss/marketnews.xml',
    business: 'https://www.moneycontrol.com/rss/business.xml',
    ipo: 'https://www.moneycontrol.com/rss/ipo.xml',
    mutualfunds: 'https://www.moneycontrol.com/rss/mutualfunds.xml'
  },
  economictimes: {
    markets: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
    stocks: 'https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms',
    ipo: 'https://economictimes.indiatimes.com/markets/ipo/rssfeeds/67812657.cms',
    commodities: 'https://economictimes.indiatimes.com/markets/commodities/rssfeeds/1808152121.cms'
  },
  livemint: {
    markets: 'https://www.livemint.com/rss/markets',
    money: 'https://www.livemint.com/rss/money',
    companies: 'https://www.livemint.com/rss/companies'
  },
  businessstandard: {
    markets: 'https://www.business-standard.com/rss/markets-106.rss',
    finance: 'https://www.business-standard.com/rss/finance-103.rss'
  }
};

// In-memory cache (15-minute TTL to avoid excessive RSS polling)
const newsCache = {
  data: null,
  timestamp: null,
  ttl: 15 * 60 * 1000 // 15 minutes
};

/**
 * Fetch news from a single RSS feed
 * @param {string} feedUrl - RSS feed URL
 * @param {string} sourceName - Source name (e.g., 'moneycontrol')
 * @param {string} category - Category name (e.g., 'markets')
 * @returns {Object} Feed result with articles
 */
async function fetchSingleFeed(feedUrl, sourceName, category) {
  try {
    const feed = await parser.parseURL(feedUrl);
    
    const articles = feed.items.slice(0, 15).map(item => ({
      title: item.title || 'No title',
      link: item.link || '',
      pubDate: item.pubDate || new Date().toISOString(),
      description: item.contentSnippet || item.summary || item.content || '',
      source: sourceName,
      category: category,
      guid: item.guid || item.link
    }));

    return {
      success: true,
      source: sourceName,
      category: category,
      articles: articles,
      feedTitle: feed.title || sourceName
    };

  } catch (error) {
    console.error(`Error fetching ${sourceName} ${category}:`, error.message);
    return {
      success: false,
      source: sourceName,
      category: category,
      error: error.message,
      articles: []
    };
  }
}

/**
 * Fetch market news from multiple RSS sources
 * Implements rate limiting similar to nseStockService.js
 * @param {Array<string>} sources - Array of source names to fetch from
 * @returns {Object} Aggregated news from all sources
 */
async function fetchMarketNews(sources = ['moneycontrol', 'economictimes']) {
  try {
    // Build feed list from selected sources
    const feedList = [];
    sources.forEach(source => {
      const feeds = RSS_FEEDS[source];
      if (feeds) {
        Object.entries(feeds).forEach(([category, url]) => {
          feedList.push({ source, category, url });
        });
      }
    });

    if (feedList.length === 0) {
      return {
        success: false,
        error: 'No valid sources provided',
        articles: []
      };
    }

    // Fetch all feeds in parallel with staggered delays (polite scraping)
    const newsPromises = feedList.map((feed, index) => {
      return new Promise(resolve => {
        setTimeout(async () => {
          const result = await fetchSingleFeed(feed.url, feed.source, feed.category);
          resolve(result);
        }, index * 300); // 300ms delay between each request
      });
    });

    const results = await Promise.all(newsPromises);

    // Aggregate all articles
    const allArticles = [];
    results.forEach(result => {
      if (result.success) {
        allArticles.push(...result.articles);
      }
    });

    // Remove duplicates based on title similarity
    const uniqueArticles = removeDuplicates(allArticles);

    // Sort by date (newest first)
    uniqueArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    return {
      success: true,
      totalArticles: uniqueArticles.length,
      articles: uniqueArticles.slice(0, 100), // Top 100 latest articles
      sources: results.map(r => ({
        source: r.source,
        category: r.category,
        success: r.success,
        articleCount: r.articles.length
      })),
      fetchedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching market news:', error.message);
    return {
      success: false,
      error: error.message,
      articles: [],
      fetchedAt: new Date().toISOString()
    };
  }
}

/**
 * Get cached news or fetch fresh if expired
 * @param {Array<string>} sources - Array of source names
 * @returns {Object} News data (cached or fresh)
 */
async function getCachedMarketNews(sources = ['moneycontrol', 'economictimes']) {
  const now = Date.now();

  // Check cache validity
  if (newsCache.data && newsCache.timestamp &&
      (now - newsCache.timestamp) < newsCache.ttl) {
    const cacheAge = Math.round((now - newsCache.timestamp) / 1000);
    console.log(`📰 Returning cached news (age: ${cacheAge}s)`);
    return {
      ...newsCache.data,
      cached: true,
      cacheAge: cacheAge
    };
  }

  // Fetch fresh data
  console.log('📰 Fetching fresh market news from RSS feeds...');
  const freshNews = await fetchMarketNews(sources);

  // Update cache if successful
  if (freshNews.success) {
    newsCache.data = freshNews;
    newsCache.timestamp = now;
  }

  return {
    ...freshNews,
    cached: false
  };
}

/**
 * Search news by keywords
 * @param {Array<Object>} articles - Array of news articles
 * @param {Array<string>} keywords - Keywords to search for
 * @returns {Array<Object>} Filtered articles
 */
function searchNews(articles, keywords) {
  if (!keywords || keywords.length === 0) {
    return articles;
  }

  const keywordLower = keywords.map(k => k.toLowerCase());

  return articles.filter(article => {
    const text = `${article.title} ${article.description}`.toLowerCase();
    return keywordLower.some(keyword => text.includes(keyword));
  });
}

/**
 * Get company-specific news
 * @param {string} companyName - Company name or stock symbol
 * @returns {Object} Filtered news for the company
 */
async function getCompanyNews(companyName) {
  try {
    const allNews = await getCachedMarketNews();
    
    if (!allNews.success) {
      return {
        success: false,
        error: 'Failed to fetch news',
        articles: []
      };
    }

    const filtered = searchNews(allNews.articles, [companyName]);

    return {
      success: true,
      company: companyName,
      totalArticles: filtered.length,
      articles: filtered,
      fetchedAt: allNews.fetchedAt,
      cached: allNews.cached
    };
  } catch (error) {
    console.error(`Error getting company news for ${companyName}:`, error.message);
    return {
      success: false,
      error: error.message,
      articles: []
    };
  }
}

/**
 * Get top headlines (most recent articles)
 * @param {number} limit - Number of headlines to return
 * @returns {Object} Top headlines
 */
async function getTopHeadlines(limit = 10) {
  try {
    const allNews = await getCachedMarketNews();
    
    if (!allNews.success) {
      return {
        success: false,
        error: 'Failed to fetch news',
        articles: []
      };
    }

    return {
      success: true,
      totalArticles: allNews.articles.slice(0, limit).length,
      articles: allNews.articles.slice(0, limit),
      fetchedAt: allNews.fetchedAt,
      cached: allNews.cached
    };
  } catch (error) {
    console.error('Error getting top headlines:', error.message);
    return {
      success: false,
      error: error.message,
      articles: []
    };
  }
}

/**
 * Get news by category
 * @param {string} category - Category name (e.g., 'markets', 'ipo', 'commodities')
 * @returns {Object} Filtered news by category
 */
async function getNewsByCategory(category) {
  try {
    const allNews = await getCachedMarketNews(['moneycontrol', 'economictimes', 'livemint', 'businessstandard']);
    
    if (!allNews.success) {
      return {
        success: false,
        error: 'Failed to fetch news',
        articles: []
      };
    }

    const filtered = allNews.articles.filter(article => 
      article.category.toLowerCase() === category.toLowerCase()
    );

    return {
      success: true,
      category: category,
      totalArticles: filtered.length,
      articles: filtered,
      fetchedAt: allNews.fetchedAt,
      cached: allNews.cached
    };
  } catch (error) {
    console.error(`Error getting news for category ${category}:`, error.message);
    return {
      success: false,
      error: error.message,
      articles: []
    };
  }
}

/**
 * Remove duplicate articles based on title similarity
 * @param {Array<Object>} articles - Array of articles
 * @returns {Array<Object>} Unique articles
 */
function removeDuplicates(articles) {
  const seen = new Map();
  const unique = [];

  articles.forEach(article => {
    // Normalize title for comparison
    const normalizedTitle = article.title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!seen.has(normalizedTitle)) {
      seen.set(normalizedTitle, true);
      unique.push(article);
    }
  });

  return unique;
}

/**
 * Get news summary for AI chatbot context
 * Returns condensed news suitable for AI prompts
 * @param {number} limit - Number of articles to include
 * @returns {Object} News summary
 */
async function getNewsSummaryForAI(limit = 15) {
  try {
    const allNews = await getCachedMarketNews();
    
    if (!allNews.success || !allNews.articles || allNews.articles.length === 0) {
      return {
        success: false,
        summary: 'No recent market news available.',
        articles: []
      };
    }

    const topArticles = allNews.articles.slice(0, limit);
    
    // Create concise summary for AI
    const summaryText = topArticles.map((article, index) => 
      `${index + 1}. ${article.title} (${article.source})`
    ).join('\n');

    return {
      success: true,
      summary: summaryText,
      articles: topArticles.map(a => ({
        title: a.title,
        source: a.source,
        link: a.link,
        pubDate: a.pubDate
      })),
      totalCount: topArticles.length,
      fetchedAt: allNews.fetchedAt
    };
  } catch (error) {
    console.error('Error getting news summary for AI:', error.message);
    return {
      success: false,
      summary: 'Unable to fetch recent market news.',
      articles: []
    };
  }
}

/**
 * Analyze news sentiment using Gemini AI
 * @param {string} newsTitle - News article title
 * @param {string} newsDescription - News article description
 * @returns {Promise<Object>} - Sentiment analysis result
 */
async function analyzeNewsSentiment(newsTitle, newsDescription) {
  try {
    const apiKey = process.env.GEMINI_CHATBOT_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { sentiment: 'Neutral', confidence: 0, impact: 'Low', error: 'API key not configured' };
    }

    const prompt = `Analyze the sentiment and market impact of this financial news:

Title: ${newsTitle}
Description: ${newsDescription}

Provide analysis in this exact JSON format only (no extra text):
{
  "sentiment": "Positive|Negative|Neutral",
  "confidence": 0-100,
  "impact": "High|Medium|Low",
      reason: "brief one-line explanation"
}`;

    const url = `${GCP_GEMINI_BASE}/models/gemini-2.0-flash-exp:generateContent?key=${encodeURIComponent(apiKey)}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 150
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          sentiment: result.sentiment || 'Neutral',
          confidence: result.confidence || 50,
          impact: result.impact || 'Low',
          reason: result.reason || 'Analysis completed'
        };
      }
    }

    return { sentiment: 'Neutral', confidence: 50, impact: 'Low', reason: 'Unable to analyze' };
  } catch (error) {
    console.error('Sentiment analysis error:', error.message);
    return { sentiment: 'Neutral', confidence: 0, impact: 'Low', error: error.message };
  }
}

/**
 * Batch analyze sentiment for multiple news articles
 * WITH RATE LIMITING TO PREVENT RPM ISSUES
 * @param {Array<Object>} articles - Array of news articles
 * @param {number} maxArticles - Maximum articles to analyze (default: 5, max: 10)
 * @returns {Promise<Array>} - Articles with sentiment analysis
 */
async function batchAnalyzeSentiment(articles, maxArticles = 5) {
  // LIMIT to max 5 articles to prevent RPM issues
  maxArticles = Math.min(maxArticles, 5);
  const articlesToAnalyze = articles.slice(0, maxArticles);
  
  console.log(`📊 Analyzing sentiment for ${articlesToAnalyze.length} articles (RPM-optimized)`);
  
  const enrichedArticles = await Promise.all(
    articlesToAnalyze.map(async (article, index) => {
      // Add 1 second delay to avoid rate limiting (was 500ms, now 1000ms)
      await new Promise(resolve => setTimeout(resolve, index * 1000));
      
      const sentiment = await analyzeNewsSentiment(article.title, article.description);
      
      return {
        ...article,
        sentiment: sentiment.sentiment,
        sentimentConfidence: sentiment.confidence,
        impact: sentiment.impact,
        impactReason: sentiment.reason
      };
    })
  );

  return enrichedArticles;
}

/**
 * Get top news with sentiment analysis
 * OPTIMIZED: Reduced from 10 to 3 articles to cut RPM
 * @param {number} limit - Number of articles to return (max: 5)
 * @param {boolean} includeSentiment - Whether to include AI sentiment analysis
 * @returns {Promise<Object>} - News with sentiment
 */
async function getTopNewsWithSentiment(limit = 3, includeSentiment = false) {
  try {
    // FORCE LIMIT to max 3 to reduce API calls
    limit = Math.min(limit, 3);
    
    const news = await getTopHeadlines(limit * 2); // Fetch more for filtering
    
    if (!news.success || news.articles.length === 0) {
      return { success: false, articles: [], error: 'No news available' };
    }

    let articles = news.articles.slice(0, limit);

    // DISABLE sentiment analysis by default to save API calls
    if (includeSentiment) {
      console.log('⚠️ Sentiment analysis enabled - will use additional API calls');
      articles = await batchAnalyzeSentiment(articles, limit);
    } else {
      console.log('⚡ Sentiment analysis skipped - saving API quota');
    }

    return {
      success: true,
      articles: articles,
      totalCount: articles.length,
      sentimentAnalyzed: includeSentiment,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting news with sentiment:', error.message);
    return { success: false, articles: [], error: error.message };
  }
}

/**
 * Get high-impact news only (filtered by AI)
 * @param {number} limit - Number of articles
 * @returns {Promise<Object>} - High-impact news
 */
async function getHighImpactNews(limit = 5) {
  try {
    const news = await getTopNewsWithSentiment(limit * 3, true);
    
    if (!news.success) {
      return news;
    }

    // Filter for high and medium impact news
    const highImpactArticles = news.articles
      .filter(article => article.impact === 'High' || article.impact === 'Medium')
      .slice(0, limit);

    return {
      success: true,
      articles: highImpactArticles,
      totalCount: highImpactArticles.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting high-impact news:', error.message);
    return { success: false, articles: [], error: error.message };
  }
}

/**
 * Correlate news with stock price movements
 * @param {string} companyName - Company name
 * @param {Object} stockData - Current stock price data
 * @returns {Promise<Object>} - News correlated with price movement
 */
async function correlateNewsWithStock(companyName, stockData) {
  try {
    const companyNews = await getCompanyNews(companyName);
    
    if (!companyNews.success || companyNews.articles.length === 0) {
      return {
        success: false,
        message: 'No recent news found for this company',
        articles: []
      };
    }

    // Analyze sentiment for company-specific news
    const articlesWithSentiment = await batchAnalyzeSentiment(companyNews.articles, 5);

    // Correlate with stock movement
    const correlation = {
      stockMovement: stockData.pChange > 0 ? 'Positive' : stockData.pChange < 0 ? 'Negative' : 'Neutral',
      priceChange: `${stockData.pChange > 0 ? '+' : ''}${stockData.pChange}%`,
      newsSentiment: articlesWithSentiment.length > 0 ? articlesWithSentiment[0].sentiment : 'Unknown',
      isAligned: false
    };

    // Check if news sentiment aligns with stock movement
    if (
      (correlation.stockMovement === 'Positive' && correlation.newsSentiment === 'Positive') ||
      (correlation.stockMovement === 'Negative' && correlation.newsSentiment === 'Negative')
    ) {
      correlation.isAligned = true;
      correlation.note = 'News sentiment aligns with stock price movement';
    } else if (correlation.stockMovement === 'Neutral') {
      correlation.note = 'Stock showing minimal movement';
    } else {
      correlation.note = 'News sentiment diverges from stock movement - investigate further';
    }

    return {
      success: true,
      company: companyName,
      stockData: stockData,
      correlation: correlation,
      recentNews: articlesWithSentiment,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error correlating news with stock:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Clear news cache (useful for testing or force refresh)
 */
function clearCache() {
  newsCache.data = null;
  newsCache.timestamp = null;
  console.log('📰 News cache cleared');
}

module.exports = {
  fetchMarketNews,
  getCachedMarketNews,
  searchNews,
  getCompanyNews,
  getTopHeadlines,
  getNewsByCategory,
  getNewsSummaryForAI,
  analyzeNewsSentiment,
  batchAnalyzeSentiment,
  getTopNewsWithSentiment,
  getHighImpactNews,
  correlateNewsWithStock,
  clearCache
};
