const { appDb } = require('../config/supabase');
const { callGemini } = require('./ai/geminiService');
const { getUserLoanMetrics } = require('./loanAnalyzerService');

/**
 * Goal Analyzer Service
 * Analyzes financial goals using user's income/expenses and AI
 */

/**
 * Analyze financial goal with AI
 * @param {Object} params - { userId, targetAmount, targetDate, riskTolerance }
 * @returns {Object} Goal analysis with AI response
 */
const analyzeGoalWithAI = async ({ userId, targetAmount, targetDate, riskTolerance }) => {
  try {
    console.log('🔍 Fetching user metrics for userId:', userId);
    // Get user's financial metrics (avg income, avg expenses, avg savings)
    const metrics = await getUserLoanMetrics(userId);
    console.log('📊 User metrics retrieved:', metrics);
    
    const currentDate = new Date().toISOString().split('T')[0];
    const monthlyIncome = metrics.avgSavings + metrics.avgExpenses; // income = savings + expenses
    const monthlyExpenses = metrics.avgExpenses;
    const monthlySavings = metrics.avgSavings;
    
    // For current savings, we'll use 0 as default (can be enhanced to fetch actual savings)
    const currentSavings = 0;

    console.log('💰 Financial summary:', {
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      currentSavings
    });

    // Build the prompt
    const prompt = `You are a financial goal analysis API. Your sole purpose is to process user financial data and return a structured JSON object. You must not include any conversational text, apologies, or explanations outside of the requested JSON structure.

**CONTEXT:**
* **Current Date:** ${currentDate}
* **Target Amount:** ${targetAmount}
* **Target Date:** ${targetDate}
* **Current Savings:** ${currentSavings}
* **Current Monthly Savings:** ${monthlySavings}

**ASSUMED ANNUAL RETURNS (CAGR) FOR CALCULATIONS:**
* **Low Risk:** 8%
* **Medium Risk:** 10%
* **High Risk:** 12%

**TASK:**
Calculate the financial plan and return *only* the following JSON object. Do not add any text before or after the JSON block. The response must include three distinct plans, one for each risk category (Low, Medium, High).

{
  "disclaimer": "This is an AI-generated analysis for informational purposes only and not financial advice. All investments are subject to market risks. Past performance is not indicative of future results. Consult a SEBI-registered financial advisor before investing.",
  "goalAnalysis": {
    "targetAmount": "₹[TARGET_AMOUNT]",
    "currentSavings": "₹[CURRENT_SAVINGS]",
    "goalGap": "₹[Calculate: Target Amount - Current Savings]",
    "timeHorizonMonths": "[Calculate: Number of months from Current Date to Target Date]"
  },
  "baselineSavingsProjection": {
    "projectedValue": "₹[Calculate: (Current Monthly Savings * Time Horizon Months) + Current Savings]",
    "isGoalMet": "[Calculate: true/false based on if projectedValue >= Target Amount]",
    "summary": "This is the projected value if you only save your money with no investment growth."
  },
  "riskBasedPlans": {
    "lowRiskPlan": {
      "planName": "Low Risk (Conservative)",
      "assumedCAGR": "8%",
      "actionPlan": {
        "requiredMonthlySIP": "₹[Calculate: The monthly SIP amount needed to bridge the Goal Gap, using 8% CAGR and time horizon. This calculation must account for the future growth of the Current Savings lump sum at 8%.]",
        "savingsShortfallOrSurplus": "₹[Calculate: Current Monthly Savings - requiredMonthlySIP for this plan. A negative number indicates a shortfall.]",
        "analysisSummary": "To reach your goal with a low-risk strategy, this is the required monthly SIP. Your current savings will result in the specified shortfall/surplus."
      },
      "investmentStrategy": {
        "recommendedPortfolio": [
          {
            "category": "Large-Cap Index Fund (Nifty 50)",
            "allocationPercent": 100,
            "reasoning": "Provides stable growth from India's top 100 companies, matching a conservative profile."
          }
        ]
      }
    },
    "mediumRiskPlan": {
      "planName": "Medium Risk (Balanced)",
      "assumedCAGR": "10%",
      "actionPlan": {
        "requiredMonthlySIP": "₹[Calculate: The monthly SIP amount needed to bridge the Goal Gap, using 10% CAGR and time horizon. This calculation must account for the future growth of the Current Savings lump sum at 10%.]",
        "savingsShortfallOrSurplus": "₹[Calculate: Current Monthly Savings - requiredMonthlySIP for this plan. A negative number indicates a shortfall.]",
        "analysisSummary": "To reach your goal with a balanced strategy, this is the required monthly SIP. Your current savings will result in the specified shortfall/surplus."
      },
      "investmentStrategy": {
        "recommendedPortfolio": [
          {
            "category": "Large-Cap Index Fund (Nifty 50)",
            "allocationPercent": 60,
            "reasoning": "Forms a stable core for your portfolio."
          },
          {
            "category": "Flexi-Cap Fund",
            "allocationPercent": 40,
            "reasoning": "Adds growth potential by allowing the fund manager to invest across all company sizes."
          }
        ]
      }
    },
    "highRiskPlan": {
      "planName": "High Risk (Aggressive)",
      "assumedCAGR": "12%",
      "actionPlan": {
        "requiredMonthlySIP": "₹[Calculate: The monthly SIP amount needed to bridge the Goal Gap, using 12% CAGR and time horizon. This calculation must account for the future growth of the Current Savings lump sum at 12%.]",
        "savingsShortfallOrSurplus": "₹[Calculate: Current Monthly Savings - requiredMonthlySIP for this plan. A negative number indicates a shortfall.]",
        "analysisSummary": "To reach your goal with an aggressive strategy, this is the required monthly SIP. Your current savings will result in the specified shortfall/surplus."
      },
      "investmentStrategy": {
        "recommendedPortfolio": [
          {
            "category": "Flexi-Cap Fund",
            "allocationPercent": 50,
            "reasoning": "Captures growth across the market by investing flexibly across company sizes."
          },
          {
            "category": "Mid-Cap Fund",
            "allocationPercent": 50,
            "reasoning": "Targets high-growth medium-sized companies, suitable for an aggressive, long-term approach."
          }
        ]
      }
    }
  }
}`;

    let aiResponse;
    let usedModel = 'gemini-1.5-flash';
    
    try {
      const aiText = await callGemini({ prompt });
      
      // Try to parse the JSON response
      try {
        // Extract JSON from response (in case AI adds extra text)
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in AI response');
        }
      } catch (parseError) {
        console.warn('Failed to parse AI JSON response:', parseError.message);
        aiResponse = buildLocalGoalAnalysis({
          currentDate,
          targetAmount,
          targetDate,
          currentSavings,
          monthlySavings,
          riskTolerance
        });
        usedModel = 'local-fallback';
      }
    } catch (err) {
      console.warn('Gemini failed, using local analysis:', err.message);
      aiResponse = buildLocalGoalAnalysis({
        currentDate,
        targetAmount,
        targetDate,
        currentSavings,
        monthlySavings,
        riskTolerance
      });
      usedModel = 'local-fallback';
    }

    // Log the AI request to database
    try {
      await appDb
        .from('airequests')
        .insert({
          user_id: userId,
          request_type: 'goal-analysis',
          prompt,
          response: aiResponse,
          model: usedModel
        });
    } catch (e) {
      console.warn('Failed to log AI request:', e.message);
    }

    return {
      userMetrics: {
        monthlyIncome: monthlyIncome,
        monthlyExpenses: monthlyExpenses,
        monthlySavings: monthlySavings,
        creditScore: metrics.creditScore
      },
      goalAnalysis: aiResponse
    };

  } catch (error) {
    throw new Error(`Failed to analyze goal: ${error.message}`);
  }
};

/**
 * Build local goal analysis (fallback when AI fails)
 * Returns all three risk-based plans
 */
function buildLocalGoalAnalysis({ currentDate, targetAmount, targetDate, currentSavings, monthlySavings, riskTolerance }) {
  // Calculate time horizon in months
  const current = new Date(currentDate);
  const target = new Date(targetDate);
  const timeHorizonMonths = Math.round((target - current) / (1000 * 60 * 60 * 24 * 30));
  
  // Calculate goal gap
  const goalGap = targetAmount - currentSavings;
  
  // Savings only projection (no investment growth)
  const savingsOnlyProjection = (monthlySavings * timeHorizonMonths) + currentSavings;
  
  // Function to calculate plan for a specific risk level
  const calculateRiskPlan = (riskName, cagr, portfolioConfig) => {
    const annualRate = cagr;
    const monthlyRate = Math.pow(1 + annualRate, 1/12) - 1;
    
    // FV of current savings (lump sum)
    const fvLumpSum = currentSavings * Math.pow(1 + annualRate, timeHorizonMonths / 12);
    
    // Remaining gap after lump sum grows
    const remainingGap = targetAmount - fvLumpSum;
    
    // Calculate required monthly SIP
    const sipDenominator = ((Math.pow(1 + monthlyRate, timeHorizonMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    const requiredMonthlySIP = remainingGap / sipDenominator;
    
    const shortfallOrSurplus = monthlySavings - requiredMonthlySIP;
    
    // Generate summary
    let summary;
    if (shortfallOrSurplus >= 0) {
      summary = `Great news! Your current monthly savings of ₹${formatINR(monthlySavings)} is sufficient to reach your goal with a ${riskName.toLowerCase()} strategy.`;
    } else {
      summary = `To reach your goal with a ${riskName.toLowerCase()} strategy, you need a monthly SIP of ₹${formatINR(requiredMonthlySIP)}. This means a shortfall of ₹${formatINR(Math.abs(shortfallOrSurplus))} per month.`;
    }
    
    return {
      planName: riskName,
      assumedCAGR: `${(cagr * 100).toFixed(0)}%`,
      actionPlan: {
        requiredMonthlySIP: `₹${formatINR(Math.max(0, requiredMonthlySIP))}`,
        savingsShortfallOrSurplus: `₹${formatINR(shortfallOrSurplus)}`,
        analysisSummary: summary
      },
      investmentStrategy: {
        recommendedPortfolio: portfolioConfig
      }
    };
  };
  
  // Define portfolio configurations for each risk level
  const lowRiskPortfolio = [
    {
      category: 'Large-Cap Index Fund (Nifty 50)',
      allocationPercent: 100,
      reasoning: 'Provides stable growth from India\'s top 100 companies, matching a conservative profile.'
    }
  ];
  
  const mediumRiskPortfolio = [
    {
      category: 'Large-Cap Index Fund (Nifty 50)',
      allocationPercent: 60,
      reasoning: 'Forms a stable core for your portfolio.'
    },
    {
      category: 'Flexi-Cap Fund',
      allocationPercent: 40,
      reasoning: 'Adds growth potential by allowing the fund manager to invest across all company sizes.'
    }
  ];
  
  const highRiskPortfolio = [
    {
      category: 'Flexi-Cap Fund',
      allocationPercent: 50,
      reasoning: 'Captures growth across the market by investing flexibly across company sizes.'
    },
    {
      category: 'Mid-Cap Fund',
      allocationPercent: 50,
      reasoning: 'Targets high-growth medium-sized companies, suitable for an aggressive, long-term approach.'
    }
  ];
  
  // Build all three plans
  return {
    disclaimer: 'This is an AI-generated analysis for informational purposes only and not financial advice. All investments are subject to market risks. Past performance is not indicative of future results. Consult a SEBI-registered financial advisor before investing.',
    goalAnalysis: {
      targetAmount: `₹${formatINR(targetAmount)}`,
      currentSavings: `₹${formatINR(currentSavings)}`,
      goalGap: `₹${formatINR(goalGap)}`,
      timeHorizonMonths: timeHorizonMonths.toString()
    },
    baselineSavingsProjection: {
      projectedValue: `₹${formatINR(savingsOnlyProjection)}`,
      isGoalMet: savingsOnlyProjection >= targetAmount,
      summary: 'This is the projected value if you only save your money with no investment growth.'
    },
    riskBasedPlans: {
      lowRiskPlan: calculateRiskPlan('Low Risk (Conservative)', 0.08, lowRiskPortfolio),
      mediumRiskPlan: calculateRiskPlan('Medium Risk (Balanced)', 0.10, mediumRiskPortfolio),
      highRiskPlan: calculateRiskPlan('High Risk (Aggressive)', 0.12, highRiskPortfolio)
    }
  };
}

function formatINR(num) {
  return Math.round(num).toLocaleString('en-IN');
}

module.exports = {
  analyzeGoalWithAI
};
