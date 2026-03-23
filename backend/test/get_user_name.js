const { appDb } = require('./config/supabase');

(async () => {
  try {
    const { data, error } = await appDb
      .from('user_profiles')
      .select('user_id, full_name')
      .eq('user_id', 'f2ef5448-7749-4cd5-8aeb-17221ecd0eae')
      .single();
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('User Profile:', JSON.stringify(data, null, 2));
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Exception:', err);
    process.exit(1);
  }
})();
