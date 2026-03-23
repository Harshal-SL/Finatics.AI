import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const DebugRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('DebugRoute - ALWAYS ALLOW ACCESS (for testing):', {
      loading,
      isAuthenticated,
      user: user?.email || 'No user',
      path: location.pathname
    });
  }, [loading, isAuthenticated, user, location]);

  // For debugging - ALWAYS allow access
  console.log('DebugRoute: ALLOWING ACCESS FOR DEBUGGING');
  return children;
};

export default DebugRoute;