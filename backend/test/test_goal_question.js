/**
 * Test: Response to "How to achieve goals faster?" question
 * Should be SHORT, NO markdown (**, ##), clean formatting
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
const TEST_USER_ID = 'c7fbe9ef-73d8-444a-9833-7e0c83b6abcd';

async function testGoalQuestion() {
  console.log('🧪 Testing: "How to achieve goals faster?" Response\n');
  console.log('='.repeat(70));

  try {
    const response = await axios.post(`${API_BASE}/chatbot`, {
      message: "How can I achieve my financial goals faster?",
      userId: TEST_USER_ID
    });

    const aiResponse = response.data.data?.message || response.data.response;
    
    console.log('\n📝 AI RESPONSE:');
    console.log('─'.repeat(70));
    console.log(aiResponse);
    console.log('─'.repeat(70));
    
    console.log(`\n📏 Length: ${aiResponse.length} characters`);
    
    // Check for issues
    const hasMarkdown = aiResponse.includes('**') || aiResponse.includes('##') || aiResponse.includes('###');
    const hasTables = aiResponse.includes('|');
    const tooLong = aiResponse.length > 400;
    
    console.log('\n🔍 FORMATTING CHECK:');
    console.log(`  ${hasMarkdown ? '❌' : '✅'} Markdown symbols (**, ##): ${hasMarkdown ? 'FOUND' : 'Clean'}`);
    console.log(`  ${hasTables ? '❌' : '✅'} Tables (|): ${hasTables ? 'FOUND' : 'None'}`);
    console.log(`  ${tooLong ? '❌' : '✅'} Length: ${aiResponse.length} chars ${tooLong ? '(TOO LONG)' : '(Good)'}`);
    
    if (!hasMarkdown && !hasTables && !tooLong) {
      console.log('\n✅ PERFECT! Response is clean, short, and properly formatted.');
    } else {
      console.log('\n⚠️  Response still needs improvement.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(70));
}

// Wait for server to be ready
setTimeout(testGoalQuestion, 1000);
