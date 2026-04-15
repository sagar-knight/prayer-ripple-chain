import { useState, useMemo, useEffect } from "react";
import { Search, Filter, CheckCircle2, XCircle, AlertTriangle, Minus, FlaskConical, ChevronRight, Save, Plus, Edit, X, ArchiveRestore, Trash2, Link2, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import TestingImpactPanel from "@/components/admin/TestingImpactPanel";
import ChangeLog from "@/components/admin/ChangeLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TestStatus = "passed" | "failed" | "blocked" | "not_run";
type Priority = "critical" | "high" | "medium" | "low";

interface DbTestModule { id: string; module_key: string; module_name: string; }
interface DbTestCase {
  id: string; module_id: string; feature_name: string; title: string;
  description: string | null; preconditions: string | null; steps_json: any;
  test_data: string | null; expected_result: string | null; actual_result: string | null;
  priority: string | null; severity: string | null; role_tested: string | null;
  status: string | null; created_at: string; updated_at: string; archived: boolean;
}

const STATUS_ICON: Record<TestStatus, typeof CheckCircle2> = { passed: CheckCircle2, failed: XCircle, blocked: AlertTriangle, not_run: Minus };
const STATUS_COLOR: Record<TestStatus, string> = { passed: "text-green-600", failed: "text-red-600", blocked: "text-yellow-600", not_run: "text-muted-foreground" };
const STATUS_BADGE: Record<TestStatus, string> = { passed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", blocked: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", not_run: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
const PRIORITY_COLOR: Record<string, string> = { critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };

const SEED_MODULES = [
  { module_key: "auth", module_name: "Authentication" },
  { module_key: "pray", module_name: "PRAY" },
  { module_key: "request", module_name: "Request" },
  { module_key: "churches", module_name: "Churches" },
  { module_key: "ripple", module_name: "Ripple" },
  { module_key: "support", module_name: "Support" },
  { module_key: "store", module_name: "Store" },
  { module_key: "calendar", module_name: "Calendar" },
  { module_key: "family", module_name: "Family" },
  { module_key: "scripture", module_name: "Scripture" },
  { module_key: "profile", module_name: "Profile" },
  { module_key: "settings", module_name: "Settings" },
  { module_key: "admin", module_name: "Admin" },
  { module_key: "navigation", module_name: "Navigation" },
  { module_key: "error_handling", module_name: "Error Handling" },
];

const SEED_CASES: { module_key: string; feature_name: string; title: string; description: string; preconditions: string; steps: string[]; expected_result: string; priority: string; severity: string; role_tested: string }[] = [
  { module_key: "auth", feature_name: "Signup", title: "User can sign up with valid email and password", description: "Verify new user registration works end-to-end", preconditions: "User is not logged in", steps: ["Navigate to /signup","Enter valid email, password, display name","Click Sign Up","Check for verification email"], expected_result: "Account created, verification email sent", priority: "critical", severity: "critical", role_tested: "guest" },
  { module_key: "auth", feature_name: "Signup", title: "Signup blocked with weak password", description: "Verify password strength validation", preconditions: "On signup page", steps: ["Enter email","Enter weak password","Observe strength meter","Try to submit"], expected_result: "Strength meter shows weak, form prevents submission", priority: "high", severity: "high", role_tested: "guest" },
  { module_key: "auth", feature_name: "Login", title: "User can login with valid credentials", description: "Verify login with correct email/password", preconditions: "User has verified account", steps: ["Navigate to /login","Enter valid credentials","Click Login"], expected_result: "User logged in, redirected to dashboard", priority: "critical", severity: "critical", role_tested: "guest" },
  { module_key: "auth", feature_name: "Login", title: "Login fails with invalid credentials", description: "Verify error handling for wrong password", preconditions: "User has account", steps: ["Enter valid email but wrong password","Click Login"], expected_result: "Error toast shown", priority: "high", severity: "high", role_tested: "guest" },
  { module_key: "auth", feature_name: "OAuth", title: "User can sign in with Google", description: "Verify Google OAuth flow", preconditions: "Google OAuth configured", steps: ["Click Sign in with Google","Complete auth"], expected_result: "User logged in", priority: "high", severity: "high", role_tested: "guest" },
  { module_key: "auth", feature_name: "Access Control", title: "Unauthenticated user cannot access protected routes", description: "Verify protected route redirect", preconditions: "Not logged in", steps: ["Navigate to /dashboard"], expected_result: "Redirected to /login", priority: "critical", severity: "critical", role_tested: "guest" },
  { module_key: "auth", feature_name: "Access Control", title: "Non-admin cannot access /admin", description: "Verify admin route protection", preconditions: "Logged in without admin role", steps: ["Navigate to /admin"], expected_result: "Redirected to /", priority: "critical", severity: "critical", role_tested: "user" },
  { module_key: "pray", feature_name: "Prayer Feed", title: "Prayer feed loads with open prayers", description: "Verify unified prayer feed displays", preconditions: "Open prayers exist", steps: ["Navigate to /pray","Wait for load"], expected_result: "Prayer cards displayed", priority: "critical", severity: "critical", role_tested: "user" },
  { module_key: "pray", feature_name: "Prayer Action", title: "User can pray for a request", description: "Verify prayer action records correctly", preconditions: "User logged in", steps: ["Navigate to /pray","Click Pray","Complete session"], expected_result: "Count incremented, action recorded", priority: "critical", severity: "critical", role_tested: "user" },
  { module_key: "pray", feature_name: "Anonymous", title: "Anonymous prayers hide author identity", description: "Verify anonymous masking", preconditions: "Anonymous prayer exists", steps: ["View feed as different user","Check for author info"], expected_result: "No author visible", priority: "high", severity: "critical", role_tested: "user" },
  { module_key: "request", feature_name: "Submission", title: "User can submit a valid prayer request", description: "Verify prayer request creation", preconditions: "User logged in", steps: ["Navigate to /submit-prayer","Fill form","Submit"], expected_result: "Request saved, appears in feed or queue", priority: "critical", severity: "critical", role_tested: "user" },
  { module_key: "request", feature_name: "Validation", title: "Submit blocked with missing required fields", description: "Verify form validation", preconditions: "On submit page", steps: ["Leave title empty","Try submit"], expected_result: "Validation error shown", priority: "high", severity: "high", role_tested: "user" },
  { module_key: "churches", feature_name: "Listing", title: "Church listing page loads", description: "Verify churches page displays", preconditions: "Active churches exist", steps: ["Navigate to /churches"], expected_result: "Church cards displayed", priority: "high", severity: "high", role_tested: "guest" },
  { module_key: "churches", feature_name: "Security", title: "New members cannot self-escalate to admin", description: "Verify RLS prevents role escalation", preconditions: "User joins church", steps: ["Join church","Attempt to modify own role via API"], expected_result: "RLS blocks, role remains member", priority: "critical", severity: "critical", role_tested: "user" },
  { module_key: "ripple", feature_name: "Dashboard", title: "Ripple dashboard loads with user stats", description: "Verify ripple impact page", preconditions: "User has prayer activity", steps: ["Navigate to /ripple"], expected_result: "Stats displayed", priority: "high", severity: "high", role_tested: "user" },
  { module_key: "support", feature_name: "Page Load", title: "Support page loads correctly", description: "Verify support page renders", preconditions: "None", steps: ["Navigate to /support"], expected_result: "Support page displays", priority: "high", severity: "high", role_tested: "guest" },
  { module_key: "store", feature_name: "Listing", title: "Store page loads with products", description: "Verify product listing", preconditions: "Products available", steps: ["Navigate to /store"], expected_result: "Product grid displayed", priority: "high", severity: "high", role_tested: "guest" },
  { module_key: "store", feature_name: "Cart", title: "User can add items to cart", description: "Verify cart functionality", preconditions: "Products visible", steps: ["Click product","Add to Cart","Open cart"], expected_result: "Item in cart", priority: "high", severity: "high", role_tested: "guest" },
  { module_key: "calendar", feature_name: "Load", title: "Calendar page loads", description: "Verify calendar rendering", preconditions: "User logged in", steps: ["Navigate to /calendar"], expected_result: "Calendar grid displayed", priority: "high", severity: "high", role_tested: "user" },
  { module_key: "family", feature_name: "Create Group", title: "User can create a family group", description: "Verify group creation", preconditions: "User logged in", steps: ["Navigate to family section","Create group"], expected_result: "Group created, invite code generated", priority: "high", severity: "high", role_tested: "user" },
  { module_key: "family", feature_name: "Privacy", title: "Non-members cannot view family data", description: "Verify RLS isolation", preconditions: "Family group exists", steps: ["Login as non-member","Query family data"], expected_result: "No rows returned", priority: "critical", severity: "critical", role_tested: "user" },
  { module_key: "scripture", feature_name: "Page Load", title: "Scripture page loads", description: "Verify scripture rendering", preconditions: "None", steps: ["Navigate to /scripture"], expected_result: "Scripture content displayed", priority: "high", severity: "high", role_tested: "guest" },
  { module_key: "profile", feature_name: "View", title: "Profile page loads with user data", description: "Verify profile rendering", preconditions: "User logged in", steps: ["Navigate to /profile"], expected_result: "Display name, avatar shown", priority: "high", severity: "high", role_tested: "user" },
  { module_key: "admin", feature_name: "Access", title: "Admin dashboard accessible only to admins", description: "Verify admin route protection", preconditions: "User has admin role", steps: ["Navigate to /admin"], expected_result: "Admin dashboard loads", priority: "critical", severity: "critical", role_tested: "admin" },
  { module_key: "admin", feature_name: "Moderation", title: "Admin can approve flagged content", description: "Verify moderation flow", preconditions: "Flagged content exists", steps: ["Navigate to Moderation","Approve item"], expected_result: "Content approved, audit logged", priority: "critical", severity: "critical", role_tested: "admin" },
  { module_key: "navigation", feature_name: "Responsive", title: "Navigation adapts to mobile viewport", description: "Verify responsive nav", preconditions: "None", steps: ["Resize to mobile","Check bottom nav"], expected_result: "Bottom nav visible", priority: "medium", severity: "medium", role_tested: "guest" },
  { module_key: "error_handling", feature_name: "404", title: "Unknown routes show 404 page", description: "Verify catch-all route", preconditions: "None", steps: ["Navigate to /nonexistent"], expected_result: "404 page displayed", priority: "medium", severity: "low", role_tested: "guest" },
];

const AdminUnitTesting = () => {
  const [testModules, setTestModules] = useState<DbTestModule[]>([]);
  const [testCases, setTestCases] = useState<DbTestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [editingCase, setEditingCase] = useState<DbTestCase | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [addDialog, setAddDialog] = useState(false);
  const [newCase, setNewCase] = useState({ module_id: "", feature_name: "", title: "", description: "", preconditions: "", steps: "", expected_result: "", priority: "medium", severity: "medium", role_tested: "user" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const { data: mods } = await supabase.from("test_modules").select("*").order("module_name");

    if (!mods || mods.length === 0) {
      // Seed modules
      const { data: seededMods, error: modErr } = await supabase.from("test_modules").insert(SEED_MODULES).select();
      if (modErr || !seededMods) { toast.error("Failed to seed test modules"); setLoading(false); return; }
      setTestModules(seededMods);

      // Seed cases
      const modMap: Record<string, string> = {};
      seededMods.forEach(m => { modMap[m.module_key] = m.id; });
      const caseInserts = SEED_CASES.map(c => ({
        module_id: modMap[c.module_key],
        feature_name: c.feature_name,
        title: c.title,
        description: c.description,
        preconditions: c.preconditions,
        steps_json: c.steps,
        expected_result: c.expected_result,
        priority: c.priority,
        severity: c.severity,
        role_tested: c.role_tested,
        status: "not_run",
      })).filter(c => c.module_id);
      const { data: seededCases } = await supabase.from("test_cases").insert(caseInserts).select();
      setTestCases(seededCases || []);
    } else {
      setTestModules(mods);
      const { data: cases } = await supabase.from("test_cases").select("*").order("created_at");
      setTestCases((cases || []).map(c => ({ ...c, archived: (c as any).archived ?? false })));
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const moduleNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    testModules.forEach(tm => { m[tm.id] = tm.module_name; });
    return m;
  }, [testModules]);

  const MODULES = useMemo(() => testModules.map(m => m.module_name).sort(), [testModules]);

  const filtered = useMemo(() => {
    return testCases.filter(t => {
      if (!showArchived && t.archived) return false;
      if (showArchived && !t.archived) return false;
      const modName = moduleNameMap[t.module_id] || "";
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.description || "").toLowerCase().includes(search.toLowerCase());
      const matchModule = moduleFilter === "all" || modName === moduleFilter;
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
      return matchSearch && matchModule && matchStatus && matchPriority;
    });
  }, [search, moduleFilter, statusFilter, priorityFilter, testCases, moduleNameMap, showArchived]);

  const activeCases = useMemo(() => testCases.filter(t => !t.archived), [testCases]);
  const archivedCount = useMemo(() => testCases.filter(t => t.archived).length, [testCases]);

  const stats = useMemo(() => {
    const total = activeCases.length;
    return {
      total,
      passed: activeCases.filter(t => t.status === "passed").length,
      failed: activeCases.filter(t => t.status === "failed").length,
      blocked: activeCases.filter(t => t.status === "blocked").length,
      notRun: activeCases.filter(t => t.status === "not_run").length,
    };
  }, [activeCases]);

  const moduleCoverage = useMemo(() => {
    const mc: Record<string, { total: number; passed: number }> = {};
    activeCases.forEach(t => {
      const name = moduleNameMap[t.module_id] || "Unknown";
      if (!mc[name]) mc[name] = { total: 0, passed: 0 };
      mc[name].total++;
      if (t.status === "passed") mc[name].passed++;
    });
    return mc;
  }, [activeCases, moduleNameMap]);

  const handleStatusChange = async (caseId: string, newStatus: string) => {
    const { error } = await supabase.from("test_cases").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", caseId);
    if (error) { toast.error("Failed to update status"); return; }
    setTestCases(prev => prev.map(t => t.id === caseId ? { ...t, status: newStatus } : t));
    toast.success(`Status → ${newStatus.replace("_", " ")}`);
  };

  const handleSaveCase = async () => {
    if (!editingCase) return;
    const { error } = await supabase.from("test_cases").update({
      feature_name: editForm.feature_name,
      title: editForm.title,
      description: editForm.description,
      preconditions: editForm.preconditions,
      steps_json: editForm.steps.split("\n").filter(Boolean),
      expected_result: editForm.expected_result,
      actual_result: editForm.actual_result,
      priority: editForm.priority,
      severity: editForm.severity,
      role_tested: editForm.role_tested,
      updated_at: new Date().toISOString(),
    }).eq("id", editingCase.id);
    if (error) { toast.error("Failed to save"); return; }
    toast.success("Test case updated");
    setEditingCase(null);
    loadData();
  };

  const handleAddCase = async () => {
    const { error } = await supabase.from("test_cases").insert({
      module_id: newCase.module_id,
      feature_name: newCase.feature_name,
      title: newCase.title,
      description: newCase.description,
      preconditions: newCase.preconditions,
      steps_json: newCase.steps.split("\n").filter(Boolean),
      expected_result: newCase.expected_result,
      priority: newCase.priority,
      severity: newCase.severity,
      role_tested: newCase.role_tested,
      status: "not_run",
    });
    if (error) { toast.error("Failed to add"); return; }
    toast.success("Test case added");
    setAddDialog(false);
    setNewCase({ module_id: "", feature_name: "", title: "", description: "", preconditions: "", steps: "", expected_result: "", priority: "medium", severity: "medium", role_tested: "user" });
    loadData();
  };

  const handleArchiveCase = async (id: string) => {
    const { error } = await supabase.from("test_cases").update({ archived: true, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error("Failed to archive"); return; }
    setTestCases(prev => prev.map(t => t.id === id ? { ...t, archived: true } : t));
    toast.success("Test case archived");
    setDeleteConfirm(null);
  };

  const handleRestoreCase = async (id: string) => {
    const { error } = await supabase.from("test_cases").update({ archived: false, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error("Failed to restore"); return; }
    setTestCases(prev => prev.map(t => t.id === id ? { ...t, archived: false } : t));
    toast.success("Test case restored");
  };

  const openEditCase = (tc: DbTestCase) => {
    setEditingCase(tc);
    setEditForm({
      feature_name: tc.feature_name,
      title: tc.title,
      description: tc.description || "",
      preconditions: tc.preconditions || "",
      steps: Array.isArray(tc.steps_json) ? tc.steps_json.join("\n") : "",
      expected_result: tc.expected_result || "",
      actual_result: tc.actual_result || "",
      priority: tc.priority || "medium",
      severity: tc.severity || "medium",
      role_tested: tc.role_tested || "user",
    });
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading test cases...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FlaskConical className="w-6 h-6 text-primary" /> Unit Testing</h1>
          <p className="text-sm text-muted-foreground mt-1">QA test management — {stats.total} cases across {MODULES.length} modules • Database-backed</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={showArchived ? "default" : "outline"} onClick={() => setShowArchived(!showArchived)}>
            <ArchiveRestore className="w-4 h-4 mr-1" /> {showArchived ? "View Active" : `Archived (${archivedCount})`}
          </Button>
          <Button size="sm" onClick={() => setAddDialog(true)}><Plus className="w-4 h-4 mr-1" /> Add Test Case</Button>
        </div>
      </div>

      <Tabs defaultValue="cases" className="w-full">
        <TabsList>
          <TabsTrigger value="cases"><FlaskConical className="w-4 h-4 mr-1" /> Test Cases</TabsTrigger>
          <TabsTrigger value="impact"><Link2 className="w-4 h-4 mr-1" /> Update Impact</TabsTrigger>
        </TabsList>
        <TabsContent value="impact">
          <div className="space-y-4">
            <TestingImpactPanel />
            <ChangeLog moduleFilter="admin" />
          </div>
        </TabsContent>
        <TabsContent value="cases">

        <Card className="p-3"><div className="text-2xl font-bold">{stats.total}</div><div className="text-xs text-muted-foreground">Total</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-green-600">{stats.passed}</div><div className="text-xs text-muted-foreground">Passed</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-red-600">{stats.failed}</div><div className="text-xs text-muted-foreground">Failed</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-yellow-600">{stats.blocked}</div><div className="text-xs text-muted-foreground">Blocked</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-muted-foreground">{stats.notRun}</div><div className="text-xs text-muted-foreground">Not Run</div></Card>
      </div>

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

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="w-[100px]">Module</TableHead>
              <TableHead className="w-[80px]">Priority</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[80px]">Role</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(tc => {
              const StatusIcon = STATUS_ICON[(tc.status as TestStatus) || "not_run"];
              const isExpanded = expandedCase === tc.id;
              const modName = moduleNameMap[tc.module_id] || "";
              return (
                <>
                  <TableRow key={tc.id} className="cursor-pointer" onClick={() => setExpandedCase(isExpanded ? null : tc.id)}>
                    <TableCell>
                      <div className="text-sm font-medium">{tc.title}</div>
                      <div className="text-xs text-muted-foreground">{tc.feature_name}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{modName}</Badge></TableCell>
                    <TableCell><Badge className={`${PRIORITY_COLOR[tc.priority || "medium"]} text-[10px]`}>{tc.priority}</Badge></TableCell>
                    <TableCell>
                      <Select value={tc.status || "not_run"} onValueChange={v => handleStatusChange(tc.id, v)}>
                        <SelectTrigger className="h-7 text-xs w-[100px]" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <StatusIcon className={`w-3 h-3 ${STATUS_COLOR[(tc.status as TestStatus) || "not_run"]}`} />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_run">Not Run</SelectItem>
                          <SelectItem value="passed">Passed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{tc.role_tested}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditCase(tc)}><Edit className="w-3 h-3" /></Button>
                        {showArchived ? (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleRestoreCase(tc.id)}><ArchiveRestore className="w-3 h-3" /></Button>
                        ) : (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteConfirm(tc.id)}><Trash2 className="w-3 h-3" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={`${tc.id}-detail`}>
                      <TableCell colSpan={6} className="bg-muted/30">
                        <div className="p-4 space-y-3">
                          <div><span className="text-xs font-semibold">Description:</span><p className="text-sm text-muted-foreground">{tc.description}</p></div>
                          <div><span className="text-xs font-semibold">Preconditions:</span><p className="text-sm text-muted-foreground">{tc.preconditions}</p></div>
                          <div>
                            <span className="text-xs font-semibold">Steps:</span>
                            <ol className="text-sm text-muted-foreground list-decimal list-inside">
                              {(Array.isArray(tc.steps_json) ? tc.steps_json : []).map((s: string, i: number) => <li key={i}>{s}</li>)}
                            </ol>
                          </div>
                          <div><span className="text-xs font-semibold">Expected Result:</span><p className="text-sm text-muted-foreground">{tc.expected_result}</p></div>
                          {tc.actual_result && <div><span className="text-xs font-semibold">Actual Result:</span><p className="text-sm text-muted-foreground">{tc.actual_result}</p></div>}
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Severity: <Badge className={`${PRIORITY_COLOR[tc.severity || "medium"]} text-[10px]`}>{tc.severity}</Badge></span>
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

      <div className="text-xs text-muted-foreground text-right">Showing {filtered.length} of {stats.total} test cases</div>
      </TabsContent>
      </Tabs>

      <Dialog open={!!editingCase} onOpenChange={open => !open && setEditingCase(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Test Case</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={editForm.title} onChange={e => setEditForm((p: any) => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Feature</Label><Input value={editForm.feature_name} onChange={e => setEditForm((p: any) => ({ ...p, feature_name: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={editForm.description} onChange={e => setEditForm((p: any) => ({ ...p, description: e.target.value }))} rows={2} /></div>
            <div><Label>Preconditions</Label><Input value={editForm.preconditions} onChange={e => setEditForm((p: any) => ({ ...p, preconditions: e.target.value }))} /></div>
            <div><Label>Steps (one per line)</Label><Textarea value={editForm.steps} onChange={e => setEditForm((p: any) => ({ ...p, steps: e.target.value }))} rows={4} /></div>
            <div><Label>Expected Result</Label><Textarea value={editForm.expected_result} onChange={e => setEditForm((p: any) => ({ ...p, expected_result: e.target.value }))} rows={2} /></div>
            <div><Label>Actual Result</Label><Textarea value={editForm.actual_result} onChange={e => setEditForm((p: any) => ({ ...p, actual_result: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Priority</Label>
                <Select value={editForm.priority} onValueChange={v => setEditForm((p: any) => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity</Label>
                <Select value={editForm.severity} onValueChange={v => setEditForm((p: any) => ({ ...p, severity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Role</Label><Input value={editForm.role_tested} onChange={e => setEditForm((p: any) => ({ ...p, role_tested: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCase(null)}>Cancel</Button>
            <Button onClick={handleSaveCase}><Save className="w-4 h-4 mr-1" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Test Case Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Test Case</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Module</Label>
              <Select value={newCase.module_id} onValueChange={v => setNewCase(p => ({ ...p, module_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                <SelectContent>
                  {testModules.map(m => <SelectItem key={m.id} value={m.id}>{m.module_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Title</Label><Input value={newCase.title} onChange={e => setNewCase(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Feature</Label><Input value={newCase.feature_name} onChange={e => setNewCase(p => ({ ...p, feature_name: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={newCase.description} onChange={e => setNewCase(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
            <div><Label>Preconditions</Label><Input value={newCase.preconditions} onChange={e => setNewCase(p => ({ ...p, preconditions: e.target.value }))} /></div>
            <div><Label>Steps (one per line)</Label><Textarea value={newCase.steps} onChange={e => setNewCase(p => ({ ...p, steps: e.target.value }))} rows={4} /></div>
            <div><Label>Expected Result</Label><Textarea value={newCase.expected_result} onChange={e => setNewCase(p => ({ ...p, expected_result: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Priority</Label>
                <Select value={newCase.priority} onValueChange={v => setNewCase(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity</Label>
                <Select value={newCase.severity} onValueChange={v => setNewCase(p => ({ ...p, severity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Role</Label><Input value={newCase.role_tested} onChange={e => setNewCase(p => ({ ...p, role_tested: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddCase} disabled={!newCase.title || !newCase.module_id}><Plus className="w-4 h-4 mr-1" /> Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this test case?</AlertDialogTitle>
            <AlertDialogDescription>
              This test case will be moved to the archive. You can restore it later from the Archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleArchiveCase(deleteConfirm)}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUnitTesting;
