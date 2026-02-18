import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import SubmitPrayer from "./pages/SubmitPrayer";
import PrayForOthers from "./pages/PrayForOthers";
import Dashboard from "./pages/Dashboard";
import Churches from "./pages/Churches";

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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit-prayer" element={<SubmitPrayer />} />
          <Route path="/pray" element={<PrayForOthers />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/churches" element={<Churches />} />
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
          <Route path="/family" element={<FamilyRequests />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
