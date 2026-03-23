import { BentoGrid } from "@/components/ui/bento-grid";
import {
  DollarSign,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Target,
  BarChart3,
  Wallet,
  ShieldCheck,
  Brain,
  Zap,
  Globe,
  Award,
} from "lucide-react";

/**
 * Bento Grid Demo - Showcase for Finatics.AI features
 * 
 * Demonstrates the Bento Grid component with financial app features
 */

const finaticsFeatures = [
  {
    title: "Smart Budget Tracking",
    meta: "Updated Daily",
    description:
      "AI-powered budget analysis with real-time spending insights and personalized recommendations",
    icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
    status: "Live",
    tags: ["Budget", "AI", "Analytics"],
    colSpan: 2,
    hasPersistentHover: true,
    cta: "View Dashboard →",
  },
  {
    title: "Investment Portfolio",
    meta: "₹2.4L managed",
    description: "Track stocks, mutual funds, and crypto with intelligent portfolio optimization",
    icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
    status: "Active",
    tags: ["Stocks", "Portfolio"],
    cta: "Manage →",
  },
  {
    title: "Savings Goals",
    meta: "3 active goals",
    description: "Set and achieve financial goals with AI-powered savings strategies",
    icon: <Target className="w-5 h-5 text-orange-500" />,
    status: "Tracking",
    tags: ["Goals", "Planning"],
    colSpan: 2,
  },
  {
    title: "Expense Analytics",
    meta: "Last 30 days",
    description: "Detailed expense breakdown with category-wise insights and trends",
    icon: <BarChart3 className="w-5 h-5 text-orange-500" />,
    tags: ["Analytics", "Reports"],
    cta: "View Reports →",
  },
  {
    title: "Bank Accounts",
    meta: "4 connected",
    description: "Securely connect and manage multiple bank accounts in one place",
    icon: <CreditCard className="w-5 h-5 text-indigo-500" />,
    status: "Synced",
    tags: ["Banking", "Sync"],
  },
  {
    title: "Loan Analyzer",
    meta: "New",
    description: "Calculate EMIs, compare loan options, and get the best rates",
    icon: <Wallet className="w-5 h-5 text-rose-500" />,
    status: "Beta",
    tags: ["Loans", "Calculator"],
    colSpan: 2,
    cta: "Calculate →",
  },
  {
    title: "Financial Security",
    meta: "256-bit encryption",
    description: "Bank-level security with end-to-end encryption for all transactions",
    icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
    tags: ["Security", "Privacy"],
  },
  {
    title: "AI Assistant",
    meta: "24/7 available",
    description: "Get personalized financial advice and insights from our AI chatbot",
    icon: <Brain className="w-5 h-5 text-cyan-500" />,
    status: "Online",
    tags: ["AI", "Support"],
    colSpan: 2,
    hasPersistentHover: true,
    cta: "Chat Now →",
  },
  {
    title: "Quick Actions",
    meta: "Instant access",
    description: "Fast shortcuts for common tasks and transactions",
    icon: <Zap className="w-5 h-5 text-yellow-500" />,
    tags: ["Productivity"],
  },
];

const BentoGridDemo = () => {
  return (
    <div className="min-h-screen bg-transparent relative">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Finatics.AI Features
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our comprehensive suite of AI-powered financial tools designed to help you manage, grow, and secure your wealth.
          </p>
        </div>

        {/* Bento Grid */}
        <BentoGrid items={finaticsFeatures} />

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
          <div className="p-6 rounded-xl bg-card/70 backdrop-blur-lg border border-white/20 dark:border-white/10 text-center hover:shadow-lg transition-all duration-300">
            <div className="text-3xl font-bold text-primary mb-2">10K+</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="p-6 rounded-xl bg-card/70 backdrop-blur-lg border border-white/20 dark:border-white/10 text-center hover:shadow-lg transition-all duration-300">
            <div className="text-3xl font-bold text-success mb-2">₹500Cr+</div>
            <div className="text-sm text-muted-foreground">Assets Managed</div>
          </div>
          <div className="p-6 rounded-xl bg-card/70 backdrop-blur-lg border border-white/20 dark:border-white/10 text-center hover:shadow-lg transition-all duration-300">
            <div className="text-3xl font-bold text-warning mb-2">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
          <div className="p-6 rounded-xl bg-card/70 backdrop-blur-lg border border-white/20 dark:border-white/10 text-center hover:shadow-lg transition-all duration-300">
            <div className="text-3xl font-bold text-orange-500 mb-2">4.9★</div>
            <div className="text-sm text-muted-foreground">User Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoGridDemo;
