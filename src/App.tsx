import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Navigation from "./components/Navigation";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeRouter from "./pages/HomeRouter";
import SubmitPrayer from "./pages/SubmitPrayer";
import PrayForOthers from "./pages/PrayForOthers";
import Dashboard from "./pages/Dashboard";
import Churches from "./pages/Churches";
import ChurchDetail from "./pages/ChurchDetail";
import ChurchPrayerWall from "./pages/ChurchPrayerWall";
import ChurchSubmitPrayer from "./pages/ChurchSubmitPrayer";
import ChurchAdmin from "./pages/ChurchAdmin";
import RegisterChurch from "./pages/RegisterChurch";
import RippleImpact from "./pages/RippleImpact";
import About from "./pages/About";
import PrayerCalendar from "./pages/PrayerCalendar";
import Profile from "./pages/Profile";
import SupportMission from "./pages/SupportMission";
import Store from "./pages/Store";
import Organizations from "./pages/Organizations";
import CreateOrganization from "./pages/CreateOrganization";
import OrganizationDetail from "./pages/OrganizationDetail";
import Scripture from "./pages/Scripture";
import MyCommitments from "./pages/MyCommitments";
import FamilyRequests from "./pages/FamilyRequests";
import MyPrayerReminders from "./pages/MyPrayerReminders";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import { useCartSync } from "./hooks/useCartSync";

const queryClient = new QueryClient();

const AppContent = () => {
  useCartSync();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
          <Navigation />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomeRouter />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/support" element={<SupportMission />} />
            <Route path="/store" element={<Store />} />
            <Route path="/product/:handle" element={<ProductDetail />} />
            <Route path="/churches" element={<Churches />} />

            {/* Protected routes */}
            <Route path="/submit-prayer" element={<ProtectedRoute><SubmitPrayer /></ProtectedRoute>} />
            <Route path="/pray" element={<ProtectedRoute><PrayForOthers /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/churches/register" element={<ProtectedRoute><RegisterChurch /></ProtectedRoute>} />
            <Route path="/churches/:churchId" element={<ProtectedRoute><ChurchDetail /></ProtectedRoute>} />
            <Route path="/churches/:churchId/wall" element={<ProtectedRoute><ChurchPrayerWall /></ProtectedRoute>} />
            <Route path="/churches/:churchId/submit" element={<ProtectedRoute><ChurchSubmitPrayer /></ProtectedRoute>} />
            <Route path="/churches/:churchId/admin" element={<ProtectedRoute><ChurchAdmin /></ProtectedRoute>} />
            <Route path="/churches/:churchId/prayers" element={<ProtectedRoute><ChurchPrayerWall /></ProtectedRoute>} />
            <Route path="/ripple" element={<ProtectedRoute><RippleImpact /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><PrayerCalendar /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/organizations" element={<ProtectedRoute><Organizations /></ProtectedRoute>} />
            <Route path="/organizations/create" element={<ProtectedRoute><CreateOrganization /></ProtectedRoute>} />
            <Route path="/organizations/:orgId" element={<ProtectedRoute><OrganizationDetail /></ProtectedRoute>} />
            <Route path="/scripture" element={<ProtectedRoute><Scripture /></ProtectedRoute>} />
            <Route path="/commitments" element={<ProtectedRoute><MyCommitments /></ProtectedRoute>} />
            <Route path="/family" element={<ProtectedRoute><Organizations /></ProtectedRoute>} />
            <Route path="/prayer-reminders" element={<ProtectedRoute><MyPrayerReminders /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
