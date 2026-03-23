/**
 * Test AI Insights Endpoint
 * Tests the Gemini AI integration for market insights
 */

const API_BASE_URL = 'http://localhost:3000/api';

async function testAIInsights() {
  console.log('🧪 Testing AI Insights API...\n');

  try {
    console.log('📊 Fetching AI market insights...');
    console.log(`URL: ${API_BASE_URL}/ai-insights\n`);

    const response = await fetch(`${API_BASE_URL}/ai-insights`);
    const result = await response.json();

    console.log('Response Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ AI Insights Retrieved Successfully!');
      console.log('\n📅 Week Ending:', result.data.weekEnding);
      console.log('📰 Market Summary:', result.data.marketSummary);
      console.log(`💡 Total Insights: ${result.data.insights.length}`);
      console.log('⚠️  Fallback Mode:', result.data.isFallback ? 'YES (Gemini API not available)' : 'NO (Live Gemini AI)');
      console.log('🕐 Generated At:', new Date(result.data.generatedAt).toLocaleString());

      console.log('\n📊 Insights Breakdown:');
      result.data.insights.forEach((insight, index) => {
        console.log(`\n${index + 1}. [${insight.type}] ${insight.title}`);
        console.log(`   ${insight.summary}`);
      });

      // Categorize insights by type
      console.log('\n📋 Insights by Category:');
      const categories = {};
      result.data.insights.forEach(insight => {
        if (!categories[insight.type]) {
          categories[insight.type] = 0;
        }
        categories[insight.type]++;
      });
      Object.entries(categories).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });

    } else {
      console.log('\n❌ Failed to get AI insights');
      console.log('Error:', result.message);
    }

  } catch (error) {
    console.error('\n❌ Error testing AI insights:', error.message);
    console.error('Full error:', error);
  }

  console.log('\n✨ Test complete!');
}

// Run the test
testAIInsights();
