const newsService = require('../services/newsService');

/**
 * News Controller
 * Handles API requests for Indian stock market and finance news
 */

/**
 * Get all market news from multiple sources
 * GET /api/news/markets
 */
async function getMarketNews(req, res) {
  try {
    const { sources, limit } = req.query;
    
    // Parse sources parameter (comma-separated)
    const sourcesArray = sources 
      ? sources.split(',').map(s => s.trim())
      : ['moneycontrol', 'economictimes'];

    const news = await newsService.getCachedMarketNews(sourcesArray);

    if (!news.success) {
      return res.status(500).json({
        success: false,
        error: news.error || 'Failed to fetch market news',
        articles: []
      });
    }

    // Apply limit if specified
    const limitNum = limit ? parseInt(limit) : news.articles.length;
    const articles = news.articles.slice(0, limitNum);

    res.json({
      success: true,
      totalArticles: articles.length,
      articles: articles,
      sources: news.sources,
      fetchedAt: news.fetchedAt,
      cached: news.cached,
      cacheAge: news.cacheAge
    });

  } catch (error) {
    console.error('Error in getMarketNews:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      articles: []
    });
  }
}

/**
 * Get top headlines
 * GET /api/news/headlines
 */
async function getTopHeadlines(req, res) {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    const headlines = await newsService.getTopHeadlines(limitNum);

    if (!headlines.success) {
      return res.status(500).json({
        success: false,
        error: headlines.error || 'Failed to fetch headlines',
        articles: []
      });
    }

    res.json({
      success: true,
      totalArticles: headlines.articles.length,
      articles: headlines.articles,
      fetchedAt: headlines.fetchedAt,
      cached: headlines.cached
    });

  } catch (error) {
    console.error('Error in getTopHeadlines:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      articles: []
    });
  }
}

/**
 * Get company-specific news
 * GET /api/news/company/:companyName
 */
async function getCompanyNews(req, res) {
  try {
    const { companyName } = req.params;

    if (!companyName) {
      return res.status(400).json({
        success: false,
        error: 'Company name is required',
        articles: []
      });
    }

    const companyNews = await newsService.getCompanyNews(companyName);

    if (!companyNews.success) {
      return res.status(500).json({
        success: false,
        error: companyNews.error || 'Failed to fetch company news',
        articles: []
      });
    }

    res.json({
      success: true,
      company: companyName,
      totalArticles: companyNews.articles.length,
      articles: companyNews.articles,
      fetchedAt: companyNews.fetchedAt,
      cached: companyNews.cached
    });

  } catch (error) {
    console.error('Error in getCompanyNews:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      articles: []
    });
  }
}

/**
 * Get news by category
 * GET /api/news/category/:category
 */
async function getNewsByCategory(req, res) {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required',
        articles: []
      });
    }

    const categoryNews = await newsService.getNewsByCategory(category);

    if (!categoryNews.success) {
      return res.status(500).json({
        success: false,
        error: categoryNews.error || 'Failed to fetch category news',
        articles: []
      });
    }

    res.json({
      success: true,
      category: category,
      totalArticles: categoryNews.articles.length,
      articles: categoryNews.articles,
      fetchedAt: categoryNews.fetchedAt,
      cached: categoryNews.cached
    });

  } catch (error) {
    console.error('Error in getNewsByCategory:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      articles: []
    });
  }
}

/**
 * Search news by keywords
 * GET /api/news/search?q=keyword1,keyword2
 */
async function searchNews(req, res) {
  try {
    const { q, limit } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query (q) is required',
        articles: []
      });
    }

    // Get all news
    const allNews = await newsService.getCachedMarketNews(['moneycontrol', 'economictimes', 'livemint', 'businessstandard']);

    if (!allNews.success) {
      return res.status(500).json({
        success: false,
        error: allNews.error || 'Failed to fetch news',
        articles: []
      });
    }

    // Parse keywords (comma-separated)
    const keywords = q.split(',').map(k => k.trim());

    // Search articles
    const filtered = newsService.searchNews(allNews.articles, keywords);

    // Apply limit if specified
    const limitNum = limit ? parseInt(limit) : filtered.length;
    const articles = filtered.slice(0, limitNum);

    res.json({
      success: true,
      query: keywords,
      totalArticles: articles.length,
      articles: articles,
      fetchedAt: allNews.fetchedAt,
      cached: allNews.cached
    });

  } catch (error) {
    console.error('Error in searchNews:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      articles: []
    });
  }
}

/**
 * Clear news cache
 * POST /api/news/cache/clear
 */
async function clearCache(req, res) {
  try {
    newsService.clearCache();
    
    res.json({
      success: true,
      message: 'News cache cleared successfully'
    });

  } catch (error) {
    console.error('Error in clearCache:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getMarketNews,
  getTopHeadlines,
  getCompanyNews,
  getNewsByCategory,
  searchNews,
  clearCache
};
