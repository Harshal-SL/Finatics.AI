import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Particles } from "@/components/ui/particles";
import { Mail, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, Shield, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

const Login = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp, loading } = useAuth();

  // Password validation functions
  const hasMinLength = password.length >= 8;
  const hasMaxLength = password.length <= 20;
  const hasCapitalLetter = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isValidLength = hasMinLength && hasMaxLength;
  const isPasswordValid = isValidLength && hasCapitalLetter && hasSpecialChar;

  // Clear messages when switching modes
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setMessage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPassword('');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-success/5 to-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      setIsLoading(false);
      return;
    }
    
    console.log('SignIn: Attempting to authenticate:', email);
    
    try {
      const { data, error } = await signIn(email, password);
      
      console.log('SignIn: Response:', { 
        hasData: !!data, 
        hasUser: !!data?.user, 
        userEmail: data?.user?.email,
        error: error?.message 
      });
      
      if (error) {
        // Handle specific error cases for better user experience
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials or sign up if you don\'t have an account.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else if (error.message.includes('User not found')) {
          setError('No account found with this email. Please sign up first.');
        } else {
          setError(error.message);
        }
        console.error('SignIn: Error:', error);
      } else if (data?.user) {
        console.log('SignIn: Successful login for:', data.user.email);
        // Clear PIN verification for existing users so they need to enter PIN
        try {
          sessionStorage.removeItem(`pin_verified_${data.user.id}`);
        } catch (err) {
          console.warn('SignIn: Could not clear pin verification from sessionStorage', err);
        }
        // For sign-in, redirect to dashboard (ProtectedRoute will handle PIN check)
        navigate('/dashboard', { replace: true });
      } else {
        console.warn('SignIn: No error but no user data received');
        setError('Login failed - please check your credentials');
      }
    } catch (err) {
      console.error('SignIn: Unexpected error:', err);
      setError('An unexpected error occurred: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const fullName = formData.get('name');
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      setIsLoading(false);
      return;
    }

    // Validate password requirements
    if (password.length < 8 || password.length > 20) {
      setError('Password must be between 8-20 characters long.');
      setIsLoading(false);
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least 1 capital letter.');
      setIsLoading(false);
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError('Password must contain at least 1 special character.');
      setIsLoading(false);
      return;
    }
    
    console.log('=== SIGNUP PROCESS START ===');
    
    try {
      const { data, error } = await signUp(email, password, {
        full_name: fullName
      });
      
      if (error) {
        setError(error.message);
      } else if (data?.user) {
        console.log('SignUp: SUCCESS - User created:', data.user.email);
        
        // Show verification message on the same page
        setMessage(`Account created successfully! Please check your email (${email}) for a verification link. After verifying your email, you can sign in.`);
        
        // Switch to sign-in mode after showing the message
        setTimeout(() => {
          setIsSignUp(false);
        }, 2000);
      } else {
        console.log('SignUp: No user data received');
        setError('Account creation failed - please try again');
      }
    } catch (err) {
      console.error('SignUp: Exception caught:', err);
      setError('An unexpected error occurred: ' + err.message);
    } finally {
      console.log('SignUp: Setting loading to false');
      setIsLoading(false);
      console.log('=== SIGNUP PROCESS END ===');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      {/* Particles Background */}
      <Particles
        className="absolute inset-0"
        quantity={150}
        ease={80}
        color="#ffffff"
        refresh={false}
      />

      {/* Logo - Fixed top left */}
      <Link 
        to="/" 
        className="fixed top-6 left-6 flex items-center gap-3 px-5 py-2.5 bg-card/50 hover:bg-card border border-border rounded-full transition-all duration-200 backdrop-blur-lg z-[9999]"
      >
        <img src="/logo.png" alt="Finatics.AI" className="w-12 h-12 object-contain" />
        <span className="text-lg font-bold text-foreground">Finatics.AI</span>
      </Link>

      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-card/95 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
          {/* Left Side: Form */}
          <motion.div 
            className="p-8 sm:p-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="text-sm text-muted-foreground flex items-center">
                <Shield className="inline-block h-4 w-4 mr-2" />
                Secure Financial Platform
                <button 
                  onClick={toggleMode}
                  className="ml-auto text-sm font-medium text-primary hover:underline"
                >
                  {isSignUp ? "Already have an account?" : "Need an account?"}
                </button>
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-muted-foreground mb-8">
              {isSignUp ? "Start managing your finances with AI" : "Sign in to access your dashboard"}
            </motion.p>

            {/* Error/Message Alert */}
            {(error || message) && (
              <motion.div variants={itemVariants}>
                <Alert variant={error ? "destructive" : "default"} className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error || message}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              {/* Inputs with connecting line */}
              <motion.div variants={itemVariants} className="relative bg-muted/40 p-4 rounded-lg">
                <div className="absolute left-6 top-9 bottom-9 w-px bg-border border-l border-dashed"></div>
                
                {/* Name field for signup */}
                {isSignUp && (
                  <>
                    <div className="relative flex items-center mb-2">
                      <div className="z-10 bg-background p-1 rounded-full border">
                        <User className="h-4 w-4 text-foreground" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        className="w-full pl-4 py-2 bg-transparent text-foreground focus:outline-none"
                        required
                      />
                    </div>
                    <hr className="border-border mx-12 mb-2" />
                  </>
                )}

                {/* Email */}
                <div className="relative flex items-center mb-2">
                  <div className="z-10 bg-background p-1 rounded-full border">
                    <Mail className="h-4 w-4 text-foreground" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    className="w-full pl-4 py-2 bg-transparent text-foreground focus:outline-none"
                    required
                  />
                </div>
                
                <hr className="border-border mx-12" />

                {/* Password */}
                <div className="relative flex items-center mt-2 mb-2">
                  <div className="z-10 bg-background p-1 rounded-full border">
                    <Lock className="h-4 w-4 text-foreground" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 bg-transparent text-foreground focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>

                <hr className="border-border mx-12" />

                {/* Confirm Password */}
                <div className="relative flex items-center mt-2">
                  <div className="z-10 bg-background p-1 rounded-full border">
                    <Lock className="h-4 w-4 text-foreground" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="w-full pl-4 pr-10 py-2 bg-transparent text-foreground focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              {/* Password Requirements for Signup */}
              {isSignUp && password.length > 0 && (
                <motion.div variants={itemVariants} className="space-y-2 bg-muted/20 p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Password must have:</div>
                  <div className="space-y-1">
                    <div className={cn("flex items-center gap-2 text-xs", isValidLength ? "text-green-500" : "text-muted-foreground")}>
                      <div className={cn("w-2 h-2 rounded-full", isValidLength ? "bg-green-500" : "bg-muted")} />
                      8-20 characters {password.length > 0 && `(${password.length})`}
                    </div>
                    <div className={cn("flex items-center gap-2 text-xs", hasCapitalLetter ? "text-green-500" : "text-muted-foreground")}>
                      <div className={cn("w-2 h-2 rounded-full", hasCapitalLetter ? "bg-green-500" : "bg-muted")} />
                      1 uppercase letter (A-Z)
                    </div>
                    <div className={cn("flex items-center gap-2 text-xs", hasSpecialChar ? "text-green-500" : "text-muted-foreground")}>
                      <div className={cn("w-2 h-2 rounded-full", hasSpecialChar ? "bg-green-500" : "bg-muted")} />
                      1 special character (!@#$%)
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="space-y-4 pt-4">
                <Button
                  type="submit"
                  variant="solid"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isLoading || (isSignUp && !isPasswordValid)}
                >
                  {isLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
                </Button>

                {!isSignUp && (
                  <Link
                    to="/forgot-password"
                    className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot your password?
                  </Link>
                )}

                <div className="text-center text-sm text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <Link to="/terms" className="text-primary hover:underline">Terms</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </div>
              </motion.div>
            </form>
          </motion.div>

          {/* Right Side: Image */}
          <motion.div 
            className="hidden lg:block w-full h-full min-h-[600px] relative bg-gradient-to-br from-primary/20 to-success/20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="text-center space-y-6">
                <Calendar className="w-24 h-24 mx-auto text-primary" />
                <h2 className="text-3xl font-bold text-foreground">
                  Smart Financial Management
                </h2>
                <p className="text-lg text-muted-foreground max-w-md">
                  Track expenses, analyze loans, set goals, and get AI-powered insights for better financial decisions.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
export default Login;
