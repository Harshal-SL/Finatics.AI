import { useState, useEffect, useRef } from "react";
import API_BASE_URL from "@/lib/api";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GlowEffect } from "@/components/ui/glow-effect";
import { Particles } from "@/components/ui/particles";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { 
  Calculator, 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  CreditCard,
  Wallet,
  Calendar,
  Percent,
  IndianRupee,
  Shield,
  Sparkles,
  Info,
  ChevronDown,
  Home,
  Car,
  GraduationCap,
  Briefcase,
  User,
  LineChart as LineChartIcon,
  Target,
  BookOpen,
  LogOut,
  MessageSquare,
  Lightbulb,
  CheckCircle2
} from "lucide-react";

// Custom hook for click outside detection
function useClickAway(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// Icon wrapper with animation
const IconWrapper = ({ icon: Icon, isHovered, color }) => (
  <motion.div 
    className="w-4 h-4 mr-2 relative" 
    initial={false} 
    animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
  >
    <Icon className="w-4 h-4" />
    {isHovered && (
      <motion.div
        className="absolute inset-0"
        style={{ color }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <Icon className="w-4 h-4" strokeWidth={2} />
      </motion.div>
    )}
  </motion.div>
);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const LoanAnalyzer = () => {
  const { user } = useAuth();
  const [loanAmount, setLoanAmount] = useState("");
  const [loanType, setLoanType] = useState("Personal Loan");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [hoveredLoanType, setHoveredLoanType] = useState(null);
  const dropdownRef = useRef(null);

  useClickAway(dropdownRef, () => setIsDropdownOpen(false));

  const loanTypes = [
    { value: "Personal Loan", label: "Personal Loan", icon: User, color: "#A06CD5" },
    { value: "Home Loan", label: "Home Loan", icon: Home, color: "#F9C74F" },
    { value: "Car Loan", label: "Car Loan", icon: Car, color: "#4ECDC4" },
    { value: "Education Loan", label: "Education Loan", icon: GraduationCap, color: "#45B7D1" },
    { value: "Business Loan", label: "Business Loan", icon: Briefcase, color: "#FF6B6B" },
  ];

  const analyzeWithAI = async () => {
    if (!user?.id) {
      setError("Please log in to use the loan analyzer");
      return;
    }

    if (!loanAmount || parseFloat(loanAmount) <= 0) {
      setError("Please enter a valid loan amount");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/loan-analyzer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          loanAmount: parseFloat(loanAmount),
          loanType: loanType
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to analyze loan');
      }

      setAnalysis(result.data);
      console.log('Loan Analysis Result:', result.data);
    } catch (err) {
      console.error('Error analyzing loan:', err);
      setError(err.message || 'Failed to analyze loan. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Navigation items for navbar
  const navItems = [
    { name: "Dashboard", url: "/dashboard", icon: Home },
    { name: "Investments", url: "/stocks", icon: LineChartIcon },
    { name: "Goals", url: "/goals", icon: Target },
    { name: "Loan Analyzer", url: "/loan-analyzer", icon: Calculator },
    { name: "Learn", url: "/learn", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-black relative">
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color="#ffffff"
        refresh={false}
      />
      {/* Navbar */}
      <Navbar items={navItems} className="" showLogo={true} />
      
      {/* Logout Button */}
      <button
        onClick={async () => { await signOut(); navigate('/login'); }}
        className="fixed top-8 right-8 flex items-center gap-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 rounded-full text-destructive hover:text-destructive transition-all duration-200 backdrop-blur-lg"
        style={{ zIndex: 9999 }}
      >
        <LogOut size={18} />
        <span className="hidden sm:inline">Logout</span>
      </button>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32 relative">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-success/20 backdrop-blur-sm border border-white/10 mb-4">
            <Calculator className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
            AI Loan Analyzer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get personalized loan recommendations powered by advanced AI analysis
          </p>
        </motion.div>

        {/* Input Section - Enhanced Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-4xl mx-auto mb-12 relative"
        >
          <div className="rounded-3xl bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-2xl p-8 shadow-2xl border border-white/20">
            <form onSubmit={(e) => { e.preventDefault(); analyzeWithAI(); }} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Loan Type Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <Label className="text-base font-semibold text-card-foreground flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Select Loan Type
                  </Label>
                  
                  <MotionConfig reducedMotion="user">
                    <div className="relative z-50" ref={dropdownRef}>
                      <Button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={cn(
                          "w-full flex justify-between items-center h-14 rounded-xl border-2 border-input bg-background/70 backdrop-blur-sm text-foreground",
                          "hover:bg-background hover:border-primary/50",
                          "focus:ring-2 focus:ring-primary focus:border-primary",
                          "transition-all duration-200 ease-in-out text-base font-medium",
                          isDropdownOpen && "bg-background border-primary",
                        )}
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="true"
                      >
                        <span className="flex items-center gap-2">
                          <IconWrapper 
                            icon={loanTypes.find(t => t.value === loanType)?.icon || User} 
                            isHovered={false} 
                            color={loanTypes.find(t => t.value === loanType)?.color || "#A06CD5"} 
                          />
                          {loanType}
                        </span>
                        <motion.div
                          animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-center"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </motion.div>
                      </Button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 1, y: 0, height: 0 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              height: "auto",
                              transition: {
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                                mass: 1,
                              },
                            }}
                            exit={{
                              opacity: 0,
                              y: 0,
                              height: 0,
                              transition: {
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                                mass: 1,
                              },
                            }}
                            className="absolute left-0 right-0 top-full mt-2 z-50"
                          >
                            <motion.div
                              className="w-full rounded-xl border-2 border-input bg-card/95 backdrop-blur-2xl p-1 shadow-2xl"
                              initial={{ borderRadius: 12 }}
                              animate={{
                                borderRadius: 12,
                                transition: { duration: 0.2 },
                              }}
                              style={{ transformOrigin: "top" }}
                            >
                              <motion.div 
                                className="py-2 relative" 
                                variants={containerVariants} 
                                initial="hidden" 
                                animate="visible"
                              >
                                <motion.div
                                  layoutId="hover-highlight"
                                  className="absolute inset-x-1 bg-primary/10 rounded-lg"
                                  animate={{
                                    y: loanTypes.findIndex((t) => (hoveredLoanType || loanType) === t.value) * 48,
                                    height: 48,
                                  }}
                                  transition={{
                                    type: "spring",
                                    bounce: 0.15,
                                    duration: 0.5,
                                  }}
                                />
                                {loanTypes.map((type) => (
                                  <motion.button
                                    key={type.value}
                                    type="button"
                                    onClick={() => {
                                      setLoanType(type.value);
                                      setIsDropdownOpen(false);
                                    }}
                                    onHoverStart={() => setHoveredLoanType(type.value)}
                                    onHoverEnd={() => setHoveredLoanType(null)}
                                    className={cn(
                                      "relative flex w-full items-center px-4 py-3 text-base rounded-lg",
                                      "transition-colors duration-150",
                                      "focus:outline-none",
                                      loanType === type.value || hoveredLoanType === type.value
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground",
                                    )}
                                    whileTap={{ scale: 0.98 }}
                                    variants={itemVariants}
                                  >
                                    <IconWrapper
                                      icon={type.icon}
                                      isHovered={hoveredLoanType === type.value}
                                      color={type.color}
                                    />
                                    {type.label}
                                  </motion.button>
                                ))}
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </MotionConfig>
                </motion.div>

                {/* Loan Amount Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <Label className="text-base font-semibold text-card-foreground flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    Loan Amount
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      placeholder="250000"
                      className="h-14 w-full rounded-xl border-2 border-input bg-background/70 backdrop-blur-sm pl-12 pr-4 text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all text-base font-medium hover:border-primary/50"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/30 backdrop-blur-sm"
                  >
                    <p className="text-sm text-destructive flex items-center gap-2 font-medium">
                      <AlertTriangle className="w-5 h-5" />
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  type="submit"
                  variant="solid"
                  size="lg"
                  className="h-16 w-full text-lg font-bold shadow-lg hover:shadow-xl transition-shadow"
                  disabled={!loanAmount || isAnalyzing}
                >
                  <motion.span
                    className="flex items-center justify-center gap-3"
                    whileTap={{ scale: 0.98 }}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing Your Loan Options...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        Analyze with AI
                      </>
                    )}
                  </motion.span>
                </Button>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Financial Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-6 h-6 text-primary" />
                  <h2 className="text-3xl font-bold text-foreground">Financial Overview</h2>
                </div>
                <p className="text-muted-foreground mb-6">Based on your 3-month transaction history</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="group relative overflow-hidden rounded-2xl bg-black border-2 border-green-500/50 backdrop-blur-sm p-6 hover:border-green-500 transition-all"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white/70">Credit Score</span>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="text-4xl font-bold text-white mb-2">
                        {analysis.credit_score || 'N/A'}
                      </div>
                      <p className="text-xs text-white/60">Excellent rating</p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="group relative overflow-hidden rounded-2xl bg-black border-2 border-blue-500/50 backdrop-blur-sm p-6 hover:border-blue-500 transition-all"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white/70">Avg. Savings</span>
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-4xl font-bold text-white mb-2">
                        ₹{analysis.average_savings?.toLocaleString('en-IN') || '0'}
                      </div>
                      <p className="text-xs text-white/60">Per month</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="group relative overflow-hidden rounded-2xl bg-black border-2 border-gray-500/50 backdrop-blur-sm p-6 hover:border-gray-400 transition-all"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white/70">Monthly Expenses</span>
                        <Wallet className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="text-4xl font-bold text-white mb-2">
                        ₹{analysis.average_expenses?.toLocaleString('en-IN') || '0'}
                      </div>
                      <p className="text-xs text-white/60">Average spending</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Loan Options */}
              {analysis.loan_options ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Brain className="w-6 h-6 text-primary" />
                    <h2 className="text-3xl font-bold text-foreground">AI-Recommended Plans</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">Choose the plan that best fits your financial situation</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {analysis.loan_options.options.map((option, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border-2 backdrop-blur-sm p-6 transition-all hover:shadow-2xl hover:scale-[1.02] cursor-pointer",
                          option.type === 'LOW RISK' 
                            ? 'bg-gradient-to-br from-success/20 to-success/5 border-success/40 hover:border-success/60 hover:shadow-success/20' 
                            : option.type === 'MODERATE RISK'
                            ? 'bg-gradient-to-br from-primary/20 to-primary/5 border-primary/40 hover:border-primary/60 hover:shadow-primary/20'
                            : 'bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/40 hover:border-orange-500/60 hover:shadow-orange-500/20',
                          option.recommended && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        )}
                      >
                        {option.recommended && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 }}
                            className="absolute -top-3 -right-3"
                          >
                            <Badge className="bg-gradient-to-r from-primary to-success text-white px-3 py-1 text-xs font-bold shadow-lg">
                              ⭐ BEST CHOICE
                            </Badge>
                          </motion.div>
                        )}
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{option.icon}</span>
                            <Badge variant="outline" className={cn(
                              "text-xs font-semibold",
                              option.type === 'LOW RISK' ? 'border-success text-success' :
                              option.type === 'MODERATE RISK' ? 'border-primary text-primary' :
                              'border-orange-500 text-orange-500'
                            )}>
                              {option.type}
                            </Badge>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-foreground mb-4">{option.title}</h3>
                        
                        <div className="mb-6">
                          <div className="text-sm text-muted-foreground mb-1">Monthly EMI</div>
                          <div className={cn(
                            "text-4xl font-bold",
                            option.type === 'LOW RISK' ? 'text-success' :
                            option.type === 'MODERATE RISK' ? 'text-primary' :
                            'text-orange-500'
                          )}>
                            ₹{Math.round(option.monthlyEmi).toLocaleString('en-IN')}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>Tenure</span>
                            </div>
                            <span className="font-semibold text-foreground">{option.tenure} Years</span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Percent className="w-4 h-4" />
                              <span>Interest</span>
                            </div>
                            <span className="font-semibold text-foreground">{option.interestRate}% p.a.</span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <IndianRupee className="w-4 h-4" />
                              <span>Total</span>
                            </div>
                            <span className="font-semibold text-foreground">₹{Math.round(option.totalPayable).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Risk</span>
                            </div>
                            <span className="font-semibold text-foreground">{option.riskLevel}%</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recommendation & Insights */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                      className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 backdrop-blur-sm p-6"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-foreground mb-2">AI Recommendation</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.loan_options.recommendation}</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                      className="rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-muted/20 backdrop-blur-sm p-6"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted/30">
                          <Info className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-foreground mb-3">Key Insights</h4>
                          <ul className="space-y-2">
                            {analysis.loan_options.insights.map((insight, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span className="flex-1">{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Loan Details - Rate & Tenure Ranges */}
                  {analysis.loan_options.rateRange && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 }}
                      className="mt-6 grid md:grid-cols-2 gap-6"
                    >
                      <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20 backdrop-blur-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Percent className="w-5 h-5 text-blue-500" />
                          <h4 className="font-bold text-lg text-foreground">Interest Rate</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Range:</span>
                            <span className="font-semibold text-foreground">{analysis.loan_options.rateRange}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Your Rate:</span>
                            <span className="font-bold text-blue-500">{analysis.loan_options.bestRate}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-2 border-purple-500/20 backdrop-blur-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Calendar className="w-5 h-5 text-purple-500" />
                          <h4 className="font-bold text-lg text-foreground">Tenure</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Range:</span>
                            <span className="font-semibold text-foreground">{analysis.loan_options.tenureRange}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Best:</span>
                            <span className="font-bold text-purple-500">{analysis.loan_options.bestTenure}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Loan Tips Section */}
                  {analysis.loan_options.tips && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      className="mt-6 grid md:grid-cols-3 gap-6"
                    >
                      {/* Loan Type Insights */}
                      <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-2 border-amber-500/20 backdrop-blur-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Lightbulb className="w-5 h-5 text-amber-500" />
                          <h4 className="font-bold text-lg text-foreground">Loan Insights</h4>
                        </div>
                        <ul className="space-y-2">
                          {analysis.loan_options.tips.insights.map((tip, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5">•</span>
                              <span className="flex-1">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Getting Loan Tips */}
                      <div className="rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20 backdrop-blur-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <h4 className="font-bold text-lg text-foreground">Getting Loan</h4>
                        </div>
                        <ul className="space-y-2">
                          {analysis.loan_options.tips.gettingLoan.map((tip, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">•</span>
                              <span className="flex-1">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Repayment Strategies */}
                      <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-2 border-cyan-500/20 backdrop-blur-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <TrendingUp className="w-5 h-5 text-cyan-500" />
                          <h4 className="font-bold text-lg text-foreground">Repayment Tips</h4>
                        </div>
                        <ul className="space-y-2">
                          {analysis.loan_options.tips.repayment.map((tip, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-cyan-500 mt-0.5">•</span>
                              <span className="flex-1">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-2xl bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-2xl p-8 shadow-xl border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Brain className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl font-bold text-foreground">AI Analysis</h3>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-muted-foreground leading-relaxed font-mono text-sm bg-background/50 p-6 rounded-xl border border-border">
                      {analysis.ai_response}
                    </pre>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default LoanAnalyzer;
