import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user, checkUserStatus, checkEmailVerification } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      console.log('ProtectedRoute check:', {
        loading,
        isAuthenticated,
        user: user?.email || 'No user',
        path: location.pathname
      });

      if (loading) {
        return; // Still loading, don't check yet
      }

      // If not authenticated, redirect to login
      if (!isAuthenticated || !user) {
        console.log('ProtectedRoute: User not authenticated, redirecting to login');
        setRedirectPath('/');
        setChecking(false);
        return;
      }

      // Check if email is verified first
      const isEmailVerified = user.email_confirmed_at || await checkEmailVerification();
      
      if (!isEmailVerified) {
        console.log('ProtectedRoute: Email not verified, redirecting to login');
        setRedirectPath('/');
        setChecking(false);
        return;
      }

      // Check user profile and PIN status
      const { hasProfile, hasPin } = await checkUserStatus();

      console.log('ProtectedRoute: User status:', { hasProfile, hasPin, isEmailVerified });

      if (!hasProfile) {
        console.log('ProtectedRoute: No profile found, redirecting to create-profile');
        setRedirectPath('/create-profile');
        setChecking(false);
        return;
      }

      // For existing users with profile and PIN, require PIN verification in session
      if (hasProfile && hasPin) {
        try {
          const pinVerified = sessionStorage.getItem(`pin_verified_${user.id}`) === 'true';
          if (!pinVerified) {
            console.log('ProtectedRoute: Existing user - PIN not verified in session, redirecting to enter-pin');
            setRedirectPath('/enter-pin');
            setChecking(false);
            return;
          }
        } catch (err) {
          console.warn('ProtectedRoute: Could not read pin verification from sessionStorage', err);
          setRedirectPath('/enter-pin');
          setChecking(false);
          return;
        }
      }

      console.log('ProtectedRoute: All checks passed, rendering protected content');
      setChecking(false);
    };

    checkAccess();
  }, [loading, isAuthenticated, user, location, checkUserStatus, checkEmailVerification]);

  // Show loading spinner while checking authentication and access
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {loading ? 'Checking authentication...' : 'Verifying access...'}
          </p>
        </div>
      </div>
    );
  }

  // Redirect if needed
  if (redirectPath) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;