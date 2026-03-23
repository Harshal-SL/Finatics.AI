import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Particles } from "@/components/ui/particles";

import { useAuth } from "@/contexts/AuthContext";
import { 
  Building2, 
  CreditCard, 
  BarChart3, 
  ChevronRight,
  Shield,
  Plus,
  Check,
  AlertCircle
} from "lucide-react";

const AddBankAccount = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountData, setAccountData] = useState({
    bankName: '',
    accountNumber: '',
    routingNumber: '', // IFSC code
    accountType: ''
  });

  // Popular Indian banks
  const popularBanks = [
    { id: 'hdfc', name: 'HDFC Bank', logo: '🏛️' },
    { id: 'axis', name: 'Axis Bank', logo: '🏢' },
    { id: 'icici', name: 'ICICI Bank', logo: '�' },
    { id: 'sbi', name: 'State Bank of India', logo: '🏦' },
    { id: 'kotak', name: 'Kotak Mahindra Bank', logo: '�' },
    { id: 'other', name: 'Other Bank', logo: '🏦' }
  ];

  const handleBankSelect = (bank) => {
    setSelectedBank(bank.id);
    setAccountData({ ...accountData, bankName: bank.name });
    if (bank.id !== 'other') {
      setCurrentStep(2);
    }
  };

  const handleInputChange = (field, value) => {
    setAccountData({ ...accountData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Prepare the data to send to the backend
      const bankAccountPayload = {
        userid: user.id, // Backend expects 'userid'
        bank_name: accountData.bankName,
        ifsc_code: accountData.routingNumber, // IFSC code
        account_type: accountData.accountType
      };

      console.log('Sending bank account data to backend:', bankAccountPayload);

      // Call the backend API
      const response = await fetch('http://localhost:3000/api/bank-accounts/add-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id // Send user ID in header for auth
        },
        body: JSON.stringify(bankAccountPayload)
      });

      const result = await response.json();
      console.log('Backend response:', result);

      if (!response.ok) {
        console.error('Error response:', result);
        throw new Error(result.message || result.error || 'Failed to add bank account');
      }

      if (result.success) {
        console.log('Bank account added successfully:', result.data);
        // Navigate to dashboard after successful account addition
        navigate('/dashboard');
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError('Failed to add bank account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      {/* Particles Background */}
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color="#ffffff"
        refresh={false}
      />

      <div className="w-full max-w-4xl relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src="/logo.png" alt="Finatics.AI Logo" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-bold text-white">Finatics.AI</span>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-success">Profile Created</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <span className="text-sm font-medium">2</span>
              </div>
              <span className={`text-sm font-medium ${
                currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'
              }`}>
                Add Bank Account
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">3</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
            </div>
          </div>
        </div>

        <Card className="border border-white/20 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Connect Your Bank Account
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Link your bank account to get personalized financial insights and track your expenses automatically
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Security Notice */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-primary">Bank-level Security</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your financial data is encrypted and protected with the same security standards used by banks.
                  </p>
                </div>
              </div>
            </div>

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Select Your Bank</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {popularBanks.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => handleBankSelect(bank)}
                        className={`p-4 border-2 rounded-lg transition-all hover:border-primary/50 hover:bg-primary/5 ${
                          selectedBank === bank.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border bg-background'
                        }`}
                      >
                        <div className="text-2xl mb-2">{bank.logo}</div>
                        <div className="text-sm font-medium text-foreground">{bank.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedBank === 'other' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customBank">Bank Name</Label>
                      <Input
                        id="customBank"
                        placeholder="Enter your bank name"
                        value={accountData.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                      />
                    </div>
                    <AnimatedButton 
                      onClick={() => setCurrentStep(2)}
                      disabled={!accountData.bankName.trim()}
                      className="w-full"
                    >
                      Continue
                    </AnimatedButton>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Account Details for {accountData.bankName}
                  </h3>
                </div>

                {/* Booking Form Style */}
                <div className="relative bg-muted/40 p-6 rounded-2xl">
                  <div className="absolute left-8 top-20 bottom-20 w-px bg-border border-l border-dashed"></div>
                  
                  {/* Account Type */}
                  <div className="relative flex items-start gap-4 mb-6">
                    <div className="z-10 bg-background p-2 rounded-full border-2 border-primary shadow-lg flex-shrink-0 mt-1">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="accountType" className="block text-sm font-semibold mb-2">Account Type *</Label>
                      <Select onValueChange={(value) => handleInputChange('accountType', value)}>
                        <SelectTrigger className="w-full h-12">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="savings">Savings Account</SelectItem>
                          <SelectItem value="current">Current Account</SelectItem>
                          <SelectItem value="salary">Salary Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Account Number */}
                  <div className="relative flex items-start gap-4 mb-6">
                    <div className="z-10 bg-background p-2 rounded-full border-2 border-primary shadow-lg flex-shrink-0 mt-1">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="accountNumber" className="block text-sm font-semibold mb-2">Account Number *</Label>
                      <Input
                        id="accountNumber"
                        placeholder="Your account number"
                        value={accountData.accountNumber}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        className="w-full h-12 px-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                  </div>

                  {/* IFSC Code */}
                  <div className="relative flex items-start gap-4">
                    <div className="z-10 bg-background p-2 rounded-full border-2 border-primary shadow-lg flex-shrink-0 mt-1">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="routingNumber" className="block text-sm font-semibold mb-2">IFSC Code *</Label>
                      <Input
                        id="routingNumber"
                        placeholder="Bank IFSC code"
                        value={accountData.routingNumber}
                        onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                        className="w-full h-12 px-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <span className="text-sm text-destructive">{error}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-3">
                  <button
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-14 bg-white text-black rounded-2xl font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Adding Account...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span>Add Bank Account</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button" 
                    onClick={handleSkip}
                    className="w-full h-12 bg-transparent text-white border border-white/20 rounded-2xl font-semibold hover:bg-white/10 transition-all duration-200"
                  >
                    Skip for Now
                  </button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  You can always add or remove bank accounts later from your dashboard settings.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddBankAccount;
