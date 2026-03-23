import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Particles } from "@/components/ui/particles";
import { Mail, ArrowRight, AlertCircle, ArrowLeft, CheckCircle, BarChart3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      console.log('ForgotPassword: Requesting password reset for:', email);
      const { error } = await resetPassword(email);
      
      if (error) {
        console.error('ForgotPassword: Error:', error);
        setError(error.message || 'Failed to send reset email. Please try again.');
      } else {
        console.log('ForgotPassword: Reset email sent successfully');
        setSuccess(true);
      }
    } catch (err) {
      console.error('ForgotPassword: Unexpected error:', err);
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
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
        <Particles
          className="absolute inset-0"
          quantity={100}
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

        <div className="w-full max-w-md relative z-10">
          <div className="bg-card/95 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl p-8 sm:p-12 border border-white/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Check Your Email
              </h1>
              <p className="text-muted-foreground">
                We've sent a password reset link to <span className="font-semibold text-foreground">{email}</span>
              </p>
            </div>

            <Alert className="mb-6">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Please check your email and click the reset link to create a new password. 
                The link will expire in 1 hour for security reasons.
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again with a different email address.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => setSuccess(false)}
                  variant="outline" 
                  className="w-full"
                >
                  Try Different Email
                </Button>
                
                <Button 
                  onClick={handleBackToLogin}
                  className="w-full bg-white text-black hover:bg-white/90 font-medium"
                >
                  Back to Login
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      <Particles
        className="absolute inset-0"
        quantity={100}
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

      <motion.div 
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-card/95 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl p-8 sm:p-12 border border-white/20">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Forgot Password?
            </h1>
            <p className="text-muted-foreground">
              No worries! Enter your email and we'll send you a reset link
            </p>
          </motion.div>

          {error && (
            <motion.div variants={itemVariants}>
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants} className="relative bg-muted/40 p-4 rounded-lg">
              <div className="relative flex items-center">
                <div className="z-10 bg-background p-1 rounded-full border">
                  <Mail className="h-4 w-4 text-foreground" />
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full pl-4 py-2 bg-transparent text-foreground focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-white/90 font-medium h-12 text-base flex items-center justify-center"
                disabled={isLoading}
              >
                <span>{isLoading ? "Sending Reset Link..." : "Send Reset Link"}</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Login
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Remember your password?{" "}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                Sign in here
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
