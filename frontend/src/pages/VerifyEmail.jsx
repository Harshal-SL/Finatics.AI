import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Particles } from "@/components/ui/particles";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const VerifyEmail = () => {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, resendConfirmation, checkEmailVerification, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    console.log('VerifyEmail: Component mounted', { 
      isAuthenticated, 
      user: user?.email, 
      emailConfirmed: user?.email_confirmed_at,
      loading 
    });
    
    if (loading) {
      console.log('VerifyEmail: Still loading, waiting...');
      return;
    }

    // Give more time for authentication to settle after sign-up
    const timeoutId = setTimeout(() => {
      if (!isAuthenticated || !user) {
        console.log('VerifyEmail: No authenticated user after timeout, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }

      // If email is already verified, redirect to profile creation
      if (user.email_confirmed_at) {
        console.log('VerifyEmail: Email already verified, redirecting to create-profile');
        navigate('/create-profile', { replace: true });
        return;
      }

      console.log('VerifyEmail: User needs email verification, starting periodic check');

      // Check verification status periodically
      const interval = setInterval(async () => {
        console.log('VerifyEmail: Checking verification status...');
        try {
          const isVerified = await checkEmailVerification();
          if (isVerified) {
            console.log('VerifyEmail: Email verified! Redirecting to create-profile');
            clearInterval(interval);
            navigate('/create-profile', { replace: true });
          }
        } catch (error) {
          console.error('VerifyEmail: Error checking verification:', error);
        }
      }, 3000); // Check every 3 seconds

      // Cleanup function
      return () => {
        console.log('VerifyEmail: Cleaning up interval');
        clearInterval(interval);
      };
    }, 1000); // Wait 1 second for auth to settle

    return () => clearTimeout(timeoutId);
  }, [user, isAuthenticated, navigate, checkEmailVerification, loading]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await resendConfirmation(user.email);
      
      if (error) {
        setError(error.message);
      } else {
        setMessage('Verification email sent! Please check your inbox.');
      }
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-success/5 to-background flex items-center justify-center p-4">
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color="#ffffff"
        refresh={false}
      />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src="/logo.png" alt="Finatics.AI Logo" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-bold text-foreground">Finatics.AI</span>
          </Link>
        </div>

        <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              We've sent a verification link to <br />
              <span className="font-medium text-foreground">{user.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the verification link in your email to continue. 
                This page will automatically update once verified.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleResendEmail}
                  variant="outline" 
                  className="w-full"
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 w-4 h-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>

                {/* Temporary test button for development */}
                <Button 
                  onClick={() => {
                    console.log('Manual redirect to create-profile for testing');
                    navigate('/create-profile', { replace: true });
                  }}
                  variant="secondary" 
                  className="w-full"
                >
                  Skip Verification (Test Only)
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try resending.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link 
            to="/login" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
