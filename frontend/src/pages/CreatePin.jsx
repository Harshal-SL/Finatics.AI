import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Particles } from "@/components/ui/particles";
import { Shield, ArrowRight, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CreatePin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const navigate = useNavigate();
  const { user, createSecretPin, isAuthenticated } = useAuth();

  // Redirect if not authenticated or email not verified
  if (!isAuthenticated || !user) {
    navigate('/login', { replace: true });
    return null;
  }

  if (!user.email_confirmed_at) {
    navigate('/verify-email', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate PIN
    if (pin.length !== 6) {
      setError('PIN must be exactly 6 digits');
      setIsLoading(false);
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      setIsLoading(false);
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      setError('PIN must contain only numbers');
      setIsLoading(false);
      return;
    }

    console.log('CreatePin: Creating secret PIN');

    try {
      const result = await createSecretPin(pin);
      
      if (result.success) {
        console.log('CreatePin: PIN created successfully');
        // Mark PIN as verified for this session so ProtectedRoute allows access
        try {
          sessionStorage.setItem(`pin_verified_${user.id}`, 'true');
        } catch (err) {
          console.warn('CreatePin: Could not set pin verification in sessionStorage', err);
        }
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Failed to create PIN');
      }
    } catch (err) {
      console.error('CreatePin: Error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = (value, isConfirm = false) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    
    if (isConfirm) {
      setConfirmPin(numericValue);
    } else {
      setPin(numericValue);
    }
  };

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
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Create Security PIN
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Set up a 6-digit PIN to secure your account
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
                <Label htmlFor="pin">Create 6-Digit PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter 6-digit PIN"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground text-center">
                  Use numbers only (0-9)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPin">Confirm PIN</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  placeholder="Re-enter PIN"
                  value={confirmPin}
                  onChange={(e) => handlePinChange(e.target.value, true)}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              {/* PIN strength indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">PIN Requirements:</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center space-x-2 ${pin.length === 6 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${pin.length === 6 ? 'bg-green-600' : 'bg-muted'}`}></div>
                    <span>Exactly 6 digits</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${/^\d+$/.test(pin) && pin.length > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${/^\d+$/.test(pin) && pin.length > 0 ? 'bg-green-600' : 'bg-muted'}`}></div>
                    <span>Numbers only</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${pin === confirmPin && pin.length === 6 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${pin === confirmPin && pin.length === 6 ? 'bg-green-600' : 'bg-muted'}`}></div>
                    <span>PINs match</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-medium mb-1">Important Security Notes:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Choose a PIN that's not easily guessable</li>
                      <li>• Don't use sequential numbers (123456)</li>
                      <li>• Don't use repeated numbers (111111)</li>
                      <li>• Keep your PIN confidential</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="solid"
                size="lg"
                className="w-full font-semibold"
                disabled={isLoading || pin.length !== 6 || pin !== confirmPin}
              >
                <span className="flex items-center justify-center">
                  {isLoading ? "Creating PIN..." : "Create PIN & Continue"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </span>
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Your PIN will be required each time you access your dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreatePin;
