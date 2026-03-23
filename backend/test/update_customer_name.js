require('dotenv').config();
const { bankingDb } = require('../config/supabase');

async function updateCustomerName() {
  try {
    console.log('Updating customer name from Tara Walia to Harshal...');
    
    const { data, error } = await bankingDb
      .from('customers')
      .update({ full_name: 'Harshal' })
      .eq('customer_id', 1)
      .select();

    if (error) {
      console.error('❌ Error updating customer:', error);
      return;
    }

    console.log('✅ Successfully updated customer name to Harshal');
    console.log('Updated data:', data);

    // Verify the update
    const { data: customer, error: fetchError } = await bankingDb
      .from('customers')
      .select('*')
      .eq('customer_id', 1)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching customer:', fetchError);
      return;
    }

    console.log('\n📋 Current customer data:');
    console.log('Customer ID:', customer.customer_id);
    console.log('Full Name:', customer.full_name);
    console.log('Email:', customer.email);
    console.log('Phone:', customer.phone);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateCustomerName();
