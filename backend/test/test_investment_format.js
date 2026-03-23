/**
 * Test script to verify investment API returns correct data format
 */

const testInvestmentFormat = async () => {
  try {
    console.log('Testing Investment API Format...\n');
    
    const response = await fetch('http://localhost:3000/api/investments/by-account?accountNumber=5893143322');
    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ API Error:', result.error);
      return;
    }
    
    console.log('✅ API Response Successful\n');
    
    const data = result.data;
    
    // Test overall structure
    console.log('📊 Overall Investment Data:');
    console.log(`   Total Investments: ₹${data.totalInvestments?.toLocaleString('en-IN') || 0}`);
    console.log(`   Stocks Total: ₹${data.stocks?.totalValue?.toLocaleString('en-IN') || 0}`);
    console.log(`   Mutual Funds Total: ₹${data.mutualFunds?.totalValue?.toLocaleString('en-IN') || 0}`);
    console.log(`   Fixed Deposits Total: ₹${data.fixedDeposits?.totalValue?.toLocaleString('en-IN') || 0}`);
    console.log('');
    
    // Test stocks structure
    if (data.stocks && data.stocks.holdings && data.stocks.holdings.length > 0) {
      console.log('📈 Stocks Holdings (checking field names):');
      data.stocks.holdings.forEach((stock, idx) => {
        console.log(`\n   Stock ${idx + 1}:`);
        console.log(`   ├─ stock_name: ${stock.stock_name || '❌ MISSING'}`);
        console.log(`   ├─ quantity: ${stock.quantity || '❌ MISSING'}`);
        console.log(`   ├─ current_price: ₹${stock.current_price?.toLocaleString('en-IN') || '❌ MISSING'}`);
        console.log(`   ├─ current_value: ₹${stock.current_value?.toLocaleString('en-IN') || '❌ MISSING'}`);
        console.log(`   └─ profit_loss: ₹${stock.profit_loss?.toLocaleString('en-IN') || '❌ MISSING'}`);
      });
    } else {
      console.log('❌ No stock holdings found');
    }
    
    console.log('\n');
    
    // Test mutual funds structure
    if (data.mutualFunds && data.mutualFunds.funds && data.mutualFunds.funds.length > 0) {
      console.log('📊 Mutual Funds (checking field names):');
      data.mutualFunds.funds.forEach((fund, idx) => {
        console.log(`\n   Fund ${idx + 1}:`);
        console.log(`   ├─ fund_name: ${fund.fund_name || '❌ MISSING'}`);
        console.log(`   ├─ units: ${fund.units || '❌ MISSING'}`);
        console.log(`   ├─ nav: ₹${fund.nav?.toLocaleString('en-IN') || '❌ MISSING'}`);
        console.log(`   ├─ current_value: ₹${fund.current_value?.toLocaleString('en-IN') || '❌ MISSING'}`);
        console.log(`   └─ profit_loss: ₹${fund.profit_loss?.toLocaleString('en-IN') || '❌ MISSING'}`);
      });
    }
    
    console.log('\n\n✅ Test Complete!');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
};

testInvestmentFormat();
