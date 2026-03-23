/**
 * Create a test financial goal for a specific user
 * Usage: node test/create_test_goal.js
 */

require('dotenv').config();
const { appDb } = require('../config/supabase');

const TEST_USER_ID = '6b867f4e-6461-416e-8f6c-13ae8e177070';

async function createTestGoal() {
  console.log('🎯 Creating Test Financial Goal');
  console.log('================================\n');
  
  try {
    const testGoal = {
      user_id: TEST_USER_ID,
      title: 'Emergency Fund',
      description: 'Build a 6-month emergency fund for financial security',
      target_amount: 300000,
      current_saved: 50000,
      target_date: '2026-12-31',
      status: 'active'
    };

    console.log('📝 Goal Details:');
    console.log(JSON.stringify(testGoal, null, 2));
    console.log('\n💾 Inserting into database...\n');

    const { data, error } = await appDb
      .from('financialgoals')
      .insert([testGoal])
      .select()
      .single();

    if (error) {
      console.error('❌ Database Error:', error);
      throw error;
    }

    console.log('✅ Goal created successfully!');
    console.log('\n📊 Created Goal:');
    console.log('================');
    console.log(`Goal ID: ${data.goal_id}`);
    console.log(`Title: ${data.title}`);
    console.log(`Description: ${data.description}`);
    console.log(`Target Amount: ₹${data.target_amount?.toLocaleString('en-IN')}`);
    console.log(`Current Saved: ₹${data.current_saved?.toLocaleString('en-IN')}`);
    console.log(`Target Date: ${data.target_date}`);
    console.log(`Status: ${data.status}`);
    console.log(`Created At: ${data.created_at}`);

    console.log('\n💡 You can now:');
    console.log('   1. Run: node test/test_goals_for_user.js');
    console.log('   2. Check the Goals page in the frontend');

  } catch (error) {
    console.error('\n❌ Failed to create goal:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the creation
createTestGoal()
  .then(() => {
    console.log('\n✅ Test goal creation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Creation failed:', error);
    process.exit(1);
  });
