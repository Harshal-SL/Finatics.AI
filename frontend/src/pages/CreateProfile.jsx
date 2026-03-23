import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Particles } from "@/components/ui/particles";
import { BarChart3, User, Phone, Calendar, Briefcase, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CreateProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const navigate = useNavigate();
  const { user, createUserProfile, isAuthenticated } = useAuth();

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    navigate('/login', { replace: true });
    return null;
  }

  // Check if email is verified - if not, redirect to login with message
  if (!user.email_confirmed_at) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const pin = formData.get('pin');
    const confirmPin = formData.get('confirmPin');

    // Validate PIN
    if (pin !== confirmPin) {
      setError('PINs do not match. Please try again.');
      setIsLoading(false);
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits.');
      setIsLoading(false);
      return;
    }

    const profileData = {
      full_name: formData.get('fullName'),
      phone: formData.get('phone'),
      date_of_birth: formData.get('dateOfBirth'),
      occupation: formData.get('occupation'),
      pin: pin
    };

    console.log('CreateProfile: Submitting profile data:', { ...profileData, pin: '****' });

    try {
      const result = await createUserProfile(profileData);
      
      if (result.success) {
        console.log('CreateProfile: Profile created successfully');
        // Mark PIN as verified for this session since they just created it
        try {
          sessionStorage.setItem(`pin_verified_${user.id}`, 'true');
        } catch (err) {
          console.warn('CreateProfile: Could not set pin verification in sessionStorage', err);
        }
        // For new users, redirect to Add Bank Account page first
        navigate('/add-bank-account', { replace: true });
      } else {
        setError(result.error || 'Failed to create profile');
      }
    } catch (err) {
      console.error('CreateProfile: Error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
      <div className="w-full max-w-2xl relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src="/logo.png" alt="Finatics.AI Logo" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-bold text-white">Finatics.AI</span>
          </Link>
        </div>

        <Card className="border border-white/20 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Help us personalize your financial experience
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
              {/* Connected Input Fields - Booking Form Style */}
              <div className="relative bg-muted/40 p-6 rounded-2xl">
                <div className="absolute left-8 top-20 bottom-20 w-px bg-border border-l border-dashed"></div>
                
                {/* Name */}
                <div className="relative flex items-start gap-4 mb-6">
                  <div className="z-10 bg-background p-2 rounded-full border-2 border-primary shadow-lg flex-shrink-0 mt-1">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="fullName" className="block text-sm font-semibold mb-2">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full h-12 px-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="relative flex items-start gap-4 mb-6">
                  <div className="z-10 bg-background p-2 rounded-full border-2 border-primary shadow-lg flex-shrink-0 mt-1">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="phone" className="block text-sm font-semibold mb-2">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="w-full h-12 px-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="relative flex items-start gap-4 mb-6">
                  <div className="z-10 bg-background p-2 rounded-full border-2 border-primary shadow-lg flex-shrink-0 mt-1">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="dateOfBirth" className="block text-sm font-semibold mb-2">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      className="w-full h-12 px-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                </div>

                {/* Occupation */}
                <div className="relative flex items-start gap-4">
                  <div className="z-10 bg-background p-2 rounded-full border-2 border-primary shadow-lg flex-shrink-0 mt-1">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="occupation" className="block text-sm font-semibold mb-2">Occupation *</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      type="text"
                      placeholder="Your job title/profession"
                      className="w-full h-12 px-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* PIN Setup */}
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Set Security PIN
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create a 4-digit PIN for secure access to your account
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pin">PIN (4 digits) *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="pin"
                        name="pin"
                        type={showPin ? "text" : "password"}
                        placeholder="Enter 4-digit PIN"
                        className="pl-10 pr-10"
                        maxLength="4"
                        pattern="[0-9]{4}"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPin(!showPin)}
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPin">Confirm PIN *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPin"
                        name="confirmPin"
                        type={showConfirmPin ? "text" : "password"}
                        placeholder="Confirm 4-digit PIN"
                        className="pl-10 pr-10"
                        maxLength="4"
                        pattern="[0-9]{4}"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                      >
                        {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit" 
                className="w-full h-14 bg-white text-black rounded-2xl font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                disabled={isLoading}
              >
                {isLoading ? "Creating Profile..." : "Continue"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Your information is secure and will be used to personalize your financial experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;
