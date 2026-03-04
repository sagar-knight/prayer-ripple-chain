import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Navigation from "./components/Navigation";
import BottomNav from "./components/BottomNav";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<HomeRouter />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/submit-prayer" element={<SubmitPrayer />} />
            <Route path="/pray" element={<PrayForOthers />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/churches" element={<Churches />} />
            <Route path="/churches/register" element={<RegisterChurch />} />
            <Route path="/churches/:churchId" element={<ChurchDetail />} />
            <Route path="/churches/:churchId/wall" element={<ChurchPrayerWall />} />
            <Route path="/churches/:churchId/submit" element={<ChurchSubmitPrayer />} />
            <Route path="/churches/:churchId/admin" element={<ChurchAdmin />} />
            <Route path="/churches/:churchId/prayers" element={<ChurchPrayerWall />} />
            <Route path="/ripple" element={<RippleImpact />} />
            <Route path="/calendar" element={<PrayerCalendar />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/support" element={<SupportMission />} />
            <Route path="/store" element={<Store />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/organizations/create" element={<CreateOrganization />} />
            <Route path="/organizations/:orgId" element={<OrganizationDetail />} />
            <Route path="/scripture" element={<Scripture />} />
            <Route path="/commitments" element={<MyCommitments />} />
            <Route path="/family" element={<Organizations />} />
            <Route path="/prayer-reminders" element={<MyPrayerReminders />} />
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
