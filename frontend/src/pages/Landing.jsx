import { AnimatedButton } from "@/components/ui/animated-button";
import { Button } from "@/components/ui/button";
import { BentoGrid } from "@/components/ui/bento-grid";
import { Footer } from "@/components/ui/footer-section";
import { Spotlight } from "@/components/ui/spotlight";
import { SplineScene } from "@/components/ui/spline-scene";
import Navbar from "@/components/layout/Navbar";
import { 
  TrendingUp, 
  Shield, 
  Brain, 
  PieChart, 
  Target, 
  BarChart3,
  ArrowRight,
  LogIn,
  UserPlus
} from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const features = [
    {
      icon: <Brain className="w-4 h-4 text-white" />,
      title: "AI-Powered Insights",
      description: "Get personalized financial advice and smart recommendations powered by advanced AI",
      status: "Active",
      tags: ["AI", "Insights"]
    },
    {
      icon: <PieChart className="w-4 h-4 text-white" />,
      title: "Expense Tracking",
      description: "Track and categorize your expenses with intelligent categorization and budgeting tools",
      status: "Active",
      tags: ["Tracking", "Budgeting"]
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-white" />,
      title: "Investment Management",
      description: "Monitor your stocks, mutual funds, and portfolio performance with real-time data",
      status: "Live",
      tags: ["Stocks", "Portfolio"]
    },
    {
      icon: <Target className="w-4 h-4 text-white" />,
      title: "Financial Goals",
      description: "Set and achieve your financial goals with AI-driven planning and progress tracking",
      status: "Active",
      tags: ["Goals", "Planning"]
    },
    {
      icon: <Shield className="w-4 h-4 text-white" />,
      title: "Secure & Private",
      description: "Bank-level security ensures your financial data is always protected and private",
      status: "Secure",
      tags: ["Security", "Privacy"]
    },
    {
      icon: <BarChart3 className="w-4 h-4 text-white" />,
      title: "Smart Analytics",
      description: "Comprehensive reports and analytics to understand your financial patterns",
      status: "Active",
      tags: ["Analytics", "Reports"]
    }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Spline 3D Background */}
      <div className="fixed inset-0 z-0">
        <SplineScene 
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full opacity-50"
        />
      </div>

      {/* Interactive Spotlight Effect */}
      <div className="fixed inset-0 z-[1]">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          size={400}
        />
      </div>

      {/* Logo - Top Left */}
      <div className="fixed top-6 left-6 z-[9999]">
        <div className="flex items-center gap-3 px-5 py-2.5 bg-card/50 hover:bg-card border border-border rounded-full transition-all duration-200 backdrop-blur-lg">
          <img src="/logo.png" alt="Finatics.AI Logo" className="w-12 h-12 object-contain" />
          <span className="text-lg font-bold text-foreground">Finatics.AI</span>
        </div>
      </div>

      {/* Auth Buttons - Top Right */}
      <div className="fixed top-6 right-6 flex items-center gap-3 z-[9999]">
        <Link to="/login">
          <button className="flex items-center gap-2 px-4 py-2 border border-border/50 rounded-full text-foreground hover:bg-muted transition-all duration-200 backdrop-blur-lg">
            <LogIn size={18} />
            <span className="hidden sm:inline text-sm font-semibold">Login</span>
          </button>
        </Link>
        <Link to="/login?mode=signup">
          <button className="flex items-center gap-2 px-4 py-2 bg-foreground rounded-full text-background hover:bg-foreground/90 transition-all duration-200">
            <UserPlus size={18} />
            <span className="hidden sm:inline text-sm font-semibold">Sign Up</span>
          </button>
        </Link>
      </div>

      {/* Hero Section - Centered */}
      <section className="relative min-h-screen flex items-center justify-center z-10 pointer-events-none">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pointer-events-auto">
          <div className="relative z-10">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                AI Powered{" "}
              </span>
              <span className="bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Personal Finance Assistant
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-neutral-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              Take control of your finances with intelligent insights, automated tracking, 
              and personalized recommendations. Make smarter financial decisions with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/login">
                <Button
                  variant="solid"
                  size="lg"
                  className="text-lg px-10 py-6 h-auto shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-shadow font-semibold"
                >
                  <span className="flex items-center">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-zinc-950/50 relative z-10 pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                Powerful Features for Complete
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent animate-gradient-text bg-[length:200%_auto]">
                Financial Control
              </span>
            </h2>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
              Everything you need to manage, track, and grow your wealth in one intelligent platform
            </p>
          </div>
          <BentoGrid 
            className="lg:grid-cols-3"
            items={features}
          />
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Landing;
