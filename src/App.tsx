import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import Navigation from "./components/Navigation";
import BottomNav from "./components/BottomNav";
import AppFooter from "./components/AppFooter";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeRouter from "./pages/HomeRouter";
const SubmitPrayer = lazy(() => import("./pages/SubmitPrayer"));
const PrayForOthers = lazy(() => import("./pages/PrayForOthers"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Churches = lazy(() => import("./pages/Churches"));
const ChurchDetail = lazy(() => import("./pages/ChurchDetail"));
const ChurchPrayerWall = lazy(() => import("./pages/ChurchPrayerWall"));
const ChurchSubmitPrayer = lazy(() => import("./pages/ChurchSubmitPrayer"));
const ChurchAdmin = lazy(() => import("./pages/ChurchAdmin"));
const RegisterChurch = lazy(() => import("./pages/RegisterChurch"));
const RippleImpact = lazy(() => import("./pages/RippleImpact"));
const About = lazy(() => import("./pages/About"));
const PrayerCalendar = lazy(() => import("./pages/PrayerCalendar"));
const Profile = lazy(() => import("./pages/Profile"));
const SupportMission = lazy(() => import("./pages/SupportMission"));
const Store = lazy(() => import("./pages/Store"));
const Organizations = lazy(() => import("./pages/Organizations"));
const CreateOrganization = lazy(() => import("./pages/CreateOrganization"));
const OrganizationDetail = lazy(() => import("./pages/OrganizationDetail"));
const Scripture = lazy(() => import("./pages/Scripture"));
const MyCommitments = lazy(() => import("./pages/MyCommitments"));
const MyPrayerReminders = lazy(() => import("./pages/MyPrayerReminders"));
const SettingsPage = lazy(() => import("./pages/Settings"));
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
const InviteLanding = lazy(() => import("./pages/InviteLanding"));
const SharedPrayer = lazy(() => import("./pages/SharedPrayer"));
const ChurchJoin = lazy(() => import("./pages/ChurchJoin"));
const ModerationDashboard = lazy(() => import("./pages/ModerationDashboard"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
import AuthCallback from "./pages/AuthCallback";
import AdminRoute from "./components/AdminRoute";
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminModeration = lazy(() => import("./pages/admin/AdminModeration"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminChurches = lazy(() => import("./pages/admin/AdminChurches"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminAutomation = lazy(() => import("./pages/admin/AdminAutomation"));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog"));
const AdminDocumentation = lazy(() => import("./pages/admin/AdminDocumentation"));
const AdminUnitTesting = lazy(() => import("./pages/admin/AdminUnitTesting"));
const AdminGlobalReach = lazy(() => import("./pages/admin/AdminGlobalReach"));
import { useCartSync } from "./hooks/useCartSync";
import { useAutoJoinChurch } from "./hooks/useAutoJoinChurch";

// Store pages (lazy)
const StoreAbout = lazy(() => import("./pages/store/StoreAbout"));
const StoreTerms = lazy(() => import("./pages/store/StoreTerms"));
const StorePrivacy = lazy(() => import("./pages/store/StorePrivacy"));
const StoreRefundPolicy = lazy(() => import("./pages/store/StoreRefundPolicy"));
const StoreShipping = lazy(() => import("./pages/store/StoreShipping"));
const StoreReturns = lazy(() => import("./pages/store/StoreReturns"));
const StoreFAQ = lazy(() => import("./pages/store/StoreFAQ"));
const StoreContact = lazy(() => import("./pages/store/StoreContact"));
const StoreOrderTracking = lazy(() => import("./pages/store/StoreOrderTracking"));
const StoreOrders = lazy(() => import("./pages/store/StoreOrders"));

// Legal / policy pages (lazy)
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/legal/TermsOfUse"));
const CommunityGuidelines = lazy(() => import("./pages/legal/CommunityGuidelines"));
const Disclaimer = lazy(() => import("./pages/legal/Disclaimer"));

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
          <a href="/store?category=Accessories" className="text-muted-foreground hover:text-foreground font-medium transition-colors">Accessories</a>
          <a href="/store?category=Wall%20Art" className="text-muted-foreground hover:text-foreground font-medium transition-colors">Wall Art</a>
          <a href="/store?category=Journals" className="text-muted-foreground hover:text-foreground font-medium transition-colors">Journals</a>
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
              <Suspense fallback={<div className="min-h-[40vh]" aria-hidden />}>
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

                {/* Legal & policy */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfUse />} />
                <Route path="/guidelines" element={<CommunityGuidelines />} />
                <Route path="/disclaimer" element={<Disclaimer />} />

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
                <Route path="/p/:slug" element={<SharedPrayer />} />
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
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/family" element={<ProtectedRoute><Organizations /></ProtectedRoute>} />
                <Route path="/prayer-reminders" element={<ProtectedRoute><MyPrayerReminders /></ProtectedRoute>} />
                <Route path="/moderation" element={<ProtectedRoute><ModerationDashboard /></ProtectedRoute>} />

                {/* Admin routes */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="moderation" element={<AdminModeration />} />
                  <Route path="global-reach" element={<AdminGlobalReach />} />
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
              </Suspense>
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
