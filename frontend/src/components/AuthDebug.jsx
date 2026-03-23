import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const AuthDebug = () => {
  const { isAuthenticated, user, loading, supabase } = useAuth();

  useEffect(() => {
    console.log('=== AUTH DEBUG INFO ===');
    console.log('Loading:', loading);
    console.log('Is Authenticated:', isAuthenticated);
    console.log('User:', user);
    console.log('Supabase client:', supabase);
    
    // Test supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('Current session:', data);
        console.log('Session error:', error);
      } catch (err) {
        console.error('Supabase connection error:', err);
      }
    };
    
    testConnection();
  }, [isAuthenticated, user, loading, supabase]);

  return (
    <div className="fixed top-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>User: {user ? user.email || 'Unknown' : 'None'}</div>
      <div>Supabase: {supabase ? 'Connected' : 'Not Connected'}</div>
    </div>
  );
};

export default AuthDebug;