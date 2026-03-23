import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DebugRoute from "./components/DebugRoute";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import CreateProfile from "./pages/CreateProfile";
import CreatePin from "./pages/CreatePin";
import EnterPin from "./pages/EnterPin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Stocks from "./pages/Stocks";
import LiveMarketChart from "./pages/LiveMarketChart";
import PortfolioChartView from "./pages/PortfolioChartView";
import LoanAnalyzer from "./pages/LoanAnalyzer";
import Learn from "./pages/Learn";
import Goals from "./pages/Goals";
import AddBankAccount from "./pages/AddBankAccount";
import Transactions from "./pages/Transactions";
import FinanceChatbot from "./pages/FinanceChatbot";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";
import DashboardDebug from "./pages/DashboardDebug";
import BackgroundDemo from "./pages/BackgroundDemo";
import SaveButtonTest from "./pages/SaveButtonTest";
import ButtonAnimationTest from "./pages/ButtonAnimationTest";
import BentoGridDemo from "./pages/BentoGridDemo";
import AuthFlowDebugger from "./components/AuthFlowDebugger";
import FloatingChatButton from "./components/FloatingChatButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
          <TooltipProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          style={{ zIndex: 99999 }}
        />
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/dashboard-debug" element={<DashboardDebug />} />
          <Route path="/background-demo" element={<BackgroundDemo />} />
          <Route path="/save-button-test" element={<SaveButtonTest />} />
          <Route path="/button-animation-test" element={<ButtonAnimationTest />} />
          <Route path="/bento-grid-demo" element={<BentoGridDemo />} />
          
          {/* Authentication Flow Routes */}
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/create-pin" element={<CreatePin />} />
          <Route path="/enter-pin" element={<EnterPin />} />
          <Route path="/add-bank-account" element={<AddBankAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/stocks" element={
            <ProtectedRoute>
              <Stocks />
            </ProtectedRoute>
          } />
          <Route path="/stocks/live-market" element={
            <ProtectedRoute>
              <LiveMarketChart />
            </ProtectedRoute>
          } />
          <Route path="/stocks/portfolio" element={
            <ProtectedRoute>
              <PortfolioChartView />
            </ProtectedRoute>
          } />
          <Route path="/loan-analyzer" element={
            <ProtectedRoute>
              <LoanAnalyzer />
            </ProtectedRoute>
          } />
          <Route path="/learn" element={
            <ProtectedRoute>
              <Learn />
            </ProtectedRoute>
          } />
          <Route path="/goals" element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          } />
          
          {/* Legacy and other routes */}
          <Route path="/old" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <FloatingChatButton />
        <AuthFlowDebugger />
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;