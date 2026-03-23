/**
 * Test Supabase Auth Configuration
 * Run this in the browser console to test authentication
 */

import { supabase } from './src/lib/supabase.js';

async function testSupabaseAuth() {
  console.log('=== SUPABASE AUTH TEST ===');
  
  try {
    // Test 1: Check if Supabase client is created
    console.log('1. Supabase client:', supabase);
    
    // Test 2: Check current session
    console.log('2. Getting current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Current session:', session);
    console.log('Session error:', sessionError);
    
    // Test 3: Try to get user
    console.log('3. Getting current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', user);
    console.log('User error:', userError);
    
    // Test 4: Check if we can access a public table
    console.log('4. Testing public table access...');
    const { data: testData, error: testError } = await supabase
      .from('auth_users')
      .select('count')
      .limit(1);
    console.log('Public table test:', testData);
    console.log('Table error:', testError);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testSupabaseAuth();