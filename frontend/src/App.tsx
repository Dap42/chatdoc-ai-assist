import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useTheme } from "./contexts/ThemeContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import DoctorSignup from "./pages/DoctorSignup";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorProfile from "./pages/DoctorProfile";
import ChatInterface from "./pages/ChatInterface";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSignup from "./pages/AdminSignup"; // Import AdminSignup
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { theme } = useTheme();
  return (
    <div className={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/doctor-signup" element={<DoctorSignup />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin-signup" element={<AdminSignup />} />{" "}
                {/* Add AdminSignup route */}
                {/* Protected Doctor Routes */}
                <Route
                  path="/doctor-dashboard"
                  element={
                    <ProtectedRoute userType="doctor">
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor-profile"
                  element={
                    <ProtectedRoute userType="doctor">
                      <DoctorProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat/:chatId?"
                  element={
                    <ProtectedRoute userType="doctor">
                      <ChatInterface />
                    </ProtectedRoute>
                  }
                />
                {/* Protected Admin Routes */}
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute userType="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
};

export default App;
