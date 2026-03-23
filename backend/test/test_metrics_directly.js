require('dotenv').config();
const { getUserLoanMetrics } = require('../services/loanAnalyzerService');

(async () => {
  const userId = '6b867f4e-6461-416e-8f6c-13ae8e177070';
  
  console.log('Testing getUserLoanMetrics for user:', userId);
  
  try {
    const metrics = await getUserLoanMetrics(userId);
    console.log('\nResult:', JSON.stringify(metrics, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
})();
