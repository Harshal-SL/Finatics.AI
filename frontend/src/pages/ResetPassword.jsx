import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Particles } from "@/components/ui/particles";
import { Lock, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasMaxLength = password.length <= 20;
  const hasCapitalLetter = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isValidLength = hasMinLength && hasMaxLength;
  const isPasswordValid = isValidLength && hasCapitalLetter && hasSpecialChar;
  const passwordsMatch = password === confirmPassword;

  useEffect(() => {
    // Check if we have the required tokens from the email link
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (!accessToken || !refreshToken || type !== 'recovery') {
      console.error('ResetPassword: Invalid or missing tokens');
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      setIsLoading(false);
      return;
    }

    // Validate password requirements
    if (!isPasswordValid) {
      setError('Password does not meet the requirements. Please check the criteria below.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('ResetPassword: Updating password');
      const { error } = await updatePassword(password);
      
      if (error) {
        console.error('ResetPassword: Error updating password:', error);
        setError(error.message || 'Failed to update password. Please try again.');
      } else {
        console.log('ResetPassword: Password updated successfully');
        setSuccess(true);
      }
    } catch (err) {
      console.error('ResetPassword: Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login', { replace: true });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-success/5 to-background flex items-center justify-center p-4">
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
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Password Reset Successful!
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your password has been successfully updated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You can now sign in with your new password. For security, you'll need to sign in again.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleBackToLogin}
                className="w-full bg-gradient-to-r from-primary to-success"
              >
                Continue to Login
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Create a new secure password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="pl-10 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {password.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Password Requirements:
                  </div>
                  <div className="space-y-1">
                    <div className={`flex items-center space-x-2 text-xs ${isValidLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <div className={`w-2 h-2 rounded-full ${isValidLength ? 'bg-green-600' : 'bg-muted'}`}></div>
                      <span>8-20 characters {password.length > 0 && `(${password.length})`}</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-xs ${hasCapitalLetter ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <div className={`w-2 h-2 rounded-full ${hasCapitalLetter ? 'bg-green-600' : 'bg-muted'}`}></div>
                      <span>At least 1 capital letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-xs ${hasSpecialChar ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <div className={`w-2 h-2 rounded-full ${hasSpecialChar ? 'bg-green-600' : 'bg-muted'}`}></div>
                      <span>At least 1 special character (!@#$%^&*)</span>
                    </div>
                    {confirmPassword.length > 0 && (
                      <div className={`flex items-center space-x-2 text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${passwordsMatch ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        <span>Passwords match</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-success"
                disabled={isLoading || !isPasswordValid || !passwordsMatch}
              >
                {isLoading ? "Updating Password..." : "Update Password"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToLogin}
                className="text-muted-foreground hover:text-foreground"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
