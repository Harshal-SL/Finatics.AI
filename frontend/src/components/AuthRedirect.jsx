import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthRedirect = () => {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { user, isAuthenticated, checkUserStatus, checkEmailVerification } = useAuth();

  useEffect(() => {
    const determineRedirect = async () => {
      console.log('AuthRedirect: Determining redirect path...');

      if (!isAuthenticated || !user) {
        console.log('AuthRedirect: Not authenticated, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }

      // Check if email is verified
      const isEmailVerified = user.email_confirmed_at || await checkEmailVerification();
      
      if (!isEmailVerified) {
        console.log('AuthRedirect: Email not verified, redirecting to verify-email');
        navigate('/verify-email', { replace: true });
        return;
      }

      // Check user profile and PIN status
      const { hasProfile, hasPin } = await checkUserStatus();
      
      console.log('AuthRedirect: User status:', { hasProfile, hasPin, isEmailVerified });

      if (!hasProfile) {
        console.log('AuthRedirect: No profile found, redirecting to create-profile');
        navigate('/create-profile', { replace: true });
      } else if (!hasPin) {
        console.log('AuthRedirect: No PIN found, redirecting to create-pin');
        navigate('/create-pin', { replace: true });
      } else {
        console.log('AuthRedirect: Existing user, redirecting to enter-pin');
        navigate('/enter-pin', { replace: true });
      }
    };

    if (isAuthenticated) {
      determineRedirect().finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, user, navigate, checkUserStatus, checkEmailVerification]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-success/5 to-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking your account status...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthRedirect;