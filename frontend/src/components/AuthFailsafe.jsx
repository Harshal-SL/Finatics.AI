import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const AuthFailsafe = () => {
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    // If we detect an invalid authentication state (authenticated but no user)
    // this might indicate a bug in the auth logic
    if (isAuthenticated && !user) {
      console.error('AUTH FAILSAFE: Invalid state - authenticated but no user!');
      console.error('AUTH FAILSAFE: This suggests a bug in authentication logic');
    }
    
    if (!loading) {
      console.log('AUTH FAILSAFE: Authentication state stabilized:', {
        isAuthenticated,
        hasUser: !!user,
        userEmail: user?.email || 'none'
      });
    }
  }, [isAuthenticated, user, loading]);

  return null; // This component doesn't render anything
};

export default AuthFailsafe;