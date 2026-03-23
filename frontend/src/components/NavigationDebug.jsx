import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const NavigationDebug = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('NavigationDebug: Current location:', location.pathname);
    console.log('NavigationDebug: Auth state:', { 
      loading, 
      isAuthenticated, 
      userEmail: user?.email || 'none' 
    });
    
    // Check if there's any automatic navigation happening
    if (location.pathname === '/' && !loading && isAuthenticated) {
      console.log('NavigationDebug: WARNING - User is authenticated on home page, this might cause redirect');
    } else if (location.pathname === '/' && !loading && !isAuthenticated) {
      console.log('NavigationDebug: CORRECT - User is not authenticated on home page');
    }
  }, [location, loading, isAuthenticated, user]);

  return null; // Debug component - render nothing
  
  /* Debug UI disabled - uncomment to enable
  return (
    <div className="fixed bottom-4 left-4 bg-red-600 text-white p-3 rounded text-xs z-50 max-w-xs">
      <div className="font-bold mb-1">Navigation Debug</div>
      <div>Path: {location.pathname}</div>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>Auth: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>User: {user?.email || 'None'}</div>
    </div>
  );
  */
};

export default NavigationDebug;