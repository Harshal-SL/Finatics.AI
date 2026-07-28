/**
 * Chatbot Service using Gemini AI
 * Token-optimized Indian Finance Advisor
 */

const GCP_GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1';

/**
 * Call Gemini API for chatbot responses
 * @param {string} userQuery - User's question
 * @param {Object} userData - User financial data
 * @returns {Promise<string>} AI response
 */
const getChatbotResponse = async (userQuery, userData) => {
  const apiKey = process.env.GEMINI_CHATBOT_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_CHATBOT_API_KEY is not configured');
  }

  // Calculate surplus
  const savings = userData.savings || 0;
  const expenses = userData.expenses || 0;
  const surplus = savings - expenses;

  // Build dynamic system prompt for FinGenius
  const systemPrompt = `**Role:** You are "FinGenius," a high-end AI Financial Advisor with expertise in Indian stock markets, mutual funds, investment strategies, and financial planning.

**User Context (for personalized advice):** 
- Total Savings: ₹${savings.toLocaleString('en-IN')}
- Total Expenses: ₹${expenses.toLocaleString('en-IN')}
- Investable Surplus: ₹${surplus.toLocaleString('en-IN')}

**Core Rules:**
1. **Dual Mode Operation:**
   - **General Queries:** Answer questions about stock market trends, finance news, specific stocks, market analysis, investment concepts, tax laws, etc. WITHOUT always relating to user's personal finances.
   - **Personalized Advice:** When user asks for investment recommendations, portfolio advice, or "what should I do", then use their Savings/Expenses/Surplus data to provide tailored suggestions.

2. **Stock Market & Finance Expertise:** Provide information on:
   - Individual stocks (gainers/losers, fundamentals, technicals)
   - **ALWAYS include current prices and percentage gains/losses** when discussing stocks
   - Market indices (Nifty 50, Sensex, sector indices)
   - Market trends and analysis
   - IPOs, bonds, commodities, forex
   - Economic news and policies
   - Tax planning (80C, LTCG, STCG)
   - **Format stock data in tables with columns: Stock Name | Current Price | Change (%) | Gain/Loss**

3. **Strict Finance Focus:** Answer ONLY finance-related queries. Reject non-finance questions politely.

4. **Formatting:** Use Markdown tables for stock data, comparisons. Use bold text for key figures like prices and percentages.

5. **Word Limit:** Keep responses under 100 words - be concise and impactful.

6. **IMPORTANT:** DO NOT include savings/expenses/surplus summary at the end of your response. The UI displays this automatically.

7. **Mutual Fund Recommendations (when asked):**
   - Large Cap: HDFC Top 100, ICICI Pru Bluechip, SBI Bluechip
   - Mid Cap: Axis Midcap, PGIM India Midcap, Kotak Emerging Equity
   - Small Cap: Nippon India Small Cap, SBI Small Cap, Axis Small Cap
   - Flexi/Multi Cap: Parag Parikh Flexi Cap, Quant Flexi Cap
   - Index Funds: Nifty 50, Nifty Next 50, Sensex
   - Tax Saver (ELSS): Quant Tax Plan, Mirae Asset Tax Saver
   - Debt Funds: ICICI Pru Bond, HDFC Corporate Bond

8. **Risk Awareness:** Mention market risks when discussing equity investments.

**Tone:** Professional, knowledgeable, and intellectually honest.`;

  // Combine system prompt with user query
  const fullPrompt = `${systemPrompt}

User Query: ${userQuery}

Provide a helpful, specific response to their question:`;

  // Try multiple Gemini models
  const tryModels = [
    'models/gemini-2.5-flash',
    'models/gemini-2.0-flash',
    'models/gemini-2.5-pro'
  ];

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: fullPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1024 // Increased for complete responses
    }
  };

  let lastErrorText = '';
  
  for (const model of tryModels) {
    try {
      const url = `${GCP_GEMINI_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        if (text) {
          return text;
        }
        
        lastErrorText = 'Empty response from Gemini';
        continue;
      } else {
        const errorText = await response.text().catch(() => '');
        lastErrorText = `Gemini API error: ${response.status} ${response.statusText} ${errorText}`;
        
        // If model not found, try next model
        if (response.status === 404) {
          continue;
        }
        
        // For other errors (401, 429, 500), break early
        break;
      }
    } catch (error) {
      lastErrorText = `Network error: ${error.message}`;
      continue;
    }
  }

  throw new Error(lastErrorText || 'Failed to get response from Gemini AI');
};

/**
 * Validate if query is finance-related
 * @param {string} query - User query
 * @returns {boolean}
 */
const isFinanceQuery = (query) => {
  const financeKeywords = [
    'stock', 'invest', 'mutual fund', 'mf', 'tax', 'budget', 'savings',
    'expense', 'loan', 'credit', 'debit', 'nifty', 'sensex', 'fd',
    'fixed deposit', 'sip', 'portfolio', 'dividend', 'equity', 'debt',
    'insurance', 'retirement', 'ppf', 'nps', 'elss', 'bond', 'gold',
    'real estate', 'emi', 'interest', 'inflation', 'returns', 'profit',
    'loss', 'gain', 'trading', 'market', 'financial', 'money', 'rupee', 'inr',
    'wealth', 'asset', 'fund', 'income', 'revenue', 'capital', 'share',
    'crypto', 'forex', 'commodity', 'risk', 'return', 'roi', 'analyse',
    'analyze', 'performance', 'holding', 'buy', 'sell', 'trade'
  ];

  const lowerQuery = query.toLowerCase();
  
  // If query is very short (like "hello", "hi"), treat it as a greeting (finance-related in context)
  if (query.trim().length <= 20 && (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey'))) {
    return true; // Allow greetings to get personalized financial status
  }
  
  return financeKeywords.some(keyword => lowerQuery.includes(keyword));
};

module.exports = {
  getChatbotResponse,
  isFinanceQuery
};
