const axios = require('axios');

/**
 * Comprehensive Test for Goals Endpoints
 * Run this with: node test/test_goals_endpoint.js
 * Make sure the server is running first!
 */

const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = '6b867f4e-6461-416e-8f6c-13ae8e177070';

let createdGoalId = null;

async function testGetUserGoals() {
  console.log('\n📋 TEST 1: Get User Goals');
  console.log('═══════════════════════════════════════');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/goals`, {
      params: { userId: TEST_USER_ID }
    });

    console.log('✅ Status:', response.status);
    console.log('✅ Found', response.data.data.length, 'goals');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

async function testAnalyzeAndSaveGoal() {
  console.log('\n🎯 TEST 2: Analyze and Save Goal');
  console.log('═══════════════════════════════════════');
  
  const testData = {
    userId: TEST_USER_ID,
    title: 'Buy a Car',
    description: 'Save for a new car purchase',
    targetAmount: 500000,
    targetDate: '2027-12-31',
    riskTolerance: 'Medium',
    saveToDatabase: true
  };

  try {
    console.log('📤 Request:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/api/goals`, testData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000
    });

    console.log('✅ Status:', response.status);
    console.log('✅ Analysis completed');
    
    if (response.data.data.savedGoal) {
      createdGoalId = response.data.data.savedGoal.goal_id;
      console.log('✅ Goal saved with ID:', createdGoalId);
      console.log('Goal details:', JSON.stringify(response.data.data.savedGoal, null, 2));
    }
    
    console.log('\n📊 User Metrics:', JSON.stringify(response.data.data.userMetrics, null, 2));
    console.log('\n💡 Risk Plans:');
    const plans = response.data.data.goalAnalysis.riskBasedPlans;
    console.log('  - Low Risk SIP:', plans.lowRiskPlan.actionPlan.requiredMonthlySIP);
    console.log('  - Medium Risk SIP:', plans.mediumRiskPlan.actionPlan.requiredMonthlySIP);
    console.log('  - High Risk SIP:', plans.highRiskPlan.actionPlan.requiredMonthlySIP);
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

async function testUpdateGoal() {
  if (!createdGoalId) {
    console.log('\n⚠️ TEST 3: Update Goal - SKIPPED (no goal created)');
    return true;
  }

  console.log('\n📝 TEST 3: Update Goal Progress');
  console.log('═══════════════════════════════════════');
  
  const updateData = {
    currentSaved: 50000,
    status: 'active'
  };

  try {
    console.log('📤 Updating goal:', createdGoalId);
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    const response = await axios.put(
      `${BASE_URL}/api/goals/${createdGoalId}`,
      updateData,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('✅ Status:', response.status);
    console.log('✅ Updated goal:', JSON.stringify(response.data.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

async function testDeleteGoal() {
  if (!createdGoalId) {
    console.log('\n⚠️ TEST 4: Delete Goal - SKIPPED (no goal created)');
    return true;
  }

  console.log('\n🗑️ TEST 4: Delete Goal');
  console.log('═══════════════════════════════════════');
  
  try {
    console.log('📤 Deleting goal:', createdGoalId);
    
    const response = await axios.delete(`${BASE_URL}/api/goals/${createdGoalId}`);

    console.log('✅ Status:', response.status);
    console.log('✅ Goal deleted');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n🧪 GOALS ENDPOINT COMPREHENSIVE TEST SUITE');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Testing User ID:', TEST_USER_ID);
  console.log('Base URL:', BASE_URL);
  
  const results = [];
  
  results.push({ name: 'Get User Goals', passed: await testGetUserGoals() });
  results.push({ name: 'Analyze and Save Goal', passed: await testAnalyzeAndSaveGoal() });
  results.push({ name: 'Update Goal', passed: await testUpdateGoal() });
  results.push({ name: 'Delete Goal', passed: await testDeleteGoal() });
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.name}`);
  });
  
  const passCount = results.filter(r => r.passed).length;
  console.log(`\n${passCount}/${results.length} tests passed`);
  
  if (passCount === results.length) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed');
    process.exit(1);
  }
}

// Run all tests
runAllTests();
