/**
 * Test: "Explain Nifty 50" question
 * This should return a SHORT response with NO markdown
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
const TEST_USER_ID = 'c7fbe9ef-73d8-444a-9833-7e0c83b6abcd';

async function testNifty50Question() {
  console.log('🧪 Testing: "Explain what is Nifty 50"\n');
  console.log('='.repeat(70));

  try {
    const response = await axios.post(`${API_BASE}/chatbot`, {
      message: "Explain what is Nifty 50",
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
    const hasSeparators = aiResponse.includes('---');
    const tooLong = aiResponse.length > 300;
    
    console.log('\n🔍 FORMATTING CHECK:');
    console.log(`  ${hasMarkdown ? '❌' : '✅'} Markdown (**, ##): ${hasMarkdown ? 'FOUND - FAIL' : 'Clean'}`);
    console.log(`  ${hasTables ? '❌' : '✅'} Tables (|): ${hasTables ? 'FOUND - FAIL' : 'None'}`);
    console.log(`  ${hasSeparators ? '❌' : '✅'} Separators (---): ${hasSeparators ? 'FOUND - FAIL' : 'None'}`);
    console.log(`  ${tooLong ? '❌' : '✅'} Length: ${aiResponse.length} chars ${tooLong ? '(TOO LONG - FAIL)' : '(Good)'}`);
    
    if (!hasMarkdown && !hasTables && !hasSeparators && !tooLong) {
      console.log('\n✅ ✅ ✅ PERFECT! Response is clean, short, and properly formatted!');
    } else {
      console.log('\n❌ ❌ ❌ FAILED! Response violates formatting rules.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(70));
}

// Wait for server to be ready
setTimeout(testNifty50Question, 2000);
