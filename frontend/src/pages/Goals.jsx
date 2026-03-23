import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Particles } from '@/components/ui/particles';
import Navbar from '@/components/layout/Navbar';
import { GlowEffect } from '@/components/ui/glow-effect';
import { Target, TrendingUp, Calendar, DollarSign, Bot, Plus, CheckCircle2, AlertCircle, Trash2, Sparkles, TrendingDown, Award, Shield, Zap, Home, LineChart as LineChartIcon, BookOpen, MessageSquare, Calculator, User, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const parseCurrencyNumber = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || /∞|inf|nan/i.test(trimmed)) {
      return null;
    }
    const numericPortion = trimmed.replace(/[^0-9.-]+/g, '');
    if (!numericPortion) {
      return null;
    }
    const parsed = Number(numericPortion);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const MIN_FALLBACK_MONTHS = 12;
const RISK_SIP_ADJUSTMENTS = {
  low: 1.25, // conservative plans need a higher contribution
  medium: 1.0,
  high: 0.8 // aggressive plans assume higher returns, so SIP can be smaller
};

const formatCurrencyINR = (value, maximumFractionDigits = 0) => {
  const numericValue = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits
  }).format(numericValue);
};

const selectNumericPlanValue = (rawValue, fallbackValue = null, options = {}) => {
  const {
    allowNegative = false,
    strategy = 'min',
    capValue,
    floorValue = 0
  } = options;

  const candidates = [];
  const addCandidate = (candidate) => {
    const parsed = typeof candidate === 'number' ? candidate : parseCurrencyNumber(candidate);
    if (typeof parsed === 'number' && Number.isFinite(parsed)) {
      if (!allowNegative && parsed < 0) {
        return;
      }
      candidates.push(parsed);
    }
  };

  addCandidate(rawValue);
  addCandidate(fallbackValue);

  if (!candidates.length) {
    const baseValue = allowNegative ? 0 : Math.max(0, Number(floorValue) || 0);
    candidates.push(baseValue);
  }

  let selected;
  if (strategy === 'max') {
    selected = Math.max(...candidates);
  } else if (strategy === 'abs-min') {
    selected = candidates.reduce((best, current) => (
      best === undefined || Math.abs(current) < Math.abs(best) ? current : best
    ), undefined);
  } else {
    selected = Math.min(...candidates);
  }

  if (Number.isFinite(capValue) && capValue > 0) {
    const cap = Math.abs(capValue);
    if (allowNegative && selected < 0) {
      selected = Math.max(selected, -cap);
    } else {
      selected = Math.min(selected, cap);
    }
  }

  if (!allowNegative) {
    selected = Math.max(0, selected);
  }

  return selected;
};

const formatPlanCurrency = (rawValue, fallbackValue = 0, options = {}) => {
  const { maximumFractionDigits = 0, ...rest } = options;
  const numericValue = selectNumericPlanValue(rawValue, fallbackValue, rest);
  return formatCurrencyINR(numericValue, maximumFractionDigits);
};

const calculateMonthsUntilTarget = (targetDateString) => {
  if (!targetDateString) {
    return 0;
  }
  const targetDate = new Date(targetDateString);
  const now = new Date();
  if (Number.isNaN(targetDate.getTime())) {
    return 0;
  }
  const years = targetDate.getFullYear() - now.getFullYear();
  const months = targetDate.getMonth() - now.getMonth();
  const totalMonths = years * 12 + months;
  const dayAdjustment = targetDate.getDate() >= now.getDate() ? 0 : -1;
  const result = totalMonths + dayAdjustment;
  return result > 0 ? result : 0;
};

const computeGoalFallbacks = (goal) => {
  const targetCandidates = [
    goal?.target_amount,
    goal?.targetAmount,
    goal?.goal_target,
    goal?.targetValue,
  ];
  const targetAmount = targetCandidates.reduce((resolved, candidate) => {
    if (resolved !== null) return resolved;
    const parsed = parseCurrencyNumber(candidate);
    return parsed !== null ? parsed : null;
  }, null) ?? 0;

  const currentCandidates = [
    goal?.current_saved,
    goal?.currentSaved,
    goal?.current_amount,
    goal?.currentAmount,
  ];
  const currentSaved = currentCandidates.reduce((resolved, candidate) => {
    if (resolved !== null) return resolved;
    const parsed = parseCurrencyNumber(candidate);
    return parsed !== null ? parsed : null;
  }, null) ?? 0;

  const rawMonths = Math.max(1, calculateMonthsUntilTarget(goal?.target_date || goal?.targetDate));
  const fallbackMonths = Math.max(MIN_FALLBACK_MONTHS, rawMonths);
  const outstanding = Math.max(0, targetAmount - currentSaved);
  const fallbackSip = fallbackMonths > 0 ? outstanding / fallbackMonths : outstanding;
  const fallbackShortfall = targetAmount - currentSaved;

  return {
    targetAmount,
    currentSaved,
    months: rawMonths,
    fallbackMonths,
    fallbackSip,
    fallbackShortfall,
  };
};

const sanitizeAIDescription = (text, fallbackSip, fallbackShortfall, capValue) => {
  if (!text) {
    return text;
  }
  const withSip = text.replace(
    /(Required Monthly SIP:\s*)([^\n]+)/i,
    (_, label, value) => `${label}${formatPlanCurrency(value, fallbackSip, { capValue, strategy: 'min' })}`
  );

  const sanitized = withSip.replace(
    /(Savings Shortfall\/Surplus:\s*)([^\n]+)/i,
    (_, label, value) => `${label}${formatPlanCurrency(value, fallbackShortfall, {
      allowNegative: true,
      capValue,
      strategy: 'abs-min'
    })}`
  );

  return sanitized.replace(/₹(?:∞|-∞|NaN)/gi, formatCurrencyINR(0));
};

const sanitizePlanSummary = (summary, sipText, shortfallText) => {
  if (!summary) {
    return '';
  }

  let sanitized = summary;
  if (sipText) {
    sanitized = sanitized.replace(/(monthly\s+SIP\s+(?:of|is)\s*)₹(?:∞|-∞|NaN)/gi, `$1${sipText}`);
  }
  if (shortfallText) {
    sanitized = sanitized.replace(/(shortfall[^₹]*?)₹(?:∞|-∞|NaN)/gi, `$1${shortfallText}`);
  }
  sanitized = sanitized.replace(/₹(?:∞|-∞|NaN)/gi, sipText || shortfallText || formatCurrencyINR(0));
  return sanitized;
};

const getSanitizedGoalDescription = (goal) => {
  const rawDescription = goal?.description || goal?.ai_recommendations;
  if (!rawDescription) {
    return 'AI-powered analysis and recommendations';
  }
  const { fallbackSip, fallbackShortfall } = computeGoalFallbacks(goal);
  const capValue = Math.max(0, Math.abs(fallbackShortfall));
  return sanitizeAIDescription(rawDescription, fallbackSip, fallbackShortfall, capValue || undefined);
};

const Goals = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Animation variants for booking form style
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [newGoal, setNewGoal] = useState({
    title: '',
    amount: '',
    targetDate: '',
    riskTolerance: 'Medium',
    description: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // For testing: Use hardcoded user ID if no authenticated user
  const TEST_USER_ID = '6b867f4e-6461-416e-8f6c-13ae8e177070';
  const effectiveUserId = user?.id || TEST_USER_ID;

  // Fetch goals on component mount
  useEffect(() => {
    if (effectiveUserId) {
      fetchGoals();
    }
  }, [effectiveUserId]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching goals for user:', effectiveUserId);
      
      const response = await axios.get(`${API_URL}/goals`, {
        params: { userId: effectiveUserId }
      });
      
      console.log('📊 Goals response:', response.data);
      
      if (response.data.success) {
        setGoals(response.data.data || []);
        console.log(`✅ Loaded ${response.data.data?.length || 0} goals`);
      }
    } catch (err) {
      console.error('❌ Error fetching goals:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load goals');
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.amount || !newGoal.targetDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setShowAIAnalysis(true);
      setAiAnalysisResult(null);
      setSelectedPlan(null);
      
      const goalData = {
        userId: effectiveUserId,
        title: newGoal.title,
        targetAmount: parseFloat(newGoal.amount),
        targetDate: newGoal.targetDate,
        riskTolerance: newGoal.riskTolerance,
        description: newGoal.description,
        saveToDatabase: false // Don't save yet, wait for user to select plan
      };

      const response = await axios.post(`${API_URL}/goals`, goalData);
      
      if (response.data.success) {
        // Store AI analysis result
        setAiAnalysisResult(response.data.data);
        toast.success('AI analysis complete! Select a plan to save your goal.');
      }
    } catch (err) {
      console.error('Error creating goal:', err);
      toast.error(err.response?.data?.message || 'Failed to analyze goal');
      setShowAIAnalysis(false);
    }
  };

  const resolvedTargetAmount = useMemo(() => {
    const analysisTarget =
      parseCurrencyNumber(aiAnalysisResult?.goalAnalysis?.goalInput?.targetAmount) ??
      parseCurrencyNumber(aiAnalysisResult?.goalAnalysis?.goalDetails?.targetAmount);
    return analysisTarget ?? parseCurrencyNumber(newGoal.amount) ?? 0;
  }, [aiAnalysisResult, newGoal.amount]);

  const resolvedTargetDate = newGoal.targetDate || aiAnalysisResult?.goalAnalysis?.goalInput?.targetDate || '';

  const monthsUntilGoal = useMemo(() => {
    const months = calculateMonthsUntilTarget(resolvedTargetDate);
    return Math.max(1, months);
  }, [resolvedTargetDate]);

  const resolvedCurrentSavings = useMemo(() => {
    const potentialSources = [
      aiAnalysisResult?.goalAnalysis?.goalInput?.currentSavings,
      aiAnalysisResult?.goalAnalysis?.goalInput?.currentSaved,
      aiAnalysisResult?.goalAnalysis?.goalDetails?.currentSavings,
      aiAnalysisResult?.goalAnalysis?.goalDetails?.currentSaved,
      aiAnalysisResult?.goalAnalysis?.currentProgress?.currentSavings,
      aiAnalysisResult?.goalAnalysis?.currentProgress?.currentSaved,
    ];

    for (const candidate of potentialSources) {
      const parsed = parseCurrencyNumber(candidate);
      if (parsed !== null) {
        return parsed;
      }
    }
    return 0;
  }, [aiAnalysisResult]);

  const outstandingGap = useMemo(() => (
    Math.max(0, resolvedTargetAmount - resolvedCurrentSavings)
  ), [resolvedTargetAmount, resolvedCurrentSavings]);

  const fallbackSipValue = useMemo(() => {
    if (!outstandingGap) {
      return 0;
    }
    const fallbackMonths = Math.max(MIN_FALLBACK_MONTHS, monthsUntilGoal);
    return outstandingGap / fallbackMonths;
  }, [outstandingGap, monthsUntilGoal]);

  const fallbackShortfallValue = useMemo(() => (
    resolvedTargetAmount - resolvedCurrentSavings
  ), [resolvedTargetAmount, resolvedCurrentSavings]);

  const sipCapValue = useMemo(() => (
    outstandingGap || resolvedTargetAmount || undefined
  ), [outstandingGap, resolvedTargetAmount]);

    const planFallbackSips = useMemo(() => {
      const base = Math.max(0, fallbackSipValue || 0);
      return {
        low: base * (RISK_SIP_ADJUSTMENTS.low ?? 1),
        medium: base * (RISK_SIP_ADJUSTMENTS.medium ?? 1),
        high: base * (RISK_SIP_ADJUSTMENTS.high ?? 1),
      };
    }, [fallbackSipValue]);

    const planFallbackShortfalls = useMemo(() => ({
      low: planFallbackSips.low,
      medium: planFallbackSips.medium,
      high: planFallbackSips.high,
    }), [planFallbackSips]);

    const planDisplayValues = useMemo(() => {
      if (!aiAnalysisResult?.goalAnalysis?.riskBasedPlans) {
        return {};
      }

      const build = (planKey) => {
        const plan = aiAnalysisResult.goalAnalysis.riskBasedPlans[`${planKey}RiskPlan`];
        if (!plan) {
          return null;
        }

        const sipDisplay = formatPlanCurrency(
          plan.actionPlan.requiredMonthlySIP,
          planFallbackSips[planKey],
          { capValue: sipCapValue, strategy: 'min' }
        );
        const shortfallDisplay = formatPlanCurrency(
          plan.actionPlan.savingsShortfallOrSurplus,
          planFallbackShortfalls[planKey],
          { allowNegative: true, capValue: sipCapValue, strategy: 'abs-min' }
        );
        const summaryDisplay = sanitizePlanSummary(plan.actionPlan.analysisSummary, sipDisplay, shortfallDisplay);

        return {
          sipDisplay,
          shortfallDisplay,
          summaryDisplay,
        };
      };

      return {
        low: build('low'),
        medium: build('medium'),
        high: build('high'),
      };
    }, [aiAnalysisResult, planFallbackSips, planFallbackShortfalls, sipCapValue]);

  const handleSelectPlan = async (planType) => {
    try {
          const plan = aiAnalysisResult.goalAnalysis.riskBasedPlans[`${planType}RiskPlan`];
          const sipDisplay = formatPlanCurrency(
            plan.actionPlan.requiredMonthlySIP,
            planFallbackSips[planType] ?? fallbackSipValue,
            { capValue: sipCapValue, strategy: 'min' }
          );
      const shortfallDisplay = formatPlanCurrency(
        plan.actionPlan.savingsShortfallOrSurplus,
            planFallbackShortfalls[planType] ?? fallbackShortfallValue,
            { allowNegative: true, capValue: sipCapValue, strategy: 'abs-min' }
      );
          const summaryDisplay = sanitizePlanSummary(plan.actionPlan.analysisSummary, sipDisplay, shortfallDisplay);
      
      // Format AI recommendations for storage
      let aiRecommendations = `${plan.planName} (${plan.assumedCAGR} CAGR)\n\n`;
      aiRecommendations += `Required Monthly SIP: ${sipDisplay}\n`;
      aiRecommendations += `Savings Shortfall/Surplus: ${shortfallDisplay}\n\n`;
      aiRecommendations += `${summaryDisplay}\n\n`;
      aiRecommendations += `Investment Strategy:\n`;
      plan.investmentStrategy.recommendedPortfolio.forEach(item => {
        aiRecommendations += `• ${item.category} (${item.allocationPercent}%): ${item.reasoning}\n`;
      });
      
      const goalData = {
        userId: effectiveUserId,
        title: newGoal.title,
        targetAmount: parseFloat(newGoal.amount),
        targetDate: newGoal.targetDate,
        riskTolerance: planType.charAt(0).toUpperCase() + planType.slice(1),
        description: aiRecommendations,
        saveToDatabase: true
      };

      const response = await axios.post(`${API_URL}/goals`, goalData);
      
      if (response.data.success) {
        toast.success(`Goal created with ${plan.planName}!`);
        setNewGoal({ 
          title: '', 
          amount: '', 
          targetDate: '', 
          riskTolerance: 'Medium',
          description: '' 
        });
        setShowAIAnalysis(false);
        setAiAnalysisResult(null);
        setSelectedPlan(null);
        // Refresh goals list
        await fetchGoals();
      }
    } catch (err) {
      console.error('Error saving goal:', err);
      toast.error(err.response?.data?.message || 'Failed to save goal');
    }
  };

  const handleUpdateGoal = async (goalId, currentSaved) => {
    try {
      const response = await axios.put(`${API_URL}/goals/${goalId}`, {
        currentSaved: currentSaved
      });
      
      if (response.data.success) {
        toast.success('Goal updated successfully!');
        await fetchGoals();
      }
    } catch (err) {
      console.error('Error updating goal:', err);
      toast.error(err.response?.data?.message || 'Failed to update goal');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/goals/${goalId}`);
      
      if (response.data.success) {
        toast.success('Goal deleted successfully!');
        await fetchGoals();
      }
    } catch (err) {
      console.error('Error deleting goal:', err);
      toast.error(err.response?.data?.message || 'Failed to delete goal');
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
      {/* Particles Background */}
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
      
      <main className="container mx-auto px-2 py-8 pt-32 relative">
        <div className="space-y-8">
          {/* Simplified Header */}
          <div className="text-center space-y-4 relative">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Target className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Financial Goals
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              Set your financial goals and let <span className="font-semibold text-white">AI</span> guide you with personalized strategies to achieve them faster.
            </p>
            {!user && (
              <div className="bg-white/5 border border-white/20 rounded-xl p-4 max-w-2xl mx-auto">
                <p className="text-sm text-white flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <strong>Testing Mode:</strong> Using demo user ID for development
                </p>
              </div>
            )}
          </div>

          <Tabs defaultValue="goals" className="space-y-6 relative">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12 bg-white/10 backdrop-blur-sm rounded-full">
              <TabsTrigger value="goals" className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full">
                My Goals
              </TabsTrigger>
              <TabsTrigger value="create" className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full">
                Create New Goal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="goals" className="space-y-6">
              {loading && (
                <div className="text-center py-16">
                  <div className="relative inline-block">
                    <Bot className="h-16 w-16 animate-spin mx-auto mb-4 text-white" />
                  </div>
                  <p className="text-white/70 text-lg font-medium">Loading your goals...</p>
                </div>
              )}

              {error && (
                <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/20 rounded-2xl p-8 text-center shadow-lg">
                  <div className="inline-block p-4 bg-destructive/10 rounded-full mb-4">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                  </div>
                  <p className="text-destructive font-semibold text-xl mb-2">Error loading goals</p>
                  <p className="text-destructive/80 text-sm mb-6">{error}</p>
                  <AnimatedButton onClick={fetchGoals} variant="outline" className="border-destructive/30 hover:bg-destructive/10">
                    Try Again
                  </AnimatedButton>
                </div>
              )}

              {!loading && !error && goals.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-block p-6 bg-gradient-to-br from-muted to-muted/50 rounded-3xl mb-6 shadow-lg">
                    <Target className="h-20 w-20 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">No goals yet</h3>
                  <p className="text-muted-foreground mb-6 text-lg">Create your first financial goal to get AI-powered recommendations</p>
                  <AnimatedButton 
                    onClick={() => document.querySelector('[value="create"]').click()}
                    size="lg"
                    className="shadow-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Goal
                  </AnimatedButton>
                </div>
              )}

              {!loading && !error && goals.length > 0 && (
              <>
              {/* Enhanced Goals Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="group relative overflow-hidden rounded-2xl bg-black border-2 border-blue-500/50 backdrop-blur-sm p-6 hover:border-blue-500 transition-all"
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Target className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70 font-medium">Active Goals</p>
                      <p className="text-3xl font-bold text-white">{goals.filter(g => g.status === 'active').length}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="group relative overflow-hidden rounded-2xl bg-green-900/20 border border-green-500/30 backdrop-blur-sm p-6 hover:border-green-500/50 transition-all"
                >
                  <GlowEffect 
                    colors={['#22c55e', '#15803d', '#166534']} 
                    mode="breathe" 
                    blur="strongest"
                    duration={4}
                  />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <TrendingUp className="h-8 w-8 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70 font-medium">Total Target</p>
                      <p className="text-3xl font-bold text-white">
                        ₹{(goals.reduce((sum, goal) => sum + (goal.target_amount || 0), 0) / 100000).toFixed(1)}L
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="group relative overflow-hidden rounded-2xl bg-black border-2 border-orange-500/50 backdrop-blur-sm p-6 hover:border-orange-500 transition-all"
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-orange-500/20 rounded-xl">
                      <DollarSign className="h-8 w-8 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70 font-medium">Total Saved</p>
                      <p className="text-3xl font-bold text-white">
                        ₹{(goals.reduce((sum, goal) => sum + (goal.current_saved || 0), 0) / 100000).toFixed(1)}L
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Enhanced Goals List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {goals.map((goal, index) => {
                  const progress = ((goal.current_saved || 0) / goal.target_amount) * 100;
                  const isCompleted = progress >= 100;
                  
                  return (
                    <motion.div 
                      key={goal.goal_id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative overflow-hidden rounded-2xl bg-black backdrop-blur-sm transition-all shadow-lg hover:shadow-xl group ${
                        isCompleted 
                          ? 'border-2 border-green-500/50 hover:border-green-500' 
                          : 'border-2 border-blue-500/50 hover:border-blue-500'
                      }`}
                    >
                      
                      <div className="relative z-10 pb-4 pt-6 px-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
                              {goal.title}
                              {isCompleted && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                  <span className="text-xs font-semibold text-green-400">Completed</span>
                                </div>
                              )}
                            </h3>
                            <p className="flex items-center gap-2 text-sm text-white/70">
                              <Calendar className="h-4 w-4" />
                              Target: {new Date(goal.target_date).toLocaleDateString('en-IN', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <Badge 
                            variant={goal.status === 'active' ? 'default' : 'secondary'}
                            className="ml-2"
                          >
                            {goal.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="relative z-10 space-y-4 px-6 pb-6">
                        {/* Progress Section */}
                        <div className="space-y-3 bg-black/40 rounded-xl p-4 border border-white/10">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-white/70">Progress</span>
                            <span className="text-lg font-bold text-blue-400">{progress.toFixed(1)}%</span>
                          </div>
                          <div className="relative">
                            <Progress value={progress} className="h-3" />
                          </div>
                          <div className="flex justify-between text-sm">
                            <div>
                              <p className="text-white/60">Current</p>
                              <p className="font-semibold text-green-400">₹{(goal.current_saved || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white/60">Target</p>
                              <p className="font-semibold text-blue-400">₹{goal.target_amount.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </div>

                        {/* AI Recommendations */}
                        <div className="bg-black/40 p-4 rounded-xl border border-blue-500/20">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                              <Bot className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-blue-400" />
                                AI Recommendations
                              </p>
                              <p className="text-sm text-white/70 line-clamp-3 whitespace-pre-wrap">
                                {getSanitizedGoalDescription(goal)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <AnimatedButton 
                            size="sm" 
                            className="flex-1 shadow-md whitespace-nowrap"
                            onClick={() => {
                              const amount = prompt('Enter amount saved (₹):', goal.current_saved || 0);
                              if (amount !== null && !isNaN(amount)) {
                                handleUpdateGoal(goal.goal_id, parseFloat(amount));
                              }
                            }}
                          >
                            <span className="inline-flex items-center gap-2 whitespace-nowrap">
                              <TrendingUp className="h-4 w-4" />
                              <span>Update Progress</span>
                            </span>
                          </AnimatedButton>
                          <AnimatedButton 
                            size="sm" 
                            variant="outline"
                            className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteGoal(goal.goal_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </AnimatedButton>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              </>
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              {/* Simplified Card Design */}
              <Card className="max-w-3xl mx-auto shadow-lg border border-white/20 overflow-hidden">
                <CardContent className="p-6">
                  {/* Step Indicator */}
                  <div className="mb-8 flex items-center justify-center gap-2">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${!aiAnalysisResult ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center font-bold">1</div>
                      <span className="font-semibold">Goal Details</span>
                    </div>
                    <div className="h-0.5 w-8 bg-gradient-to-r from-primary to-orange-500"></div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${aiAnalysisResult ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-muted-foreground'}`}>
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center font-bold">2</div>
                      <span className="font-semibold">Select Strategy</span>
                    </div>
                  </div>

                  {!aiAnalysisResult ? (
                    /* Goal Input Form - Booking Form Style */
                    <motion.div 
                      className="space-y-6"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {/* Connected Input Fields */}
                      <motion.div variants={itemVariants} className="relative bg-muted/40 p-6 rounded-2xl">
                        <div className="absolute left-8 top-20 bottom-20 w-px bg-border border-l border-dashed"></div>
                        
                        {/* Goal Title */}
                        <div className="relative flex items-start gap-4 mb-6">
                          <div className="z-10 bg-background p-2 rounded-full border-2 border-white shadow-lg flex-shrink-0 mt-1">
                            <Target className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-semibold mb-2">What's your goal?</label>
                            <input
                              type="text"
                              placeholder="e.g., Emergency Fund, Dream Home, Retirement Fund"
                              value={newGoal.title}
                              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                              className="w-full h-12 px-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-foreground"
                            />
                          </div>
                        </div>

                        {/* Target Amount */}
                        <div className="relative flex items-start gap-4 mb-6">
                          <div className="z-10 bg-background p-2 rounded-full border-2 border-blue-500 shadow-lg flex-shrink-0 mt-1">
                            <DollarSign className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-semibold mb-2">How much do you need?</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">₹</span>
                              <input
                                type="number"
                                placeholder="500000"
                                value={newGoal.amount}
                                onChange={(e) => setNewGoal({ ...newGoal, amount: e.target.value })}
                                className="w-full h-12 pl-10 pr-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Target Date */}
                        <div className="relative flex items-start gap-4">
                          <div className="z-10 bg-background p-2 rounded-full border-2 border-white shadow-lg flex-shrink-0 mt-1">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-semibold mb-2">When do you need it?</label>
                            <input
                              type="date"
                              value={newGoal.targetDate}
                              onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                              className="w-full h-12 px-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-foreground"
                            />
                          </div>
                        </div>
                      </motion.div>

                      {/* Description */}
                      <motion.div variants={itemVariants} className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-semibold">
                          <Sparkles className="h-4 w-4 text-blue-500" />
                          Additional Details (Optional)
                        </label>
                        <textarea
                          placeholder="Tell us more about your goal... Any specific requirements or preferences?"
                          value={newGoal.description}
                          onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-foreground"
                        />
                      </motion.div>

                      {/* Submit Button */}
                      <motion.div variants={itemVariants}>
                        <button
                          onClick={handleCreateGoal}
                          disabled={showAIAnalysis || !newGoal.title || !newGoal.amount || !newGoal.targetDate}
                          className="w-full h-14 bg-white text-black rounded-2xl font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                          {showAIAnalysis ? (
                            <>
                              <Bot className="h-5 w-5 animate-spin" />
                              <span>AI is analyzing your goal...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-5 w-5" />
                              <span>Generate AI Investment Plans</span>
                            </>
                          )}
                        </button>
                        
                        {(!newGoal.title || !newGoal.amount || !newGoal.targetDate) && (
                          <p className="text-center text-sm text-muted-foreground mt-3">
                            Please fill in all required fields to continue
                          </p>
                        )}
                      </motion.div>

                      {/* Loading State */}
                      {showAIAnalysis && !aiAnalysisResult && (
                        <motion.div 
                          variants={itemVariants}
                          className="bg-blue-500/10 border-2 border-blue-500/20 rounded-2xl p-6 animate-pulse"
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/10 rounded-xl">
                              <Bot className="h-8 w-8 text-blue-500 animate-bounce" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg mb-2 text-blue-500">AI Analysis in Progress</h4>
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <p className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                  Analyzing your financial goal...
                                </p>
                                <p className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                  Creating personalized investment strategies...
                                </p>
                                <p className="flex items-center gap-2">
                                  <Bot className="h-4 w-4 text-blue-500 animate-spin" />
                                  Calculating optimal asset allocation...
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    /* AI Analysis Results */
                    <div className="space-y-6 w-full">
                      <div className="text-center space-y-3 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <Sparkles className="h-7 w-7 text-primary animate-pulse" />
                          <h3 className="text-3xl font-bold bg-gradient-to-r from-primary via-orange-600 to-red-600 bg-clip-text text-transparent">
                            AI Investment Plans Ready
                          </h3>
                        </div>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                          Choose the plan that matches your <span className="font-semibold text-foreground">risk appetite</span> and financial goals
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        {/* Low Risk Plan */}
                        <Card 
                          className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-2 relative overflow-hidden group ${
                            selectedPlan === 'low' ? 'border-green-500 ring-4 ring-green-200 dark:ring-green-900' : 'hover:border-green-500'
                          }`}
                          onClick={() => setSelectedPlan('low')}
                        >
                          {selectedPlan === 'low' && (
                            <div className="absolute top-0 right-0 bg-gradient-to-bl from-green-500 to-green-600 text-white px-4 py-1.5 text-xs font-bold rounded-bl-xl shadow-lg flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              SELECTED
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <CardHeader className="relative z-10 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b-2 border-green-200 dark:border-green-800 pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                  <Shield className="h-6 w-6 text-green-600" />
                                </div>
                                <CardTitle className="text-xl text-green-700 dark:text-green-400 font-bold">Low Risk</CardTitle>
                              </div>
                              <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 font-semibold text-xs px-3 py-1">
                                Safe
                              </Badge>
                            </div>
                            <CardDescription className="text-green-600 dark:text-green-300 font-medium text-sm mt-1">
                              Conservative growth at {aiAnalysisResult.goalAnalysis.riskBasedPlans.lowRiskPlan.assumedCAGR}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="relative z-10 pt-4 pb-5 space-y-4 bg-white dark:bg-black">
                            <div className="bg-green-50/60 dark:bg-green-950/20 rounded-lg px-4 py-3 flex items-center justify-between border border-green-200/50 dark:border-green-800/50">
                              <span className="text-sm font-semibold text-green-700 dark:text-green-400">Safe</span>
                              <span className="text-lg font-bold text-green-600">{aiAnalysisResult.goalAnalysis.riskBasedPlans.lowRiskPlan.assumedCAGR}</span>
                            </div>
                            {aiAnalysisResult?.goalAnalysis?.riskBasedPlans?.lowRiskPlan?.investmentStrategy?.recommendedPortfolio && (
                              <div className="space-y-2">
                                {aiAnalysisResult.goalAnalysis.riskBasedPlans.lowRiskPlan.investmentStrategy.recommendedPortfolio.map((item, idx) => {
                                  const totalSip = parseFloat(planDisplayValues.low?.sipDisplay?.replace(/[^0-9.-]/g, '') || '0');
                                  const allocatedAmount = Math.round((totalSip * item.allocationPercent) / 100);
                                  return (
                                    <div key={idx} className="bg-black dark:bg-black rounded-lg p-3 border border-muted hover:border-green-400 dark:hover:border-green-600 transition-all hover:shadow-sm">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-base font-bold text-green-600 dark:text-green-400">{item.allocationPercent}%</span>
                                        <span className="text-sm font-bold text-green-600 dark:text-green-400">₹{allocatedAmount.toLocaleString('en-IN')}</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground font-medium leading-tight">{item.category}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            <AnimatedButton 
                              onClick={() => setSelectedPlan('low')} 
                              className="w-full h-11 bg-green-600 hover:bg-green-700 text-white shadow-md text-sm font-semibold flex items-center justify-center rounded-lg mt-4"
                            >
                              {selectedPlan === 'low' ? (
                                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>Selected</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                                  <Shield className="h-4 w-4" />
                                  <span>Select Safe Plan</span>
                                </span>
                              )}
                            </AnimatedButton>
                          </CardContent>
                        </Card>

                        {/* Medium Risk Plan */}
                        <Card 
                          className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-2 relative overflow-hidden group ${
                            selectedPlan === 'medium' ? 'border-blue-500 ring-4 ring-blue-200 dark:ring-blue-900' : 'hover:border-blue-500 ring-2 ring-blue-300 dark:ring-blue-700'
                          }`}
                          onClick={() => setSelectedPlan('medium')}
                        >
                          <div className="absolute top-0 right-0 bg-gradient-to-bl from-blue-500 to-blue-600 text-white px-4 py-1.5 text-xs font-bold rounded-bl-xl shadow-lg flex items-center gap-1">
                            {selectedPlan === 'medium' ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                SELECTED
                              </>
                            ) : (
                              <>
                                <Award className="h-3 w-3" />
                                RECOMMENDED
                              </>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <CardHeader className="relative z-10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-2 border-blue-200 dark:border-blue-800 pb-4">
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
                                  <TrendingUp className="h-6 w-6 text-blue-600" />
                                </div>
                                <CardTitle className="text-lg text-blue-700 dark:text-blue-400 font-bold">Medium Risk</CardTitle>
                              </div>
                              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700 font-semibold text-xs px-3 py-1 flex-shrink-0 whitespace-nowrap">
                                Balanced
                              </Badge>
                            </div>
                            <CardDescription className="text-blue-600 dark:text-blue-300 font-medium text-sm mt-1">
                              Balanced growth at {aiAnalysisResult.goalAnalysis.riskBasedPlans.mediumRiskPlan.assumedCAGR}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="relative z-10 pt-4 pb-5 space-y-4 bg-white dark:bg-black">
                            <div className="bg-blue-50/60 dark:bg-blue-950/20 rounded-lg px-4 py-3 flex items-center justify-between border border-blue-200/50 dark:border-blue-800/50">
                              <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Balanced</span>
                              <span className="text-lg font-bold text-blue-600">{aiAnalysisResult.goalAnalysis.riskBasedPlans.mediumRiskPlan.assumedCAGR}</span>
                            </div>
                            {aiAnalysisResult?.goalAnalysis?.riskBasedPlans?.mediumRiskPlan?.investmentStrategy?.recommendedPortfolio && (
                              <div className="space-y-2">
                                {aiAnalysisResult.goalAnalysis.riskBasedPlans.mediumRiskPlan.investmentStrategy.recommendedPortfolio.map((item, idx) => {
                                  const totalSip = parseFloat(planDisplayValues.medium?.sipDisplay?.replace(/[^0-9.-]/g, '') || '0');
                                  const allocatedAmount = Math.round((totalSip * item.allocationPercent) / 100);
                                  return (
                                    <div key={idx} className="bg-black dark:bg-black rounded-lg p-3 border border-muted hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-sm">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-base font-bold text-blue-600 dark:text-blue-400">{item.allocationPercent}%</span>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">₹{allocatedAmount.toLocaleString('en-IN')}</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground font-medium leading-tight">{item.category}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            <AnimatedButton 
                              onClick={() => setSelectedPlan('medium')} 
                              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md text-sm font-semibold flex items-center justify-center rounded-lg mt-4"
                            >
                              {selectedPlan === 'medium' ? (
                                <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>Selected</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                                  <Award className="h-4 w-4" />
                                  <span>Select Plan</span>
                                </span>
                              )}
                            </AnimatedButton>
                          </CardContent>
                        </Card>

                        {/* High Risk Plan */}
                        <Card 
                          className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-2 relative overflow-hidden group ${
                            selectedPlan === 'high' ? 'border-orange-500 ring-4 ring-orange-200 dark:ring-orange-900' : 'hover:border-orange-500'
                          }`}
                          onClick={() => setSelectedPlan('high')}
                        >
                          {selectedPlan === 'high' && (
                            <div className="absolute top-0 right-0 bg-gradient-to-bl from-orange-500 to-red-600 text-white px-4 py-1.5 text-xs font-bold rounded-bl-xl shadow-lg flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              SELECTED
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <CardHeader className="relative z-10 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-b-2 border-orange-200 dark:border-orange-800 pb-4">
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-lg flex-shrink-0">
                                  <Zap className="h-6 w-6 text-orange-600" />
                                </div>
                                <CardTitle className="text-xl text-orange-700 dark:text-orange-400 font-bold">High Risk</CardTitle>
                              </div>
                              <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700 font-semibold text-xs px-3 py-1 flex-shrink-0 whitespace-nowrap">
                                Aggressive
                              </Badge>
                            </div>
                            <CardDescription className="text-orange-600 dark:text-orange-300 font-medium text-sm mt-1">
                              Aggressive growth at {aiAnalysisResult.goalAnalysis.riskBasedPlans.highRiskPlan.assumedCAGR}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="relative z-10 pt-4 pb-5 space-y-4 bg-white dark:bg-black">
                            <div className="bg-orange-50/60 dark:bg-orange-950/20 rounded-lg px-4 py-3 flex items-center justify-between border border-orange-200/50 dark:border-orange-800/50">
                              <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">Aggressive</span>
                              <span className="text-lg font-bold text-orange-600">{aiAnalysisResult.goalAnalysis.riskBasedPlans.highRiskPlan.assumedCAGR}</span>
                            </div>
                            {aiAnalysisResult?.goalAnalysis?.riskBasedPlans?.highRiskPlan?.investmentStrategy?.recommendedPortfolio && (
                              <div className="space-y-2">
                                {aiAnalysisResult.goalAnalysis.riskBasedPlans.highRiskPlan.investmentStrategy.recommendedPortfolio.map((item, idx) => {
                                  const totalSip = parseFloat(planDisplayValues.high?.sipDisplay?.replace(/[^0-9.-]/g, '') || '0');
                                  const allocatedAmount = Math.round((totalSip * item.allocationPercent) / 100);
                                  return (
                                    <div key={idx} className="bg-black dark:bg-black rounded-lg p-3 border border-muted hover:border-orange-400 dark:hover:border-orange-600 transition-all hover:shadow-sm">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-base font-bold text-orange-600 dark:text-orange-400">{item.allocationPercent}%</span>
                                        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">₹{allocatedAmount.toLocaleString('en-IN')}</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground font-medium leading-tight">{item.category}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            <AnimatedButton 
                              onClick={() => setSelectedPlan('high')} 
                              className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white shadow-md text-sm font-semibold flex items-center justify-center rounded-lg mt-4"
                            >
                              {selectedPlan === 'high' ? (
                                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>Selected</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                                  <Zap className="h-4 w-4" />
                                  <span>Select Growth Plan</span>
                                </span>
                              )}
                            </AnimatedButton>
                          </CardContent>
                        </Card>
                      </div>

                      {selectedPlan && (
                        <div className="flex gap-4 max-w-3xl mx-auto">
                          <AnimatedButton 
                            onClick={() => handleSelectPlan(selectedPlan)}
                            className="flex-1 h-12 text-lg shadow-xl"
                          >
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Save Goal with Selected Plan
                          </AnimatedButton>
                          <AnimatedButton 
                            onClick={() => {
                              setAiAnalysisResult(null);
                              setSelectedPlan(null);
                              setShowAIAnalysis(false);
                            }}
                            variant="outline"
                            className="h-12 px-8"
                          >
                            Cancel
                          </AnimatedButton>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Goals;
