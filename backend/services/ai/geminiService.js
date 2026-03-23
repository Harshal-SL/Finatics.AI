const GCP_GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Simple Gemini API client using fetch (avoids ESM import issues)
 * Ensure GEMINI_API_KEY is set in environment.
 */
const callGemini = async ({ model = 'models/gemini-1.5-flash-latest', prompt }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment');
  }

  const tryModels = [
    model,
    'models/gemini-1.5-flash',
    'models/gemini-1.5-flash-8b-latest',
    'models/gemini-1.5-flash-8b'
  ];

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1024
    }
  };

  let lastErrorText = '';
  for (const m of tryModels) {
    const url = `${GCP_GEMINI_BASE}/${m}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) return text;
      lastErrorText = 'Empty response from Gemini';
      continue;
    } else {
      const text = await res.text().catch(() => '');
      lastErrorText = `Gemini API error: ${res.status} ${res.statusText} ${text}`;
      // If NOT_FOUND, try next model
      if (res.status === 404) continue;
      // For other errors (e.g., 401/429/500), break early
      break;
    }
  }
  throw new Error(lastErrorText || 'Gemini API error');
};

/**
 * Get AI-powered market insights from Gemini AI
 * @returns {Promise<Object>} Market insights with analysis
 */
async function getMarketInsights() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured, using fallback insights');
      return getFallbackInsights();
    }

    // Get current timestamp for analysis
    const currentDate = new Date();
    const timestamp = currentDate.toISOString();
    
    // Calculate end of current week (Saturday)
    const endOfWeek = new Date(currentDate);
    endOfWeek.setDate(currentDate.getDate() + (6 - currentDate.getDay()));
    const weekEndingDate = endOfWeek.toISOString().split('T')[0];

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are an expert financial analyst AI. Your task is to provide the top 5 AI-driven insights for the Indian stock market (Nifty 50, Sensex) for the week ending on this timestamp: ${timestamp}. Base your insights on technical patterns, market sentiment, and quantitative data for that specific week. Fill all fields in the provided JSON schema.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            analysis_week_ending: {
              type: "STRING",
              description: "The date of the end of the week you are analyzing, in YYYY-MM-DD format."
            },
            market_summary: {
              type: "STRING",
              description: "A brief 1-2 sentence overview of the market's performance and key events for that week."
            },
            insights: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  id: {
                    type: "INTEGER",
                    description: "A unique ID for the insight, from 1 to 5."
                  },
                  type: {
                    type: "STRING",
                    description: "The category of the insight. Must be one of: [Sentiment, Technical, Quantitative, Sectoral]"
                  },
                  title: {
                    type: "STRING",
                    description: "A concise 5-10 word headline for the insight."
                  },
                  summary: {
                    type: "STRING",
                    description: "A detailed 2-3 sentence explanation of the insight, what AI models detected, and its implication for investors."
                  }
                },
                required: ["id", "type", "title", "summary"]
              }
            }
          },
          required: ["analysis_week_ending", "market_summary", "insights"]
        }
      }
    };

    console.log('🤖 Calling Gemini AI for market insights...');
    console.log('📅 Analysis timestamp:', timestamp);
    console.log('📆 Week ending:', weekEndingDate);

    const url = `${GCP_GEMINI_BASE}/models/gemini-1.5-flash-latest:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('❌ Gemini API Error:', response.status, errorText);
      return getFallbackInsights();
    }

    const data = await response.json();

    if (!data || !data.candidates || data.candidates.length === 0) {
      console.error('❌ No response from Gemini AI');
      return getFallbackInsights();
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error('❌ Invalid response structure from Gemini AI');
      return getFallbackInsights();
    }

    const aiResponse = JSON.parse(candidate.content.parts[0].text);
    
    console.log('✅ Successfully received AI insights');
    console.log(`📊 Analysis for week ending: ${aiResponse.analysis_week_ending}`);
    console.log(`💡 Insights count: ${aiResponse.insights?.length || 0}`);

    return {
      success: true,
      timestamp: timestamp,
      weekEnding: aiResponse.analysis_week_ending,
      marketSummary: aiResponse.market_summary,
      insights: aiResponse.insights,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error fetching Gemini AI insights:', error.message);
    return getFallbackInsights();
  }
}

/**
 * Get fallback insights when Gemini API is unavailable
 * @returns {Object} Fallback market insights
 */
function getFallbackInsights() {
  const currentDate = new Date();
  const endOfWeek = new Date(currentDate);
  endOfWeek.setDate(currentDate.getDate() + (6 - currentDate.getDay()));
  
  return {
    success: false,
    fallback: true,
    timestamp: currentDate.toISOString(),
    weekEnding: endOfWeek.toISOString().split('T')[0],
    marketSummary: "Indian markets showed mixed performance with sectoral rotation. Technology and banking sectors led the gains while commodity-linked stocks faced pressure.",
    insights: [
      {
        id: 1,
        type: "Technical",
        title: "Nifty 50 Testing Key Resistance Levels",
        summary: "AI technical models detect strong resistance at 21,500 levels with increasing volume. Momentum indicators suggest potential breakout if sustained above this level for 2-3 sessions. Traders should watch for confirmation with RSI above 60."
      },
      {
        id: 2,
        type: "Sentiment",
        title: "Banking Sector Shows Positive Sentiment Shift",
        summary: "Natural language processing of news and social media indicates improving sentiment toward banking stocks. FII buying patterns and earnings expectations suggest continued strength. Risk-reward ratio favors selective accumulation in quality private banks."
      },
      {
        id: 3,
        type: "Quantitative",
        title: "Volatility Compression Signals Upcoming Move",
        summary: "Quantitative models identify significant reduction in volatility (VIX below 12). Historical patterns suggest major directional move expected within 5-7 trading sessions. Options data shows put-call ratio at 1.2, indicating bullish positioning."
      },
      {
        id: 4,
        type: "Sectoral",
        title: "IT Sector Outperformance Continues",
        summary: "Machine learning models predict continued outperformance in IT sector based on dollar strength and order book analysis. Nifty IT index shows relative strength ratio improving. Top-tier IT stocks present favorable entry points on minor dips."
      },
      {
        id: 5,
        type: "Technical",
        title: "Mid-Cap Stocks Showing Divergence",
        summary: "AI pattern recognition identifies divergence between Nifty 50 and mid-cap indices. Mid-caps showing stronger momentum and breadth improvement. Algorithmic analysis suggests rotation toward quality mid-cap names with strong fundamentals."
      }
    ],
    generatedAt: new Date().toISOString()
  };
}

module.exports = { 
  callGemini,
  getMarketInsights,
  getFallbackInsights
};
