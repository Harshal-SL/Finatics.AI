/**
 * Direct test of loan analyzer with Gemini AI
 * This calls the service directly to get the AI response
 */

const { analyzeLoanWithGemini } = require('../services/loanAnalyzerService');

const userId = '6b867f4e-6461-416e-8f6c-13ae8e177070';
const loanAmount = 100000;

async function testLoanAnalyzer() {
  console.log('='.repeat(80));
  console.log('LOAN ANALYZER - AI RESPONSE TEST');
  console.log('='.repeat(80));
  console.log('User ID:', userId);
  console.log('Loan Amount: ₹', loanAmount.toLocaleString('en-IN'));
  console.log('='.repeat(80));
  console.log('\n');

  try {
    console.log('Analyzing loan request...\n');
    
    const result = await analyzeLoanWithGemini({ userId, loanAmount });
    
    console.log('='.repeat(80));
    console.log('FINANCIAL METRICS');
    console.log('='.repeat(80));
    console.log('Credit Score:', result.metrics.creditScore);
    console.log('Average Savings: ₹', result.metrics.avgSavings.toLocaleString('en-IN'));
    console.log('Average Expenses: ₹', result.metrics.avgExpenses.toLocaleString('en-IN'));
    console.log('Months Considered:', result.metrics.monthsConsidered);
    console.log('='.repeat(80));
    console.log('\n');

    console.log('='.repeat(80));
    console.log('AI LOAN ANALYSIS RESPONSE');
    console.log('='.repeat(80));
    console.log(result.aiText);
    console.log('='.repeat(80));
    console.log('\n');

    // Format as JSON API response
    const apiResponse = {
      success: true,
      message: 'Loan analysis generated successfully',
      data: {
        credit_score: result.metrics.creditScore,
        average_savings: result.metrics.avgSavings,
        average_expenses: result.metrics.avgExpenses,
        months_considered: result.metrics.monthsConsidered,
        ai_response: result.aiText
      }
    };

    console.log('='.repeat(80));
    console.log('JSON API RESPONSE');
    console.log('='.repeat(80));
    console.log(JSON.stringify(apiResponse, null, 2));
    console.log('='.repeat(80));

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  }
}

testLoanAnalyzer();
