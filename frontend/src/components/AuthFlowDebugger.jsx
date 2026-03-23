import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const AuthFlowDebugger = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('🔍 AuthFlowDebugger - State Change:', {
      path: location.pathname,
      timestamp: new Date().toISOString(),
      loading,
      isAuthenticated,
      userEmail: user?.email,
      emailConfirmed: user?.email_confirmed_at,
      userId: user?.id
    });
  }, [location.pathname, loading, isAuthenticated, user]);

  return null; // This component only logs, doesn't render anything
};

export default AuthFlowDebugger;