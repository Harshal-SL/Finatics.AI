import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Particles } from "@/components/ui/particles";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  Search,
  Clock,
  Star,
  Users,
  Home,
  LineChart as LineChartIcon,
  Target,
  BookOpen,
  MessageSquare,
  Calculator,
  LogOut
} from "lucide-react";

const Learn = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const featuredVideos = [
    {
      id: 1,
      title: "How Does the Stock Market Work?",
      description: "Learn the fundamentals of stock market mechanics and trading",
      duration: "15:20",
      instructor: "Financial Educator",
      rating: 4.9,
      students: "2.3M",
      videoUrl: "https://youtu.be/A7fZp9dwELo?si=v-LPgQEMMxwOaGnX",
      thumbnail: "https://img.youtube.com/vi/A7fZp9dwELo/maxresdefault.jpg",
      category: "stocks",
      level: "Beginner"
    },
    {
      id: 2,
      title: "What is SIP?",
      description: "Systematic Investment Plans explained with real examples and calculations",
      duration: "18:30",
      instructor: "Investment Expert",
      rating: 4.8,
      students: "1.8M",
      videoUrl: "https://youtu.be/pHJpTZcmeFU?si=_res-FN6FRoFY5Ci",
      thumbnail: "https://img.youtube.com/vi/pHJpTZcmeFU/maxresdefault.jpg",
      category: "savings",
      level: "Intermediate"
    },
    {
      id: 3,
      title: "What is SWP?",
      description: "How to create regular income from your investments using Systematic Withdrawal Plans",
      duration: "16:40",
      instructor: "Financial Planner",
      rating: 4.6,
      students: "950K",
      videoUrl: "https://youtu.be/fEobhU3ECXw?si=DtZLUIEAO-BiZcSt",
      thumbnail: "https://img.youtube.com/vi/fEobhU3ECXw/maxresdefault.jpg",
      category: "savings",
      level: "Advanced"
    },
    {
      id: 4,
      title: "What is Compounding?",
      description: "Learn how compounding can turn small investments into massive wealth over time",
      duration: "12:45",
      instructor: "Wealth Coach",
      rating: 4.9,
      students: "3.1M",
      videoUrl: "https://youtu.be/2NIC9JhhdzU?si=4HC_22rn3Ihuu06c",
      thumbnail: "https://img.youtube.com/vi/2NIC9JhhdzU/maxresdefault.jpg",
      category: "basics",
      level: "Beginner"
    },
    {
      id: 5,
      title: "How to Trick Your Brain Into Saving Money Effortlessly",
      description: "Psychological tricks and strategies to make saving money automatic and painless",
      duration: "14:20",
      instructor: "Behavioral Finance Expert",
      rating: 4.7,
      students: "1.5M",
      videoUrl: "https://youtu.be/Qo9YlbaESas?si=379Mb16aGLK404Mi",
      thumbnail: "https://img.youtube.com/vi/Qo9YlbaESas/maxresdefault.jpg",
      category: "savings",
      level: "Beginner"
    },
    {
      id: 6,
      title: "What is Mutual Funds?",
      description: "Expert strategies for selecting high-performing mutual funds for your portfolio",
      duration: "25:15",
      instructor: "Fund Manager",
      rating: 4.8,
      students: "1.2M",
      videoUrl: "https://youtu.be/PbldLCsspgE?si=NQqcpWu36OuNLppw",
      thumbnail: "https://img.youtube.com/vi/PbldLCsspgE/maxresdefault.jpg",
      category: "mutual-funds",
      level: "Intermediate"
    },
    {
      id: 7,
      title: "What is Insurance?",
      description: "Term vs whole life insurance, health insurance, and comprehensive protection strategies",
      duration: "22:10",
      instructor: "Insurance Advisor",
      rating: 4.8,
      students: "1.1M",
      videoUrl: "https://youtu.be/3ctoSEQsY54?si=CV6QFDsa_Hc66KoB",
      thumbnail: "https://img.youtube.com/vi/3ctoSEQsY54/maxresdefault.jpg",
      category: "insurance",
      level: "Beginner"
    }
  ];

  const getLevelColor = (level) => {
    switch (level) {
      case "Beginner": return "bg-success/20 text-success border-success/30";
      case "Intermediate": return "bg-warning/20 text-warning border-warning/30";
      case "Advanced": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-muted/20 text-muted-foreground border-muted/30";
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32 relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Finance Teacher</h1>
            <p className="text-white">Master your finances with expert-led courses and tutorials</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses..." className="pl-9 w-64" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
            <div className="grid gap-6">
              {featuredVideos.map((video) => (
                <div
                  key={video.id}
                  className="group relative p-5 rounded-xl overflow-hidden transition-all duration-300 bg-card/70 backdrop-blur-lg border border-white/20 dark:border-white/10 hover:shadow-[0_8px_32px_rgba(31,38,135,0.15)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.37)] hover:-translate-y-1 hover:scale-[1.01] will-change-transform cursor-pointer"
                >
                  {/* Dot pattern overlay */}
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
                  </div>

                  <div className="relative flex flex-col md:flex-row z-10">
                    <div className="relative md:w-80 h-48 md:h-auto rounded-lg overflow-hidden">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <AnimatedButton size="sm" className="rounded-full bg-white/20 hover:bg-white/30 border-0">
                          <Play className="w-5 h-5 text-white" />
                        </AnimatedButton>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {video.duration}
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="outline" className={getLevelColor(video.level)}>
                          {video.level}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg text-foreground tracking-tight leading-tight">{video.title}</h3>
                          <span className="text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm bg-gradient-to-r from-primary/10 to-success/10 text-foreground/80 transition-all duration-300 group-hover:from-primary/20 group-hover:to-success/20 group-hover:shadow-sm whitespace-nowrap ml-2">
                            {video.category}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{video.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{video.instructor}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-warning text-warning" />
                            <span>{video.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{video.students}</span>
                          </div>
                        </div>
                        <Button
                          variant="solid"
                          size="default"
                          className="font-semibold"
                          onClick={() => window.open(video.videoUrl, '_blank')}
                        >
                          Watch Now
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Gradient border effect */}
                  <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-success/5 dark:from-primary/10 dark:to-success/10 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                </div>
              ))}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Learn;
