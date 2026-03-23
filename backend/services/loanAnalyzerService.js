const { bankingDb, appDb } = require('../config/supabase');
const { callGemini } = require('./ai/geminiService');

/**
 * Fetch user's financial metrics for loan analysis.
 * - creditScore from bankingDb.customers via linked accounts -> bank_accounts -> customers
 * - average monthly savings/expenses from last 3 full months of transactions
 */
const getUserLoanMetrics = async (userId) => {
  // 1) Get linked account identifiers from App DB
  const { data: links, error: linksErr } = await appDb
    .from('linkedbankaccounts')
    .select('account_number')
    .eq('user_id', userId);
  if (linksErr) throw new Error(`Failed to fetch linked accounts: ${linksErr.message}`);
  const accountRefs = (links || []).map(l => l.account_number).filter(Boolean);

  if (!accountRefs.length) {
    return {
      creditScore: null,
      avgSavings: 0,
      avgExpenses: 0,
      monthsConsidered: 0
    };
  }

  // 2) UUID to Banking Account Mapping Strategy
  // WORKAROUND: For demo, directly use account 5893143322 (account_id: 1)
  // This bypasses the UUID mapping issue
  const { data: bankAccounts, error: bankErr } = await bankingDb
    .from('bank_accounts')
    .select('account_id, customer_id, account_number')
    .eq('account_number', '5893143322');
  
  if (bankErr) {
    console.error('Error fetching bank accounts:', bankErr);
  }

  const accountIds = (bankAccounts || []).map(a => a.account_id);
  const customerIds = [...new Set((bankAccounts || []).map(a => a.customer_id))];

  // 3) Get credit score from customers (take the first if multiple)
  let creditScore = null;
  if (customerIds.length) {
    const { data: customers, error: custErr } = await bankingDb
      .from('customers')
      .select('customer_id, credit_score')
      .in('customer_id', customerIds);
    if (custErr) throw new Error(`Failed to fetch customers: ${custErr.message}`);
    creditScore = customers?.[0]?.credit_score ?? null;
  }

  // 4) Compute last 3 full months income/expenses
  const now = new Date();
  // begin with the 1st day of current month, then subtract 1 day to get last day of previous month
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endPrevMonth = new Date(startOfCurrentMonth.getTime() - 24 * 60 * 60 * 1000);
  // start from first day of the month 3 months before current month
  const startThreeMonthsAgo = new Date(startOfCurrentMonth.getFullYear(), startOfCurrentMonth.getMonth() - 3, 1);

  const { data: txns, error: txErr } = await bankingDb
    .from('transactions')
    .select('txn_type, amount, txn_date, account_id')
    .in('account_id', accountIds)
    .gte('txn_date', startThreeMonthsAgo.toISOString().split('T')[0])
    .lte('txn_date', endPrevMonth.toISOString().split('T')[0]);
  if (txErr) throw new Error(`Failed to fetch transactions: ${txErr.message}`);

  // Aggregate by month
  const byMonth = new Map(); // key: yyyy-mm, value: { income, expenses }
  for (const t of txns || []) {
    const d = new Date(t.txn_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = byMonth.get(key) || { income: 0, expenses: 0 };
    const amount = parseFloat(t.amount || 0);
    const txnType = (t.txn_type || '').toLowerCase();
    if (txnType === 'credit' || txnType === 'deposit') entry.income += amount;
    else if (txnType === 'debit' || txnType === 'withdrawal') entry.expenses += amount;
    byMonth.set(key, entry);
  }

  const months = Array.from(byMonth.values());
  const monthsConsidered = months.length;
  const avgIncome = months.length ? months.reduce((s, m) => s + m.income, 0) / months.length : 0;
  const avgExpenses = months.length ? months.reduce((s, m) => s + m.expenses, 0) / months.length : 0;
  const avgSavings = avgIncome - avgExpenses;

  return {
    creditScore,
    avgSavings: Number(avgSavings.toFixed(2)),
    avgExpenses: Number(avgExpenses.toFixed(2)),
    monthsConsidered
  };
};

const analyzeLoanWithGemini = async ({ userId, loanAmount, loanType = 'Personal Loan' }) => {
  if (!userId) throw new Error('userId is required');
  if (!loanAmount || isNaN(Number(loanAmount))) throw new Error('loanAmount must be a valid number');

  const metrics = await getUserLoanMetrics(userId);

    // Build prompt per product spec: rate tiers, affordability rule, EMI formula, INR output
    const avgSavings = metrics.avgSavings;
    const creditScore = metrics.creditScore ?? 'unknown';
    const monthsConsidered = metrics.monthsConsidered;

    // Define loan type specific interest rate ranges
    const loanTypeRates = {
      'Personal Loan': {
        excellent: '9% - 11%',
        good: '11% - 14%',
        fair: '14% - 18%',
        poor: '18% - 24%',
        typicalTenure: '1-5 years',
        avgRate: '14%'
      },
      'Home Loan': {
        excellent: '7.5% - 8%',
        good: '8% - 8.5%',
        fair: '8.5% - 9%',
        poor: '9% - 9.5%',
        typicalTenure: '10-30 years',
        avgRate: '8.5%'
      },
      'Car Loan': {
        excellent: '8% - 9%',
        good: '9% - 9.5%',
        fair: '9.5% - 10.5%',
        poor: '10.5% - 11%',
        typicalTenure: '3-7 years',
        avgRate: '9.5%'
      },
      'Education Loan': {
        excellent: '9% - 10%',
        good: '10% - 11.5%',
        fair: '11.5% - 13%',
        poor: '13% - 14%',
        typicalTenure: '5-15 years',
        avgRate: '11.5%'
      },
      'Business Loan': {
        excellent: '10% - 12%',
        good: '12% - 14%',
        fair: '14% - 16%',
        poor: '16% - 18%',
        typicalTenure: '1-7 years',
        avgRate: '14%'
      }
    };

    const rateInfo = loanTypeRates[loanType] || loanTypeRates['Personal Loan'];

    const prompt = `You are an expert Loan Analyser AI. Provide exactly THREE loan options with different risk levels.

USER'S FINANCIAL DATA:
- Monthly Savings: ₹${avgSavings}
- Credit Score: ${creditScore}
- Loan Amount: ₹${loanAmount}
- Loan Type: ${loanType}

INTEREST RATES (based on credit score ${creditScore}):
- Excellent (780+): ${rateInfo.excellent}
- Good (720-779): ${rateInfo.good}
- Fair (650-719): ${rateInfo.fair}
- Poor (<650): ${rateInfo.poor}

Provide EXACTLY this format with proper alignment:

✅  OPTION 1: LOW RISK
    Safe & Comfortable Payment

    Tenure              [X] Years
    Interest Rate       [X]% per annum
    Monthly EMI         ₹[calculate - <30% of savings]
    Total Interest      ₹[calculate]
    Total Payable       ₹[calculate]
    Risk Level          [X]% of monthly savings

    Best for: Minimal financial stress

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚖️  OPTION 2: MODERATE RISK  ⭐ RECOMMENDED
    Balanced Approach

    Tenure              [X] Years
    Interest Rate       [X]% per annum
    Monthly EMI         ₹[calculate - 30-40% of savings]
    Total Interest      ₹[calculate]
    Total Payable       ₹[calculate]
    Risk Level          [X]% of monthly savings

    Best for: Optimal balance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  OPTION 3: HIGH RISK
    Aggressive Repayment

    Tenure              [X] Years
    Interest Rate       [X]% per annum
    Monthly EMI         ₹[calculate - 40-50% of savings]
    Total Interest      ₹[calculate]
    Total Payable       ₹[calculate]
    Risk Level          [X]% of monthly savings

    Best for: Save on total interest

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡  RECOMMENDATION

    [Personalized suggestion based on their profile]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋  KEY INSIGHTS

    • [Insight about tenure and interest]
    • [Insight about EMI affordability]
    • [Insight about financial planning]

Use EMI formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1)
Round amounts to nearest rupee.`;

  let aiText;
  let usedModel = 'gemini-1.5-flash';
  let loanOptions = null;
  
  try {
    aiText = await callGemini({ prompt });
  } catch (err) {
    console.warn('Gemini failed, falling back to local analysis:', err.message);
    try {
      const localResult = buildLocalLoanReport({
        loanAmount: Number(loanAmount),
        avgSavings,
        creditScore,
        loanType
      });
      aiText = localResult.report;
      loanOptions = localResult.loanOptions;
      usedModel = 'local-fallback';
    } catch (localErr) {
      console.error('Local analysis failed:', localErr);
      console.error('Stack:', localErr.stack);
      throw new Error(`Analysis failed: ${localErr.message}`);
    }
  }

  // Log AI (or local) request
  try {
    await appDb
      .from('airequests')
      .insert({
        user_id: userId,
        request_type: 'loan-analysis',
        prompt,
        response: { text: aiText, metrics },
        model: usedModel
      });
  } catch (e) {
    console.warn('Failed to log AI request:', e.message);
  }

  return { metrics, aiText, loanOptions };
};

// ---------- Local fallback implementation ----------
function pickRateFromCreditScoreAndLoanType(creditScore, loanType) {
  const loanTypeRates = {
    'Personal Loan': { excellent: 10, good: 12.5, fair: 16, poor: 21, range: '9-24%', avgRate: 14 },
    'Home Loan': { excellent: 7.75, good: 8.25, fair: 8.75, poor: 9.25, range: '7.5-9.5%', avgRate: 8.5 },
    'Car Loan': { excellent: 8.5, good: 9.25, fair: 10, poor: 10.75, range: '8-11%', avgRate: 9.5 },
    'Education Loan': { excellent: 9.5, good: 10.75, fair: 12, poor: 13.5, range: '9-14%', avgRate: 11.5 },
    'Business Loan': { excellent: 11, good: 13, fair: 15, poor: 17, range: '10-18%', avgRate: 14 }
  };

  const rates = loanTypeRates[loanType] || loanTypeRates['Personal Loan'];
  
  if (typeof creditScore !== 'number' || Number.isNaN(creditScore)) {
    return { rate: rates.fair, range: rates.range, avgRate: rates.avgRate };
  }
  
  let selectedRate;
  if (creditScore >= 780) selectedRate = rates.excellent;
  else if (creditScore >= 720) selectedRate = rates.good;
  else if (creditScore >= 650) selectedRate = rates.fair;
  else selectedRate = rates.poor;
  
  return { rate: selectedRate, range: rates.range, avgRate: rates.avgRate };
}

function getTenureRange(loanType) {
  const tenureRanges = {
    'Personal Loan': { min: 1, max: 5, recommended: [2, 3, 4], best: 3 },
    'Home Loan': { min: 10, max: 30, recommended: [15, 20, 25], best: 20 },
    'Car Loan': { min: 3, max: 7, recommended: [3, 5, 7], best: 5 },
    'Education Loan': { min: 5, max: 15, recommended: [7, 10, 12], best: 10 },
    'Business Loan': { min: 1, max: 7, recommended: [2, 4, 5], best: 4 }
  };
  return tenureRanges[loanType] || tenureRanges['Personal Loan'];
}

function getLoanTypeTips(loanType) {
  const tips = {
    'Personal Loan': {
      gettingLoan: [
        'Maintain a credit score above 750 for better rates',
        'Show stable income proof for the last 6 months',
        'Keep existing EMIs below 40% of your income',
        'Compare rates from multiple lenders before deciding'
      ],
      repayment: [
        'Set up automatic EMI deductions to avoid missed payments',
        'Try to make prepayments whenever you have surplus funds',
        'Maintain an emergency fund of 3-6 months of EMI',
        'Consider balance transfer if you find lower rates later'
      ],
      insights: [
        'Personal loans are unsecured - rates are higher than secured loans',
        'Processing fees typically range from 1-3% of loan amount',
        'Missing payments can severely impact your credit score',
        'Prepayment charges usually waive off after 6-12 months'
      ]
    },
    'Home Loan': {
      gettingLoan: [
        'Save at least 20% down payment to get better rates',
        'Check property legal documents thoroughly before applying',
        'Consider government schemes like PMAY for subsidies',
        'Maintain low debt-to-income ratio (<50%)'
      ],
      repayment: [
        'Utilize tax benefits under Section 80C and 24(b)',
        'Increase EMI amount annually with salary increments',
        'Consider partial prepayments to reduce interest burden',
        'Keep property insurance updated throughout tenure'
      ],
      insights: [
        'Home loans have the longest tenure and lowest interest rates',
        'Property appreciation can offset interest paid over time',
        'Joint home loans can increase eligibility and tax benefits',
        'Floating rates are generally 0.5-1% lower than fixed rates'
      ]
    },
    'Car Loan': {
      gettingLoan: [
        'Make higher down payment (20-30%) for better rates',
        'Check dealer offers - they often have tie-ups with banks',
        'Used car loans have 1-2% higher interest than new car loans',
        'Compare total cost including processing and insurance'
      ],
      repayment: [
        'Pay EMIs on time to maintain credit score',
        'Consider prepayment after 1 year to save on interest',
        'Keep comprehensive insurance throughout loan tenure',
        'Maintain the vehicle properly to protect resale value'
      ],
      insights: [
        'Car is a depreciating asset - keep tenure as short as possible',
        'Banks finance up to 90% of on-road price',
        'Some banks offer step-up EMI schemes for young professionals',
        'Pre-approved loans from existing banks often have lower rates'
      ]
    },
    'Education Loan': {
      gettingLoan: [
        'Government schemes offer 4% interest subsidy for certain courses',
        'Collateral-free loans available up to ₹7.5 lakhs',
        'Co-applicant with stable income improves approval chances',
        'Apply early - loan processing takes 2-4 weeks'
      ],
      repayment: [
        'Repayment typically starts after course + 1 year grace period',
        'Pay interest during study period if possible to reduce burden',
        'Most banks offer moratorium of 6-12 months after course',
        'Link loan to future income for manageable repayments'
      ],
      insights: [
        'Tax deduction available on interest paid under Section 80E',
        'No upper limit for tax deduction on education loan interest',
        'Public sector banks often have better rates for education loans',
        'Loans for studying abroad may require higher collateral'
      ]
    },
    'Business Loan': {
      gettingLoan: [
        'Prepare detailed business plan with revenue projections',
        'Maintain good GST compliance and income tax returns',
        'Show 2-3 years of profitable business operations',
        'Keep personal and business finances separate'
      ],
      repayment: [
        'Match loan repayment with business cash flow cycles',
        'Build buffer for seasonal business fluctuations',
        'Reinvest profits to grow business and clear debt faster',
        'Maintain transparent accounting for future credit needs'
      ],
      insights: [
        'Business loans can be secured or unsecured with varying rates',
        'MSME registered businesses get better rates and schemes',
        'Government schemes like MUDRA offer loans up to ₹10 lakhs',
        'Maintain business credit score separate from personal score'
      ]
    }
  };
  return tips[loanType] || tips['Personal Loan'];
}

function computeEmi(P, annualRatePercent, years) {
  const r = (annualRatePercent / 12) / 100;
  const n = years * 12;
  if (r === 0) return P / n;
  const pow = Math.pow(1 + r, n);
  return (P * r * pow) / (pow - 1);
}

function formatINR(x) {
  try {
    return Math.round(x).toLocaleString('en-IN');
  } catch {
    return String(Math.round(x));
  }
}

function buildLocalLoanReport({ loanAmount, avgSavings, creditScore, loanType = 'Personal Loan' }) {
  const rateInfo = pickRateFromCreditScoreAndLoanType(creditScore, loanType);
  const rate = rateInfo.rate;
  const tenureInfo = getTenureRange(loanType);
  const tips = getLoanTypeTips(loanType);
  const savingsAmount = Number(avgSavings) || 0;

  // Use loan-type specific recommended tenures
  const [lowTenure, modTenure, highTenure] = tenureInfo.recommended;

  // Calculate 3 options with different risk levels
  const options = [];
  
  // LOW RISK - Longest tenure (lowest EMI)
  const lowEmi = computeEmi(loanAmount, rate, lowTenure);
  const lowTotal = lowEmi * lowTenure * 12;
  const lowInterest = lowTotal - loanAmount;
  const lowRisk = savingsAmount > 0 ? ((lowEmi / savingsAmount) * 100).toFixed(1) : 0;
  
  // MODERATE RISK - Medium tenure
  const modEmi = computeEmi(loanAmount, rate, modTenure);
  const modTotal = modEmi * modTenure * 12;
  const modInterest = modTotal - loanAmount;
  const modRisk = savingsAmount > 0 ? ((modEmi / savingsAmount) * 100).toFixed(1) : 0;
  
  // HIGH RISK - Shortest tenure (highest EMI)
  const highEmi = computeEmi(loanAmount, rate, highTenure);
  const highTotal = highEmi * highTenure * 12;
  const highInterest = highTotal - loanAmount;
  const highRisk = savingsAmount > 0 ? ((highEmi / savingsAmount) * 100).toFixed(1) : 0;

  // Return structured data for card-based rendering
  const loanOptions = {
    loanType,
    rateRange: rateInfo.range,
    bestRate: `${rate}% p.a.`,
    tenureRange: `${tenureInfo.min}-${tenureInfo.max} years`,
    bestTenure: `${tenureInfo.best} years`,
    options: [
      {
        type: 'LOW RISK',
        icon: '✅',
        title: 'Safe & Comfortable',
        tenure: lowTenure,
        interestRate: rate,
        monthlyEmi: lowEmi,
        totalInterest: lowInterest,
        totalPayable: lowTotal,
        riskLevel: lowRisk,
        riskPercentage: parseFloat(lowRisk),
        bestFor: 'Minimal financial stress',
        recommended: false
      },
      {
        type: 'MODERATE RISK',
        icon: '⚖️',
        title: 'Balanced Approach',
        tenure: modTenure,
        interestRate: rate,
        monthlyEmi: modEmi,
        totalInterest: modInterest,
        totalPayable: modTotal,
        riskLevel: modRisk,
        riskPercentage: parseFloat(modRisk),
        bestFor: 'Optimal balance',
        recommended: true
      },
      {
        type: 'HIGH RISK',
        icon: '⚠️',
        title: 'Aggressive Repayment',
        tenure: highTenure,
        interestRate: rate,
        monthlyEmi: highEmi,
        totalInterest: highInterest,
        totalPayable: highTotal,
        riskLevel: highRisk,
        riskPercentage: parseFloat(highRisk),
        bestFor: 'Save on total interest',
        recommended: false
      }
    ],
    recommendation: getRecommendationText(lowRisk, modRisk, highRisk, savingsAmount),
    tips: tips,
    insights: [
      `${loanType} Interest Rate Range: ${rateInfo.range} (You qualify for ${rate}% based on credit score)`,
      `Recommended Tenure: ${tenureInfo.best} years (Range: ${tenureInfo.min}-${tenureInfo.max} years)`,
      `Your EMI should ideally be below ${Math.round(savingsAmount * 0.4).toLocaleString('en-IN')} (40% of savings)`,
      `Total interest savings from shortest to longest tenure: ₹${formatINR(lowInterest - highInterest)}`
    ]
  };

  const report = `
✅  OPTION 1: LOW RISK
    Safe & Comfortable Payment

    Tenure              ${lowTenure} Years
    Interest Rate       ${rate}% per annum
    Monthly EMI         ₹${formatINR(lowEmi)}
    Total Interest      ₹${formatINR(lowInterest)}
    Total Payable       ₹${formatINR(lowTotal)}
    Risk Level          ${lowRisk}% of monthly savings

    Best for: Minimal financial stress

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚖️  OPTION 2: MODERATE RISK  ⭐ RECOMMENDED
    Balanced Approach

    Tenure              ${modTenure} Years
    Interest Rate       ${rate}% per annum
    Monthly EMI         ₹${formatINR(modEmi)}
    Total Interest      ₹${formatINR(modInterest)}
    Total Payable       ₹${formatINR(modTotal)}
    Risk Level          ${modRisk}% of monthly savings

    Best for: Optimal balance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  OPTION 3: HIGH RISK
    Aggressive Repayment

    Tenure              ${highTenure} Years
    Interest Rate       ${rate}% per annum
    Monthly EMI         ₹${formatINR(highEmi)}
    Total Interest      ₹${formatINR(highInterest)}
    Total Payable       ₹${formatINR(highTotal)}
    Risk Level          ${highRisk}% of monthly savings

    Best for: Save on total interest

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡  RECOMMENDATION

    ${getRecommendationText(lowRisk, modRisk, highRisk, savingsAmount)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋  KEY INSIGHTS FOR ${loanType.toUpperCase()}

    Interest Rate: ${rateInfo.range} (Your rate: ${rate}%)
    Tenure Range: ${tenureInfo.min}-${tenureInfo.max} years (Best: ${tenureInfo.best} years)
    
    ${tips.insights.map(insight => `• ${insight}`).join('\n    ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡  TIPS TO GET ${loanType.toUpperCase()}

    ${tips.gettingLoan.map(tip => `• ${tip}`).join('\n    ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰  REPAYMENT STRATEGIES

    ${tips.repayment.map(tip => `• ${tip}`).join('\n    ')}
`;

  return { report, loanOptions };
}

function getRecommendationText(lowRisk, modRisk, highRisk, savings) {
  const low = parseFloat(lowRisk);
  const mod = parseFloat(modRisk);
  const high = parseFloat(highRisk);
  
  if (savings < 10000) {
    return 'With limited savings, focus on building emergency fund before taking loan. Consider Option 1 for lowest EMI.';
  }
  
  if (mod <= 30) {
    return 'Option 2 (Moderate Risk) is ideal - balances affordable EMI with reasonable interest costs. Highly recommended!';
  } else if (mod <= 40) {
    return 'Option 2 requires 30-40% of savings. Manageable but ensure you have emergency funds. Consider Option 1 if uncertain.';
  } else if (low <= 35) {
    return 'Option 1 (Low Risk) recommended - keeps EMI comfortable and leaves room for other expenses and savings.';
  } else {
    return 'All options require significant portion of savings. Consider reducing loan amount or improving income before proceeding.';
  }
}

module.exports = {
  getUserLoanMetrics,
  analyzeLoanWithGemini
};
