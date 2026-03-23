const { appDb } = require('./config/supabase');

(async () => {
  try {
    console.log('\n=== Checking User Profile ===\n');
    
    const { data: profile, error } = await appDb
      .from('user_profiles')
      .select('*')
      .eq('user_id', 'f2ef5448-7749-4cd5-8aeb-17221ecd0eae')
      .single();
    
    if (error) {
      console.error('Error:', error.message);
    } else {
      console.log('User Profile Data:');
      console.log('- User ID:', profile.user_id);
      console.log('- Full Name:', profile.full_name);
      console.log('- Phone:', profile.phone);
      console.log('- Date of Birth:', profile.dob);
      console.log('\nFull Profile Object:');
      console.log(JSON.stringify(profile, null, 2));
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Exception:', err);
    process.exit(1);
  }
})();
