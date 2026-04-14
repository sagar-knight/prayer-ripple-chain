import { useState, useMemo } from "react";
import { Search, Filter, CheckCircle2, XCircle, AlertTriangle, Clock, Minus, FlaskConical, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TestStatus = "passed" | "failed" | "blocked" | "not_run";
type Priority = "critical" | "high" | "medium" | "low";

interface TestCase {
  id: string;
  module: string;
  feature: string;
  title: string;
  description: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  priority: Priority;
  severity: Priority;
  roleTested: string;
  status: TestStatus;
  notes?: string;
}

const STATUS_ICON: Record<TestStatus, typeof CheckCircle2> = {
  passed: CheckCircle2,
  failed: XCircle,
  blocked: AlertTriangle,
  not_run: Minus,
};

const STATUS_COLOR: Record<TestStatus, string> = {
  passed: "text-green-600",
  failed: "text-red-600",
  blocked: "text-yellow-600",
  not_run: "text-muted-foreground",
};

const STATUS_BADGE: Record<TestStatus, string> = {
  passed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  blocked: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  not_run: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const PRIORITY_COLOR: Record<Priority, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

// Comprehensive test cases seeded for all modules
const TEST_CASES: TestCase[] = [
  // AUTH
  { id: "AUTH-001", module: "Authentication", feature: "Signup", title: "User can sign up with valid email and password", description: "Verify new user registration works end-to-end", preconditions: "User is not logged in", steps: ["Navigate to /signup", "Enter valid email, password, display name", "Click Sign Up", "Check for verification email"], expectedResult: "Account created, verification email sent, profile auto-created", priority: "critical", severity: "critical", roleTested: "guest", status: "not_run" },
  { id: "AUTH-002", module: "Authentication", feature: "Signup", title: "Signup blocked with weak password", description: "Verify password strength validation prevents weak passwords", preconditions: "User is on signup page", steps: ["Enter email", "Enter weak password (e.g. '123')", "Observe password strength meter", "Try to submit"], expectedResult: "Password strength meter shows weak, form prevents submission", priority: "high", severity: "high", roleTested: "guest", status: "not_run" },
  { id: "AUTH-003", module: "Authentication", feature: "Login", title: "User can login with valid credentials", description: "Verify login with correct email/password", preconditions: "User has verified account", steps: ["Navigate to /login", "Enter valid email and password", "Click Login"], expectedResult: "User logged in, redirected to home/dashboard", priority: "critical", severity: "critical", roleTested: "guest", status: "not_run" },
  { id: "AUTH-004", module: "Authentication", feature: "Login", title: "Login fails with invalid credentials", description: "Verify error handling for wrong password", preconditions: "User has account", steps: ["Navigate to /login", "Enter valid email but wrong password", "Click Login"], expectedResult: "Error toast shown, user remains on login page", priority: "high", severity: "high", roleTested: "guest", status: "not_run" },
  { id: "AUTH-005", module: "Authentication", feature: "OAuth", title: "User can sign in with Google", description: "Verify Google OAuth flow works", preconditions: "Google OAuth configured", steps: ["Navigate to /login", "Click 'Sign in with Google'", "Complete Google authentication"], expectedResult: "User logged in, profile created if new, redirected to app", priority: "high", severity: "high", roleTested: "guest", status: "not_run" },
  { id: "AUTH-006", module: "Authentication", feature: "Password Reset", title: "User can reset forgotten password", description: "Verify forgot password → reset flow", preconditions: "User has account", steps: ["Navigate to /forgot-password", "Enter email", "Click submit", "Open reset email", "Set new password on /reset-password"], expectedResult: "Password updated, user can login with new password", priority: "high", severity: "high", roleTested: "guest", status: "not_run" },
  { id: "AUTH-007", module: "Authentication", feature: "Access Control", title: "Unauthenticated user cannot access protected routes", description: "Verify protected route redirection", preconditions: "User is not logged in", steps: ["Navigate to /dashboard", "Observe redirect"], expectedResult: "User redirected to /login with returnTo parameter", priority: "critical", severity: "critical", roleTested: "guest", status: "not_run" },
  { id: "AUTH-008", module: "Authentication", feature: "Access Control", title: "Non-admin cannot access /admin", description: "Verify admin route protection", preconditions: "User logged in without admin role", steps: ["Navigate to /admin"], expectedResult: "User redirected to /", priority: "critical", severity: "critical", roleTested: "user", status: "not_run" },

  // PRAY
  { id: "PRAY-001", module: "PRAY", feature: "Prayer Feed", title: "Prayer feed loads with open prayers", description: "Verify unified prayer feed displays correctly", preconditions: "Open prayer requests exist in database", steps: ["Navigate to /pray", "Wait for feed to load"], expectedResult: "Prayer cards displayed with title, description, category, country", priority: "critical", severity: "critical", roleTested: "user", status: "not_run" },
  { id: "PRAY-002", module: "PRAY", feature: "Prayer Action", title: "User can pray for a request", description: "Verify prayer action records correctly", preconditions: "User is logged in, prayers available", steps: ["Navigate to /pray", "Click 'Pray' on a card", "Complete prayer session"], expectedResult: "Prayer count incremented, prayer_actions record created, coverage updated", priority: "critical", severity: "critical", roleTested: "user", status: "not_run" },
  { id: "PRAY-003", module: "PRAY", feature: "Anonymous", title: "Anonymous prayers hide author identity", description: "Verify anonymous masking in public views", preconditions: "Anonymous prayer exists", steps: ["View prayer feed as different user", "Check for author information"], expectedResult: "No author name or ID visible for anonymous prayers", priority: "high", severity: "critical", roleTested: "user", status: "not_run" },
  { id: "PRAY-004", module: "PRAY", feature: "Test Filtering", title: "Test account prayers hidden from feed", description: "Verify test account content excluded", preconditions: "Test account has submitted prayers", steps: ["Login as regular user", "View /pray feed", "Verify test prayers not visible"], expectedResult: "No test account prayers appear in feed", priority: "high", severity: "high", roleTested: "user", status: "not_run" },
  { id: "PRAY-005", module: "PRAY", feature: "Empty State", title: "Empty state shown when no prayers available", description: "Verify empty feed behavior", preconditions: "No open prayers in database", steps: ["Navigate to /pray"], expectedResult: "Encouraging empty state message displayed", priority: "medium", severity: "low", roleTested: "user", status: "not_run" },
  { id: "PRAY-006", module: "PRAY", feature: "Pass Forward", title: "User can share a prayer via Pass It Forward", description: "Verify sharing dialog and invite creation", preconditions: "User has prayed for a request", steps: ["Complete prayer session", "Click 'Pass It Forward'", "Generate share link"], expectedResult: "Invite link created with unique code, QR available", priority: "medium", severity: "medium", roleTested: "user", status: "not_run" },

  // REQUEST
  { id: "REQ-001", module: "Request", feature: "Submission", title: "User can submit a valid prayer request", description: "Verify prayer request creation flow", preconditions: "User is logged in", steps: ["Navigate to /submit-prayer", "Enter title and description", "Select category", "Submit"], expectedResult: "Request saved, appears in feed (or queue if flagged)", priority: "critical", severity: "critical", roleTested: "user", status: "not_run" },
  { id: "REQ-002", module: "Request", feature: "Validation", title: "Submit blocked with missing required fields", description: "Verify form validation", preconditions: "User on submit page", steps: ["Leave title empty", "Try to submit"], expectedResult: "Validation error shown, submission blocked", priority: "high", severity: "high", roleTested: "user", status: "not_run" },
  { id: "REQ-003", module: "Request", feature: "Moderation", title: "Flagged content enters moderation queue", description: "Verify AI moderation integration", preconditions: "Moderate-content edge function active", steps: ["Submit prayer with potentially flagged content", "Check moderation queue"], expectedResult: "Content flagged, appears in admin moderation queue", priority: "high", severity: "high", roleTested: "user", status: "not_run" },
  { id: "REQ-004", module: "Request", feature: "Anonymous", title: "Anonymous submission hides author", description: "Verify anonymous toggle works", preconditions: "User logged in", steps: ["Toggle anonymous on", "Submit prayer", "View in feed as another user"], expectedResult: "Prayer visible but author identity masked", priority: "high", severity: "critical", roleTested: "user", status: "not_run" },

  // CHURCHES
  { id: "CHR-001", module: "Churches", feature: "Listing", title: "Church listing page loads", description: "Verify churches page displays active churches", preconditions: "Active churches exist", steps: ["Navigate to /churches"], expectedResult: "Church cards displayed with name, location, denomination", priority: "high", severity: "high", roleTested: "guest", status: "not_run" },
  { id: "CHR-002", module: "Churches", feature: "Registration", title: "User can register a new church", description: "Verify church registration flow", preconditions: "User is logged in", steps: ["Navigate to /churches/register", "Fill in church details", "Submit"], expectedResult: "Church created, user assigned as church admin", priority: "high", severity: "high", roleTested: "user", status: "not_run" },
  { id: "CHR-003", module: "Churches", feature: "Join", title: "User can join a church via invite link", description: "Verify /join/:slug flow", preconditions: "Church exists with valid slug", steps: ["Navigate to /join/:slug", "Confirm join"], expectedResult: "User added as member with 'member' role", priority: "high", severity: "high", roleTested: "user", status: "not_run" },
  { id: "CHR-004", module: "Churches", feature: "Security", title: "New members cannot self-escalate to admin role", description: "Verify RLS prevents role escalation", preconditions: "User joins church", steps: ["Join church", "Attempt to modify own role to 'admin' via API"], expectedResult: "RLS blocks the update, role remains 'member'", priority: "critical", severity: "critical", roleTested: "user", status: "not_run" },
  { id: "CHR-005", module: "Churches", feature: "Prayer Wall", title: "Church prayer wall shows approved requests only", description: "Verify prayer wall filtering", preconditions: "Church has pending and approved prayers", steps: ["Navigate to church prayer wall as member", "Check visible prayers"], expectedResult: "Only approved prayers visible (plus own pending ones)", priority: "high", severity: "high", roleTested: "user", status: "not_run" },

  // RIPPLE
  { id: "RIP-001", module: "Ripple", feature: "Dashboard", title: "Ripple dashboard loads with user stats", description: "Verify ripple impact page", preconditions: "User logged in with prayer activity", steps: ["Navigate to /ripple"], expectedResult: "Dashboard shows prayers offered, received, chains started", priority: "high", severity: "high", roleTested: "user", status: "not_run" },
  { id: "RIP-002", module: "Ripple", feature: "Chain", title: "Prayer chain visualization works", description: "Verify chain rendering", preconditions: "Prayer chains exist for user", steps: ["View ripple dashboard", "Open chain detail"], expectedResult: "Chain shows depth, participants, connections", priority: "medium", severity: "medium", roleTested: "user", status: "not_run" },
  { id: "RIP-003", module: "Ripple", feature: "Invite", title: "Invite link tracks clicks", description: "Verify invite tracking via RPC", preconditions: "Invite created", steps: ["Visit invite link", "Check click count in database"], expectedResult: "click_count incremented via increment_invite_click RPC", priority: "medium", severity: "medium", roleTested: "guest", status: "not_run" },

  // SUPPORT
  { id: "SUP-001", module: "Support", feature: "Page Load", title: "Support page loads correctly", description: "Verify support page renders", preconditions: "None", steps: ["Navigate to /support"], expectedResult: "Support page displays with donation options", priority: "high", severity: "high", roleTested: "guest", status: "not_run" },
  { id: "SUP-002", module: "Support", feature: "Checkout", title: "Stripe checkout redirects correctly", description: "Verify payment flow initialization", preconditions: "Stripe configured", steps: ["Select support amount", "Click donate/support", "Verify Stripe redirect"], expectedResult: "Stripe checkout session created, user redirected", priority: "high", severity: "high", roleTested: "user", status: "not_run" },

  // STORE
  { id: "STR-001", module: "Store", feature: "Listing", title: "Store page loads with products", description: "Verify product listing renders", preconditions: "Products available (Gelato or static)", steps: ["Navigate to /store"], expectedResult: "Product grid displayed with images, prices", priority: "high", severity: "high", roleTested: "guest", status: "not_run" },
  { id: "STR-002", module: "Store", feature: "Cart", title: "User can add items to cart", description: "Verify cart functionality", preconditions: "Products visible", steps: ["Click product", "Click 'Add to Cart'", "Open cart drawer"], expectedResult: "Item appears in cart with correct quantity and price", priority: "high", severity: "high", roleTested: "guest", status: "not_run" },
  { id: "STR-003", module: "Store", feature: "Cart", title: "Cart icon only shows on store routes", description: "Verify conditional cart display", preconditions: "Items in cart", steps: ["Navigate to /store → cart icon visible", "Navigate to / → cart icon hidden"], expectedResult: "Cart icon conditional on route", priority: "medium", severity: "low", roleTested: "guest", status: "not_run" },
  { id: "STR-004", module: "Store", feature: "Detail", title: "Product detail page shows correct info", description: "Verify product detail rendering", preconditions: "Valid product exists", steps: ["Navigate to /product/:handle"], expectedResult: "Product image, description, price, add-to-cart shown", priority: "high", severity: "high", roleTested: "guest", status: "not_run" },

  // CALENDAR
  { id: "CAL-001", module: "Calendar", feature: "Load", title: "Calendar page loads", description: "Verify calendar rendering", preconditions: "User logged in", steps: ["Navigate to /calendar"], expectedResult: "Calendar grid displayed", priority: "high", severity: "high", roleTested: "user", status: "not_run" },
  { id: "CAL-002", module: "Calendar", feature: "Reminders", title: "Prayer reminders display on calendar", description: "Verify reminder integration", preconditions: "User has active prayer reminders", steps: ["Navigate to /calendar", "Check dates with reminders"], expectedResult: "Reminder indicators shown on relevant dates", priority: "medium", severity: "medium", roleTested: "user", status: "not_run" },

  // FAMILY
  { id: "FAM-001", module: "Family", feature: "Create Group", title: "User can create a family group", description: "Verify group creation", preconditions: "User logged in", steps: ["Navigate to family section", "Create new group", "Set name"], expectedResult: "Group created, user is admin, invite code generated", priority: "high", severity: "high", roleTested: "user", status: "not_run" },
  { id: "FAM-002", module: "Family", feature: "Privacy", title: "Non-members cannot view family data", description: "Verify RLS isolation", preconditions: "Family group exists", steps: ["Login as non-member", "Attempt to query family_prayer_requests"], expectedResult: "No rows returned, data completely isolated", priority: "critical", severity: "critical", roleTested: "user", status: "not_run" },
  { id: "FAM-003", module: "Family", feature: "Scripture", title: "Members can share scriptures", description: "Verify family scripture sharing", preconditions: "User is family member", steps: ["Navigate to family detail", "Share a scripture"], expectedResult: "Scripture saved, visible to all family members", priority: "medium", severity: "medium", roleTested: "user", status: "not_run" },

  // SCRIPTURE
  { id: "SCR-001", module: "Scripture", feature: "Page Load", title: "Scripture page loads", description: "Verify scripture rendering", preconditions: "None", steps: ["Navigate to /scripture"], expectedResult: "Scripture content displayed", priority: "high", severity: "high", roleTested: "guest", status: "not_run" },
  { id: "SCR-002", module: "Scripture", feature: "AI Analysis", title: "AI Bible analysis returns result", description: "Verify edge function integration", preconditions: "LOVABLE_API_KEY configured", steps: ["Request AI analysis of a passage", "Wait for response"], expectedResult: "AI-generated analysis displayed", priority: "medium", severity: "medium", roleTested: "user", status: "not_run" },
  { id: "SCR-003", module: "Scripture", feature: "Daily Verse", title: "Daily verse card shows on home page", description: "Verify daily verse rotation", preconditions: "Verse data available", steps: ["Navigate to /", "Find daily verse card"], expectedResult: "Verse displayed with reference and text", priority: "low", severity: "low", roleTested: "guest", status: "not_run" },

  // PROFILE / SETTINGS
  { id: "PRO-001", module: "Profile", feature: "View", title: "Profile page loads with user data", description: "Verify profile rendering", preconditions: "User logged in", steps: ["Navigate to /profile"], expectedResult: "Display name, avatar, commitment level shown", priority: "high", severity: "high", roleTested: "user", status: "not_run" },
  { id: "PRO-002", module: "Profile", feature: "Update", title: "User can update display name", description: "Verify profile update", preconditions: "User logged in", steps: ["Navigate to /profile", "Change display name", "Save"], expectedResult: "Name updated in database and UI", priority: "high", severity: "high", roleTested: "user", status: "not_run" },
  { id: "SET-001", module: "Settings", feature: "Load", title: "Settings page loads", description: "Verify commitments page", preconditions: "User logged in", steps: ["Navigate to /commitments"], expectedResult: "Commitment level selector and settings displayed", priority: "high", severity: "high", roleTested: "user", status: "not_run" },

  // ADMIN
  { id: "ADM-001", module: "Admin", feature: "Access", title: "Admin dashboard accessible only to admins", description: "Verify admin route protection", preconditions: "User has admin role", steps: ["Navigate to /admin"], expectedResult: "Admin dashboard loads with sidebar navigation", priority: "critical", severity: "critical", roleTested: "admin", status: "not_run" },
  { id: "ADM-002", module: "Admin", feature: "Moderation", title: "Admin can approve flagged content", description: "Verify moderation approve flow", preconditions: "Flagged content in queue", steps: ["Navigate to Admin → Moderation", "Click approve on item", "Confirm"], expectedResult: "Content approved, removed from queue, audit log entry created", priority: "critical", severity: "critical", roleTested: "admin", status: "not_run" },
  { id: "ADM-003", module: "Admin", feature: "Users", title: "Admin can search and view users", description: "Verify user management", preconditions: "Users exist in system", steps: ["Navigate to Admin → Users", "Search for a user"], expectedResult: "User list filtered, user details visible", priority: "high", severity: "high", roleTested: "admin", status: "not_run" },
  { id: "ADM-004", module: "Admin", feature: "Test Accounts", title: "Admin can mark user as test account", description: "Verify test account toggle", preconditions: "Admin viewing user list", steps: ["Find user", "Click 'Mark Test'", "Set label"], expectedResult: "User marked as test, badge appears, content hidden from feeds", priority: "high", severity: "high", roleTested: "admin", status: "not_run" },
  { id: "ADM-005", module: "Admin", feature: "Audit", title: "Audit log records admin actions", description: "Verify audit trail", preconditions: "Admin has performed actions", steps: ["Navigate to Admin → Audit Log", "Search for recent action"], expectedResult: "Action logged with actor, target, timestamp, reason", priority: "high", severity: "high", roleTested: "admin", status: "not_run" },
  { id: "ADM-006", module: "Admin", feature: "Documentation", title: "Documentation tab visible and functional", description: "Verify documentation section", preconditions: "Admin logged in", steps: ["Navigate to Admin → Documentation", "Search modules", "Expand a section"], expectedResult: "Documentation loads, search works, content displays", priority: "medium", severity: "medium", roleTested: "admin", status: "not_run" },
  { id: "ADM-007", module: "Admin", feature: "Unit Testing", title: "Unit Testing tab visible and functional", description: "Verify testing section", preconditions: "Admin logged in", steps: ["Navigate to Admin → Unit Testing", "Filter by module", "View test case detail"], expectedResult: "Test dashboard loads, filters work, cases display", priority: "medium", severity: "medium", roleTested: "admin", status: "not_run" },

  // NAVIGATION
  { id: "NAV-001", module: "Navigation", feature: "Responsive", title: "Navigation adapts to mobile viewport", description: "Verify responsive nav behavior", preconditions: "None", steps: ["Resize to mobile width", "Check bottom nav appears", "Check top nav adjusts"], expectedResult: "Bottom nav visible, top nav condensed", priority: "medium", severity: "medium", roleTested: "guest", status: "not_run" },
  { id: "NAV-002", module: "Navigation", feature: "Profile Dropdown", title: "Profile dropdown shows correct items", description: "Verify dropdown menu contents", preconditions: "User logged in", steps: ["Click profile avatar", "Check menu items"], expectedResult: "Shows Profile, My Activity, Settings, Sign Out (+ Admin if admin)", priority: "high", severity: "high", roleTested: "user", status: "not_run" },

  // ERROR HANDLING
  { id: "ERR-001", module: "Error Handling", feature: "404", title: "Unknown routes show 404 page", description: "Verify catch-all route", preconditions: "None", steps: ["Navigate to /nonexistent-page"], expectedResult: "404 Not Found page displayed", priority: "medium", severity: "low", roleTested: "guest", status: "not_run" },
  { id: "ERR-002", module: "Error Handling", feature: "Validation", title: "Form validation shows inline errors", description: "Verify react-hook-form + zod validation", preconditions: "User on any form page", steps: ["Submit form with invalid data"], expectedResult: "Inline error messages appear below invalid fields", priority: "high", severity: "medium", roleTested: "user", status: "not_run" },
];

const MODULES = [...new Set(TEST_CASES.map(t => t.module))].sort();

const AdminUnitTesting = () => {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return TEST_CASES.filter(t => {
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
      const matchModule = moduleFilter === "all" || t.module === moduleFilter;
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
      return matchSearch && matchModule && matchStatus && matchPriority;
    });
  }, [search, moduleFilter, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    const total = TEST_CASES.length;
    const passed = TEST_CASES.filter(t => t.status === "passed").length;
    const failed = TEST_CASES.filter(t => t.status === "failed").length;
    const blocked = TEST_CASES.filter(t => t.status === "blocked").length;
    const notRun = TEST_CASES.filter(t => t.status === "not_run").length;
    return { total, passed, failed, blocked, notRun };
  }, []);

  const moduleCoverage = useMemo(() => {
    const modules: Record<string, { total: number; passed: number }> = {};
    TEST_CASES.forEach(t => {
      if (!modules[t.module]) modules[t.module] = { total: 0, passed: 0 };
      modules[t.module].total++;
      if (t.status === "passed") modules[t.module].passed++;
    });
    return modules;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FlaskConical className="w-6 h-6 text-primary" /> Unit Testing</h1>
        <p className="text-sm text-muted-foreground mt-1">QA test management — {stats.total} test cases across {MODULES.length} modules</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3"><div className="text-2xl font-bold">{stats.total}</div><div className="text-xs text-muted-foreground">Total Cases</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-green-600">{stats.passed}</div><div className="text-xs text-muted-foreground">Passed</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-red-600">{stats.failed}</div><div className="text-xs text-muted-foreground">Failed</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-yellow-600">{stats.blocked}</div><div className="text-xs text-muted-foreground">Blocked</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-muted-foreground">{stats.notRun}</div><div className="text-xs text-muted-foreground">Not Run</div></Card>
      </div>

      {/* Module coverage */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Module Coverage</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(moduleCoverage).map(([mod, data]) => {
            const pct = data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0;
            return (
              <div key={mod} className="flex items-center justify-between text-sm">
                <span className="truncate">{mod}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search test cases..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[150px]"><Filter className="w-4 h-4 mr-1" /><SelectValue placeholder="Module" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="not_run">Not Run</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Test cases table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[100px]">Module</TableHead>
              <TableHead className="w-[80px]">Priority</TableHead>
              <TableHead className="w-[80px]">Status</TableHead>
              <TableHead className="w-[80px]">Role</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(tc => {
              const StatusIcon = STATUS_ICON[tc.status];
              const isExpanded = expandedCase === tc.id;
              return (
                <>
                  <TableRow key={tc.id} className="cursor-pointer" onClick={() => setExpandedCase(isExpanded ? null : tc.id)}>
                    <TableCell className="font-mono text-xs">{tc.id}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{tc.title}</div>
                      <div className="text-xs text-muted-foreground">{tc.feature}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{tc.module}</Badge></TableCell>
                    <TableCell><Badge className={`${PRIORITY_COLOR[tc.priority]} text-[10px]`}>{tc.priority}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <StatusIcon className={`w-4 h-4 ${STATUS_COLOR[tc.status]}`} />
                        <span className="text-xs">{tc.status.replace("_", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{tc.roleTested}</Badge></TableCell>
                    <TableCell><ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} /></TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={`${tc.id}-detail`}>
                      <TableCell colSpan={7} className="bg-muted/30">
                        <div className="p-4 space-y-3">
                          <div>
                            <span className="text-xs font-semibold">Description:</span>
                            <p className="text-sm text-muted-foreground">{tc.description}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold">Preconditions:</span>
                            <p className="text-sm text-muted-foreground">{tc.preconditions}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold">Steps:</span>
                            <ol className="text-sm text-muted-foreground list-decimal list-inside">
                              {tc.steps.map((s, i) => <li key={i}>{s}</li>)}
                            </ol>
                          </div>
                          <div>
                            <span className="text-xs font-semibold">Expected Result:</span>
                            <p className="text-sm text-muted-foreground">{tc.expectedResult}</p>
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Severity: <Badge className={`${PRIORITY_COLOR[tc.severity]} text-[10px]`}>{tc.severity}</Badge></span>
                            {tc.notes && <span>Notes: {tc.notes}</span>}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FlaskConical className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No test cases match your filters.</p>
        </div>
      )}

      <div className="text-xs text-muted-foreground text-right">
        Showing {filtered.length} of {stats.total} test cases • Last updated: 2026-04-14
      </div>
    </div>
  );
};

export default AdminUnitTesting;
