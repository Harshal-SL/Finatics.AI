import { useState, useRef } from "react";
import { BarChart3, Shield, ArrowRight, AlertCircle, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Particles } from "@/components/ui/particles";

const EnterPin = () => {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { user, verifySecretPin, isAuthenticated, signOut } = useAuth();

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleChange = (index, value) => {
    if (value.length > 1) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pinCode = pin.join("");
    if (pinCode.length !== 4) {
      setError('Please enter your 4-digit PIN');
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log('EnterPin: Verifying PIN');

    try {
      const result = await verifySecretPin(pinCode);
      
      if (result.success) {
        console.log('EnterPin: PIN verified successfully');
        // Mark PIN as verified in session storage
        sessionStorage.setItem(`pin_verified_${user.id}`, 'true');
        navigate('/dashboard', { replace: true });
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setError('Too many failed attempts. For security, you have been signed out.');
          setTimeout(async () => {
            await signOut();
            navigate('/login', { replace: true });
          }, 2000);
        } else {
          setError(`Incorrect PIN. ${3 - newAttempts} attempts remaining.`);
        }
        setPin(["", "", "", ""]); // Clear PIN input
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('EnterPin: Error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color="#ffffff"
        refresh={false}
      />
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/5 via-white/10 to-black/95" />

        <div className="relative z-10 p-8 py-14">
          {/* Logo */}
          <Link to="/" className="absolute top-6 left-6 inline-flex items-center space-x-2">
            <img src="/logo.png" alt="Finatics.AI" className="w-10 h-10 object-contain" />
            <span className="text-lg font-bold text-white">Finatics.AI</span>
          </Link>

          <div className="text-center mb-8">
            <div className="w-8 h-8 mx-auto mb-6 text-white">
              <Zap className="w-full h-full" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-3">Enter Security PIN</h1>
            <p className="text-white/70 text-sm leading-relaxed">
              Welcome back,
              <br />
              <span className="text-white">{user?.user_metadata?.full_name || user?.email}</span>
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/50">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-4 mb-8">
              {pin.map((digit, index) => (
                <div key={index} className="relative">
                  <input
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-14 text-center text-xl font-medium bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all duration-200 shadow-lg rounded-2xl"
                    placeholder="•"
                    autoFocus={index === 0}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || pin.join("").length !== 4 || attempts >= 3}
              className="w-full py-3 px-4 bg-white text-black rounded-2xl font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? "Verifying..." : "Access Dashboard"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {attempts > 0 && attempts < 3 && (
            <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/50 rounded-lg">
              <p className="text-xs text-amber-400 text-center">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Failed attempts: {attempts}/3
              </p>
            </div>
          )}

          <div className="text-center mt-8">
            <button
              type="button"
              onClick={handleSignOut}
              className="text-white/60 hover:text-white text-sm transition-colors duration-200"
            >
              Sign out
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-white/50 text-xs leading-relaxed">
              By continuing, you agree to our{" "}
              <button className="text-white/70 hover:text-white underline transition-colors">Terms of Service</button> &{" "}
              <button className="text-white/70 hover:text-white underline transition-colors">Privacy Policy</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterPin;
