import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import Navigation from "./components/Navigation";
import BottomNav from "./components/BottomNav";
import AppFooter from "./components/AppFooter";
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
import InviteLanding from "./pages/InviteLanding";
import ChurchJoin from "./pages/ChurchJoin";
import ModerationDashboard from "./pages/ModerationDashboard";
import ProductDetail from "./pages/ProductDetail";
import AuthCallback from "./pages/AuthCallback";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminModeration from "./pages/admin/AdminModeration";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminChurches from "./pages/admin/AdminChurches";
import AdminReports from "./pages/admin/AdminReports";
import AdminAutomation from "./pages/admin/AdminAutomation";
import AdminAuditLog from "./pages/admin/AdminAuditLog";
import AdminDocumentation from "./pages/admin/AdminDocumentation";
import AdminUnitTesting from "./pages/admin/AdminUnitTesting";
import { useCartSync } from "./hooks/useCartSync";
import { useAutoJoinChurch } from "./hooks/useAutoJoinChurch";

// Store pages
import StoreAbout from "./pages/store/StoreAbout";
import StoreTerms from "./pages/store/StoreTerms";
import StorePrivacy from "./pages/store/StorePrivacy";
import StoreRefundPolicy from "./pages/store/StoreRefundPolicy";
import StoreShipping from "./pages/store/StoreShipping";
import StoreReturns from "./pages/store/StoreReturns";
import StoreFAQ from "./pages/store/StoreFAQ";
import StoreContact from "./pages/store/StoreContact";
import StoreOrderTracking from "./pages/store/StoreOrderTracking";
import StoreOrders from "./pages/store/StoreOrders";

const queryClient = new QueryClient();

const AppContent = () => {
  useCartSync();
  useAutoJoinChurch();
  return null;
};

// Show store sub-nav only on store routes
const StoreSubNav = () => {
  const location = useLocation();
  const isStoreRoute = location.pathname === "/store" || location.pathname.startsWith("/store/") || location.pathname.startsWith("/product/");
  if (!isStoreRoute) return null;

  return (
    <div className="bg-muted border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9 text-xs">
        <nav className="flex items-center gap-4">
          <a href="/store" className="text-muted-foreground hover:text-foreground font-medium transition-colors">Shop All</a>
          <a href="/store?collection=new" className="text-muted-foreground hover:text-foreground font-medium transition-colors">New</a>
          <a href="/store?category=Apparel" className="text-muted-foreground hover:text-foreground font-medium transition-colors">Apparel</a>
        </nav>
        <span className="text-muted-foreground hidden sm:block">
          Every purchase supports the mission
        </span>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <StoreSubNav />
            <main className="flex-1">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomeRouter />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/about" element={<About />} />
                <Route path="/support" element={<SupportMission />} />

                {/* Store routes */}
                <Route path="/store" element={<Store />} />
                <Route path="/product/:handle" element={<ProductDetail />} />
                <Route path="/store/about" element={<StoreAbout />} />
                <Route path="/store/terms" element={<StoreTerms />} />
                <Route path="/store/privacy" element={<StorePrivacy />} />
                <Route path="/store/refund-policy" element={<StoreRefundPolicy />} />
                <Route path="/store/shipping" element={<StoreShipping />} />
                <Route path="/store/returns" element={<StoreReturns />} />
                <Route path="/store/faq" element={<StoreFAQ />} />
                <Route path="/store/contact" element={<StoreContact />} />
                <Route path="/store/order-tracking" element={<StoreOrderTracking />} />
                <Route path="/store/orders" element={<StoreOrders />} />

                <Route path="/churches" element={<Churches />} />

                {/* Public routes - accessible to all visitors */}
                <Route path="/scripture" element={<Scripture />} />
                <Route path="/submit-prayer" element={<SubmitPrayer />} />
                <Route path="/pray" element={<PrayForOthers />} />
                <Route path="/invite/:inviteCode" element={<InviteLanding />} />
                <Route path="/join/:slug" element={<ChurchJoin />} />
                <Route path="/churches/:churchId" element={<ChurchDetail />} />
                <Route path="/churches/:churchId/wall" element={<ChurchPrayerWall />} />
                <Route path="/churches/:churchId/submit" element={<ChurchSubmitPrayer />} />
                <Route path="/churches/:churchId/prayers" element={<ChurchPrayerWall />} />

                {/* Protected routes - require sign-in */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/churches/register" element={<ProtectedRoute><RegisterChurch /></ProtectedRoute>} />
                <Route path="/churches/:churchId/admin" element={<ProtectedRoute><ChurchAdmin /></ProtectedRoute>} />
                <Route path="/ripple" element={<ProtectedRoute><RippleImpact /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><PrayerCalendar /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/organizations" element={<ProtectedRoute><Organizations /></ProtectedRoute>} />
                <Route path="/organizations/create" element={<ProtectedRoute><CreateOrganization /></ProtectedRoute>} />
                <Route path="/organizations/:orgId" element={<ProtectedRoute><OrganizationDetail /></ProtectedRoute>} />
                <Route path="/commitments" element={<ProtectedRoute><MyCommitments /></ProtectedRoute>} />
                <Route path="/family" element={<ProtectedRoute><Organizations /></ProtectedRoute>} />
                <Route path="/prayer-reminders" element={<ProtectedRoute><MyPrayerReminders /></ProtectedRoute>} />
                <Route path="/moderation" element={<ProtectedRoute><ModerationDashboard /></ProtectedRoute>} />

                {/* Admin routes */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="moderation" element={<AdminModeration />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="churches" element={<AdminChurches />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="automation" element={<AdminAutomation />} />
                  <Route path="audit" element={<AdminAuditLog />} />
                  <Route path="docs" element={<AdminDocumentation />} />
                  <Route path="testing" element={<AdminUnitTesting />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <AppFooter />
          </div>
          <BottomNav />
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
