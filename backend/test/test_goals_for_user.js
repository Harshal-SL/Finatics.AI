/**
 * Test script to verify financial goals are fetched correctly for a specific user
 * Usage: node test/test_goals_for_user.js
 */

require('dotenv').config();
const { appDb } = require('../config/supabase');

const TEST_USER_ID = '6b867f4e-6461-416e-8f6c-13ae8e177070';

async function testGetGoalsForUser() {
  console.log('🧪 Testing Financial Goals Query');
  console.log('================================\n');
  
  try {
    console.log(`📋 Fetching goals for user: ${TEST_USER_ID}\n`);
    
    // Query using the exact format from Supabase docs
    const { data: financialgoals, error } = await appDb
      .from('financialgoals')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database Error:', error);
      throw error;
    }

    console.log(`✅ Query successful!`);
    console.log(`📊 Found ${financialgoals?.length || 0} goals\n`);

    if (financialgoals && financialgoals.length > 0) {
      console.log('📝 Goals Details:');
      console.log('=================\n');
      
      financialgoals.forEach((goal, index) => {
        console.log(`Goal #${index + 1}:`);
        console.log(`  ID: ${goal.goal_id}`);
        console.log(`  Title: ${goal.title}`);
        console.log(`  Description: ${goal.description}`);
        console.log(`  Target Amount: ₹${goal.target_amount?.toLocaleString('en-IN')}`);
        console.log(`  Current Saved: ₹${goal.current_saved?.toLocaleString('en-IN')}`);
        console.log(`  Target Date: ${goal.target_date}`);
        console.log(`  Status: ${goal.status}`);
        console.log(`  Created: ${goal.created_at}`);
        console.log('  ---');
      });
    } else {
      console.log('ℹ️  No goals found for this user.');
      console.log('\n💡 To create a test goal, you can:');
      console.log('   1. Use the frontend Goals page');
      console.log('   2. Or run: node test/create_test_goal.js');
    }

    // Test the exact API endpoint format
    console.log('\n🔗 API Endpoint Test:');
    console.log('=====================');
    console.log(`GET /api/goals?userId=${TEST_USER_ID}`);
    console.log('Expected Response Format:');
    console.log(JSON.stringify({
      success: true,
      message: `Found ${financialgoals?.length || 0} goals`,
      data: financialgoals || []
    }, null, 2));

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testGetGoalsForUser()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
