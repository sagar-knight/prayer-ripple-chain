import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Filter, FileText, Clock, Shield, Image, BookOpen, AlertTriangle, Info, Printer, Edit, Plus, Save, Upload, Trash2, X, GitBranch, History, Rocket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DocUserFlows from "@/components/admin/DocUserFlows";
import ChangeLog from "@/components/admin/ChangeLog";
import GoLivePlan from "@/components/admin/GoLivePlan";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DocStatus = "active" | "draft" | "needs_review" | "updated";

interface DbDocModule {
  id: string;
  module_key: string;
  module_name: string;
  parent_module: string | null;
  slug: string | null;
  description: string | null;
  access_roles: string[] | null;
  version: string | null;
  status: string | null;
  content_json: any;
  last_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

interface DbDocNote {
  id: string;
  documentation_module_id: string;
  note_title: string;
  note_body: string | null;
  note_type: string | null;
  version_tag: string | null;
  updated_by: string | null;
  created_at: string;
}

interface DbScreenshot {
  id: string;
  documentation_module_id: string;
  title: string;
  image_url: string;
  caption: string | null;
  sort_order: number | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  needs_review: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  updated: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const ROLE_COLORS: Record<string, string> = {
  guest: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  user: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  moderator: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

// Seed data used on first load
const SEED_DOCS = [
  { module_key: "auth", module_name: "Authentication", status: "active", version: "1.2", access_roles: ["guest","user","moderator","admin"], description: "Authentication & Access Control", content_json: { purpose: "Handles user registration, login, password recovery, email verification, and session management.", features: ["Email + password signup with strength meter","Email + password login","Google OAuth social login","Forgot password / reset password flow","Email verification required","Session persistence","Auto-refresh token management","Protected route wrapper","Admin route wrapper with role verification","Auth callback handler"], userFlow: ["User visits /signup → fills details","Password strength validates","Account created → verification email sent","User verifies → can login","Session stored and auto-refreshed"], adminFlow: ["AdminRoute checks user_roles for admin role","Non-admin redirected to home"], scenarios: [{ label: "Happy path", description: "Sign up → verify → login → access protected routes" },{ label: "Invalid credentials", description: "Wrong password → error toast" },{ label: "Unauthorized admin", description: "Non-admin → redirect to /" }], rules: ["Email must be valid","Password strength required","Email verification required","Google OAuth is only social provider"], dependencies: ["profiles","user_roles","Supabase Auth"], commonIssues: ["Verification email in spam","OAuth redirect misconfigured"], technicalNotes: ["useAuth.tsx","ProtectedRoute.tsx","AdminRoute.tsx","PasswordStrengthMeter.tsx"] }},
  { module_key: "pray", module_name: "PRAY", status: "active", version: "2.0", access_roles: ["guest","user"], description: "Pray for Others", content_json: { purpose: "Core spiritual engagement feature. Users browse and pray for open prayer requests.", features: ["Unified prayer feed","Prayer cards","Prayer session with scripture","Pass-it-forward sharing","Ripple chain visualization","Anonymous support","Coverage tracking"], userFlow: ["Navigate to /pray","Browse prayer cards","Click Pray → session opens","Prayer count incremented via RPC","Optional: Pass it Forward"], scenarios: [{ label: "Happy path", description: "Browse → pray → count updates" },{ label: "Anonymous prayer", description: "No author shown" },{ label: "Empty state", description: "Encouraging message displayed" }], rules: ["Only open/public prayers in feed","Test accounts excluded","Anonymous masks created_by","Actions via security definer RPC"], dependencies: ["global_prayer_requests","prayer_actions","prayer_coverage","unified_prayer_feed"], commonIssues: ["Prayer count not updating","Anonymous prayers showing author"], technicalNotes: ["PrayForOthers.tsx","PrayerCard.tsx","usePrayerService.ts"] }},
  { module_key: "request", module_name: "Request", status: "active", version: "1.3", access_roles: ["guest","user"], description: "Prayer Request Submission", content_json: { purpose: "Submit prayer requests for the global feed with content moderation.", features: ["Prayer request form","Anonymous toggle","Content moderation","Auto-moderation rules","Status tracking"], userFlow: ["Navigate to /submit-prayer","Fill title, description, category","Submit → moderation check","If approved → appears in feed"], adminFlow: ["Flagged items in moderation queue","Admin approves/rejects","Actions logged to audit"], scenarios: [{ label: "Happy path", description: "Valid prayer → passes moderation → in feed" },{ label: "Content flagged", description: "Sent to moderation queue" }], rules: ["Title and description required","Moderation runs before saving","created_by must match user ID"], dependencies: ["global_prayer_requests","moderation_queue","moderate-content edge function"], commonIssues: ["Request not appearing → check moderation queue"], technicalNotes: ["SubmitPrayer.tsx","useContentModeration.ts"] }},
  { module_key: "churches", module_name: "Churches", status: "active", version: "1.4", access_roles: ["guest","user","moderator","admin"], description: "Church Community", content_json: { purpose: "Church communities with private/public prayer walls and member management.", features: ["Church listing","Registration","Privacy settings","Prayer wall","Admin panel","Membership","Invite links","Moderation","Role-based access"], userFlow: ["Browse /churches","View detail","Join church → assigned member role","Submit prayers → approval flow"], scenarios: [{ label: "Happy path", description: "Register → invite → pray → approve" },{ label: "Role escalation prevention", description: "Members forced to member role by RLS" }], rules: ["New members always 'member' role","Church admins manage settings","Public/private prayer visibility"], dependencies: ["churches","church_memberships","church_prayer_requests","churches_public view"], commonIssues: ["Slug conflict","Member not seeing prayers"], technicalNotes: ["Churches.tsx","ChurchDetail.tsx","ChurchAdmin.tsx","useChurch.ts"] }},
  { module_key: "ripple", module_name: "Ripple", status: "active", version: "1.1", access_roles: ["user"], description: "Ripple Impact & Prayer Chains", content_json: { purpose: "Visualizes prayer impact through chains, coverage tracking, and invite sharing.", features: ["Ripple dashboard","Prayer chain visualization","Coverage tracking","Invite links with QR","User prayer statistics"], userFlow: ["Navigate to /ripple","View stats","Share prayers via invite links"], scenarios: [{ label: "Happy path", description: "Pray → share → friend joins → chain grows" }], rules: ["Authenticated only","Chains tracked via prayer_chain_nodes","Clicks tracked via RPC"], dependencies: ["prayer_chain_nodes","prayer_coverage","prayer_invites","user_prayer_stats"], commonIssues: ["Chain not showing","Stats not updating"], technicalNotes: ["RippleImpact.tsx","PrayerRippleChain.tsx"] }},
  { module_key: "support", module_name: "Support", status: "active", version: "1.0", access_roles: ["guest","user"], description: "Support the Mission", content_json: { purpose: "Donation page with Stripe checkout integration.", features: ["Support/donation page","Stripe checkout","Multiple tiers"], userFlow: ["Visit /support","Select amount","Stripe checkout","Success/failure"], scenarios: [{ label: "Happy path", description: "Select → checkout → success" }], rules: ["Stripe key as secret","Server-side checkout creation"], dependencies: ["Stripe","create-support-checkout edge function"], commonIssues: ["Stripe key not configured"], technicalNotes: ["SupportMission.tsx"] }},
  { module_key: "store", module_name: "Store", status: "active", version: "1.1", access_roles: ["guest","user"], description: "Merchandise Store", content_json: { purpose: "E-commerce storefront with Gelato print-on-demand integration.", features: ["Product listing","Product detail","Shopping cart (Zustand)","Gelato proxy","Store info pages","Order tracking"], userFlow: ["Browse /store","View product","Add to cart","Checkout"], scenarios: [{ label: "Happy path", description: "Browse → cart → checkout" }], rules: ["Cart icon only on store routes","Cart persisted via localStorage"], dependencies: ["Gelato API","cartStore","gelato-proxy edge function"], commonIssues: ["Gelato API key missing","Cart not syncing"], technicalNotes: ["Store.tsx","ProductDetail.tsx","cartStore.ts"] }},
  { module_key: "calendar", module_name: "Calendar", status: "active", version: "1.0", access_roles: ["user"], description: "Prayer Calendar", content_json: { purpose: "Calendar view for prayer commitments and daily tracking.", features: ["Calendar view","Daily prayer logs","Timezone-aware reminders","Completion tracking"], userFlow: ["Navigate to /calendar","View reminders","Mark prayers complete"], scenarios: [{ label: "Happy path", description: "View → mark complete" }], rules: ["Authenticated only","Per-user RLS","Timezone consistency"], dependencies: ["prayer_reminders","prayer_reminder_daily_logs"], commonIssues: ["Timezone mismatch"], technicalNotes: ["PrayerCalendar.tsx","usePrayerReminders.ts"] }},
  { module_key: "family", module_name: "Family", status: "active", version: "1.0", access_roles: ["user"], description: "Family Prayer Groups", content_json: { purpose: "Private family prayer groups with shared requests, scriptures, and notes.", features: ["Create groups","Invite via code","Family prayer requests","Shared scriptures","Family notes","Privacy via RLS"], userFlow: ["Create group → share code → members join → pray together"], scenarios: [{ label: "Happy path", description: "Create → invite → pray" },{ label: "Non-member access blocked", description: "RLS prevents data access" }], rules: ["Members assigned 'member' role","is_family_member() checks access","Active members only"], dependencies: ["family_groups","family_members","family_prayer_requests","family_scriptures","family_notes"], commonIssues: ["Member not seeing data → check active status"], technicalNotes: ["FamilyRequests.tsx","FamilyPrayerRequests.tsx","FamilyScriptures.tsx"] }},
  { module_key: "scripture", module_name: "Scripture", status: "active", version: "1.1", access_roles: ["guest","user"], description: "Scripture & Bible Reader", content_json: { purpose: "Scripture reading, daily verses, and AI-powered Bible analysis.", features: ["Scripture page","Daily verse card","Bible reader","AI analysis","Scripture encouragement"], userFlow: ["Visit /scripture","Browse content","Request AI analysis"], scenarios: [{ label: "Happy path", description: "Read → AI analysis → insights" }], rules: ["AI uses Lovable AI Gateway","Daily verse rotates deterministically"], dependencies: ["bible-ai edge function","verses data","bible data"], commonIssues: ["AI not responding → check LOVABLE_API_KEY"], technicalNotes: ["Scripture.tsx","BibleReader.tsx","DailyVerseCard.tsx"] }},
  { module_key: "profile", module_name: "Profile", status: "active", version: "1.0", access_roles: ["user"], description: "User Profile & Activity", content_json: { purpose: "User profile management, activity tracking, and settings.", features: ["Profile page","Display name editing","Avatar","Commitment level","My activity","Prayer reminders"], userFlow: ["View /profile","Edit display name","View activity history"], scenarios: [{ label: "Happy path", description: "View → edit → save" }], rules: ["Users can only view/edit own profile","Admin can view all profiles"], dependencies: ["profiles","user_prayer_stats"], commonIssues: ["Profile not loading → check RLS"], technicalNotes: ["Profile.tsx","MyCommitments.tsx"] }},
  { module_key: "navigation", module_name: "Navigation", status: "active", version: "1.3", access_roles: ["guest","user","moderator","admin"], description: "App Navigation System", content_json: { purpose: "Core navigation including top nav, bottom nav, routing, and conditional elements.", features: ["Top navigation bar","Bottom mobile nav","Profile dropdown","Conditional cart icon","Store sub-nav","Footer"], userFlow: ["Navigation available on all pages","Mobile: bottom nav","Desktop: top nav + dropdown"], scenarios: [{ label: "Responsive", description: "Mobile → bottom nav, Desktop → top nav" }], rules: ["Cart icon only on store routes","Admin link only for admins","Auth-dependent menu items"], dependencies: ["react-router-dom","useAuth","useAdminRole"], commonIssues: ["Cart showing on non-store pages"], technicalNotes: ["Navigation.tsx","BottomNav.tsx","AppFooter.tsx"] }},
  { module_key: "moderation", module_name: "Moderation", status: "active", version: "1.2", access_roles: ["moderator","admin"], description: "Content Moderation System", content_json: { purpose: "AI-assisted and manual content moderation for quality and safety.", features: ["AI moderation via edge function","Moderation queue","Approve/reject","Confidence scoring","Automation rules","Audit trail"], userFlow: ["Content submitted → AI evaluates","If flagged → enters queue","Admin reviews → approve/reject"], scenarios: [{ label: "Clean content", description: "AI passes → saved immediately" },{ label: "Flagged", description: "Queue → admin reviews" }], rules: ["Only admins/moderators access queue","Decisions logged with actor and reason"], dependencies: ["moderation_queue","automation_rules","admin_audit_log","moderate-content edge function"], commonIssues: ["AI false positives","Queue growing"], technicalNotes: ["AdminModeration.tsx","AdminAutomation.tsx","ModerationDashboard.tsx"] }},
  { module_key: "error-handling", module_name: "Error Handling", status: "active", version: "1.0", access_roles: ["guest","user","moderator","admin"], description: "Error Handling & Validation", content_json: { purpose: "Consistent error handling, validation, loading, and empty states.", features: ["Form validation (react-hook-form + zod)","Password strength","Toast notifications","Loading spinners","Empty states","404 page"], userFlow: ["Invalid form → inline errors","Async → spinner","Success/error → toast","Unknown route → 404"], scenarios: [{ label: "Validation error", description: "Required field empty → inline error" },{ label: "404", description: "Unknown route → NotFound page" }], rules: ["All forms use react-hook-form","Zod for validation schemas","sonner for toasts"], dependencies: ["react-hook-form","zod","sonner"], commonIssues: ["Toast not showing","Validation not triggering"], technicalNotes: ["validation.ts","NotFound.tsx","PasswordStrengthMeter.tsx"] }},
  { module_key: "test-accounts", module_name: "Test Accounts", status: "active", version: "1.0", access_roles: ["admin"], description: "Internal Testing Account System", content_json: { purpose: "Internal test accounts hidden from production users and analytics.", features: ["Mark/unmark test accounts","Test role labels","Exclude from analytics","Test badge in admin","Hidden from public views"], userFlow: ["Admin → Users → Mark Test → Set label"], scenarios: [{ label: "Mark test", description: "User's content hidden from feeds" }], rules: ["Only admins toggle test flags","Views filter out test accounts","Disabled test accounts cannot login"], dependencies: ["profiles","global_prayers_public view","unified_prayer_feed view","user_roles"], commonIssues: ["Test prayer visible → verify view filter","Cannot mark → check admin RLS"], technicalNotes: ["AdminUsers.tsx","profiles.is_test_account"] }},
];

const AdminDocumentation = () => {
  const [modules, setModules] = useState<DbDocModule[]>([]);
  const [notes, setNotes] = useState<Record<string, DbDocNote[]>>({});
  const [screenshots, setScreenshots] = useState<Record<string, DbScreenshot[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandAll, setExpandAll] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);

  // Edit state
  const [editingModule, setEditingModule] = useState<DbDocModule | null>(null);
  const [editContent, setEditContent] = useState<any>({});
  const [editFields, setEditFields] = useState({ module_name: "", description: "", version: "", status: "", access_roles: "" });
  
  // Note dialog
  const [noteDialog, setNoteDialog] = useState<{ moduleId: string } | null>(null);
  const [newNote, setNewNote] = useState({ title: "", body: "", type: "update", version: "" });

  // Screenshot upload
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    const { data: mods } = await supabase.from("documentation_modules").select("*").order("module_name");
    
    if (!mods || mods.length === 0) {
      // Seed from defaults
      const inserts = SEED_DOCS.map(s => ({
        module_key: s.module_key,
        module_name: s.module_name,
        status: s.status,
        version: s.version,
        access_roles: s.access_roles,
        description: s.description,
        content_json: s.content_json,
        slug: s.module_key,
      }));
      const { data: seeded, error } = await supabase.from("documentation_modules").insert(inserts).select();
      if (error) { toast.error("Failed to seed documentation"); setLoading(false); return; }
      setModules(seeded || []);
      
      // Seed initial notes
      if (seeded) {
        const noteInserts = seeded.map(m => ({
          documentation_module_id: m.id,
          note_title: "Initial documentation",
          note_body: `Created documentation for ${m.module_name}`,
          note_type: "create",
          version_tag: m.version || "1.0",
          updated_by: "System",
        }));
        const { data: seededNotes } = await supabase.from("documentation_notes").insert(noteInserts).select();
        if (seededNotes) {
          const grouped: Record<string, DbDocNote[]> = {};
          seededNotes.forEach(n => {
            if (!grouped[n.documentation_module_id]) grouped[n.documentation_module_id] = [];
            grouped[n.documentation_module_id].push(n);
          });
          setNotes(grouped);
        }
      }
    } else {
      setModules(mods);
      // Load notes
      const { data: allNotes } = await supabase.from("documentation_notes").select("*").order("created_at", { ascending: false });
      if (allNotes) {
        const grouped: Record<string, DbDocNote[]> = {};
        allNotes.forEach(n => {
          if (!grouped[n.documentation_module_id]) grouped[n.documentation_module_id] = [];
          grouped[n.documentation_module_id].push(n);
        });
        setNotes(grouped);
      }
      // Load screenshots
      const { data: allScreens } = await supabase.from("documentation_screenshots").select("*").order("sort_order");
      if (allScreens) {
        const grouped: Record<string, DbScreenshot[]> = {};
        allScreens.forEach(s => {
          if (!grouped[s.documentation_module_id]) grouped[s.documentation_module_id] = [];
          grouped[s.documentation_module_id].push(s);
        });
        setScreenshots(grouped);
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSaveModule = async () => {
    if (!editingModule) return;
    const { error } = await supabase.from("documentation_modules").update({
      module_name: editFields.module_name,
      description: editFields.description,
      version: editFields.version,
      status: editFields.status,
      access_roles: editFields.access_roles.split(",").map(r => r.trim()).filter(Boolean),
      content_json: editContent,
      last_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", editingModule.id);
    if (error) { toast.error("Failed to save"); return; }
    toast.success("Documentation updated");
    setEditingModule(null);
    loadData();
  };

  const handleAddNote = async () => {
    if (!noteDialog) return;
    const { error } = await supabase.from("documentation_notes").insert({
      documentation_module_id: noteDialog.moduleId,
      note_title: newNote.title,
      note_body: newNote.body,
      note_type: newNote.type,
      version_tag: newNote.version,
      updated_by: "Admin",
    });
    if (error) { toast.error("Failed to add note"); return; }
    toast.success("Note added");
    setNoteDialog(null);
    setNewNote({ title: "", body: "", type: "update", version: "" });
    loadData();
  };

  const handleDeleteNote = async (noteId: string) => {
    await supabase.from("documentation_notes").delete().eq("id", noteId);
    toast.success("Note deleted");
    loadData();
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!uploadingFor || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const ext = file.name.split(".").pop();
    const path = `${uploadingFor}/${Date.now()}.${ext}`;
    
    const { error: uploadError } = await supabase.storage.from("doc-screenshots").upload(path, file);
    if (uploadError) { toast.error("Upload failed: " + uploadError.message); return; }
    
    const { data: urlData } = supabase.storage.from("doc-screenshots").getPublicUrl(path);
    
    const { error } = await supabase.from("documentation_screenshots").insert({
      documentation_module_id: uploadingFor,
      title: file.name,
      image_url: urlData.publicUrl,
      caption: "",
      sort_order: (screenshots[uploadingFor]?.length || 0),
    });
    if (error) { toast.error("Failed to save screenshot"); return; }
    toast.success("Screenshot uploaded");
    setUploadingFor(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    loadData();
  };

  const handleDeleteScreenshot = async (id: string) => {
    await supabase.from("documentation_screenshots").delete().eq("id", id);
    toast.success("Screenshot deleted");
    loadData();
  };

  const filtered = useMemo(() => {
    return modules.filter(d => {
      const content = d.content_json as any || {};
      const matchSearch = !search || d.module_name.toLowerCase().includes(search.toLowerCase()) || (d.description || "").toLowerCase().includes(search.toLowerCase()) || (content.purpose || "").toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || (d.access_roles || []).includes(roleFilter);
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [search, roleFilter, statusFilter, modules]);

  const handleExpandAll = () => {
    if (expandAll) setOpenSections([]);
    else setOpenSections(filtered.map(d => d.id));
    setExpandAll(!expandAll);
  };

  const openEdit = (mod: DbDocModule) => {
    setEditingModule(mod);
    setEditFields({
      module_name: mod.module_name,
      description: mod.description || "",
      version: mod.version || "1.0",
      status: mod.status || "active",
      access_roles: (mod.access_roles || []).join(", "),
    });
    setEditContent(mod.content_json || {});
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading documentation...</div>;

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-primary/15 text-primary items-center justify-center shrink-0 shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Documentation</h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                Complete reference · <span className="font-medium text-foreground">{modules.length} modules</span> · Database-backed & editable
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-lg" onClick={handleExpandAll}>
              {expandAll ? "Collapse All" : "Expand All"}
            </Button>
            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-1" /> Print
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="modules" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 mr-1.5" /> Modules
          </TabsTrigger>
          <TabsTrigger value="changelog" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <History className="w-4 h-4 mr-1.5" /> Change Log
          </TabsTrigger>
          <TabsTrigger value="golive" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Rocket className="w-4 h-4 mr-1.5" /> Go-Live Plan
          </TabsTrigger>
        </TabsList>
        <TabsContent value="changelog">
          <ChangeLog />
        </TabsContent>
        <TabsContent value="golive" className="mt-6">
          <GoLivePlan />
        </TabsContent>
        <TabsContent value="modules" className="space-y-6 mt-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 rounded-xl border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold tracking-tight">{modules.length}</div>
          <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide font-medium">Total Modules</div>
        </Card>
        <Card className="p-4 rounded-xl border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">{modules.filter(d => d.status === "active").length}</div>
          <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide font-medium">Active</div>
        </Card>
        <Card className="p-4 rounded-xl border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{modules.filter(d => d.status === "updated").length}</div>
          <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide font-medium">Updated</div>
        </Card>
        <Card className="p-4 rounded-xl border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold tracking-tight text-yellow-600 dark:text-yellow-400">{modules.filter(d => d.status === "draft" || d.status === "needs_review").length}</div>
          <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide font-medium">Draft / Review</div>
        </Card>
      </div>

      {/* Filter bar */}
      <Card className="p-3 rounded-xl bg-muted/30 border-muted">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search modules by name or description..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background border-muted rounded-lg" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-background rounded-lg"><Filter className="w-4 h-4 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="guest">Guest</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-background rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="needs_review">Needs Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Quick-jump chips */}
      {filtered.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Jump to module</div>
          <div className="flex gap-1.5 flex-wrap">
            {filtered.map(d => (
              <button
                key={d.id}
                onClick={() => {
                  setOpenSections(prev => prev.includes(d.id) ? prev : [...prev, d.id]);
                  document.getElementById(`doc-${d.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors"
              >
                {d.module_name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Accordion type="multiple" value={openSections} onValueChange={setOpenSections} className="space-y-3">
        {filtered.map(doc => {
          const content = (doc.content_json as any) || {};
          const modNotes = notes[doc.id] || [];
          const modScreenshots = screenshots[doc.id] || [];

          return (
            <AccordionItem
              key={doc.id}
              value={doc.id}
              id={`doc-${doc.id}`}
              className="border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow data-[state=open]:shadow-md data-[state=open]:border-primary/30 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-muted/40 transition-colors [&[data-state=open]]:bg-muted/30">
                <div className="flex items-center gap-3 text-left w-full">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate">{doc.description || doc.module_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-medium">{doc.module_name}</span>
                      <span className="mx-1.5 opacity-50">·</span>
                      <span>v{doc.version}</span>
                    </div>
                  </div>
                  <Badge className={`${STATUS_COLORS[doc.status || "active"]} text-[10px] ml-2 shrink-0`}>{doc.status}</Badge>
                  <span className="text-[10px] text-muted-foreground ml-3 mr-2 hidden md:block shrink-0">
                    {doc.last_updated_at ? new Date(doc.last_updated_at).toLocaleDateString() : ""}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4 pb-5 px-5 space-y-6 border-t bg-background">
                  {/* Edit button */}
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" onClick={() => openEdit(doc)}>
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  </div>

                  {/* Purpose */}
                  {content.purpose && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5"><Info className="w-4 h-4 text-primary" /> Purpose</h4>
                      <p className="text-sm text-muted-foreground">{content.purpose}</p>
                    </div>
                  )}

                  {/* Access Roles */}
                  <div>
                    <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" /> Who Can Access</h4>
                    <div className="flex gap-1.5 flex-wrap">{(doc.access_roles || []).map(r => <Badge key={r} variant="outline" className={ROLE_COLORS[r] || ""}>{r}</Badge>)}</div>
                  </div>

                  {/* Features */}
                  {content.features?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Main Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-0.5 list-disc list-inside">{content.features.map((f: string, i: number) => <li key={i}>{f}</li>)}</ul>
                    </div>
                  )}

                  {/* User Flow */}
                  {content.userFlow?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">User Flow</h4>
                      <ol className="text-sm text-muted-foreground space-y-0.5 list-decimal list-inside">{content.userFlow.map((s: string, i: number) => <li key={i}>{s}</li>)}</ol>
                    </div>
                  )}

                  {/* Admin Flow */}
                  {content.adminFlow?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Admin / Moderator Flow</h4>
                      <ol className="text-sm text-muted-foreground space-y-0.5 list-decimal list-inside">{content.adminFlow.map((s: string, i: number) => <li key={i}>{s}</li>)}</ol>
                    </div>
                  )}

                  {/* User Flows (DB-backed) */}
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                      <GitBranch className="w-4 h-4 text-primary" /> User Flows
                    </h4>
                    <DocUserFlows moduleId={doc.id} moduleName={doc.module_name} />
                  </div>
                  <Separator />
                  {content.scenarios?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Scenarios</h4>
                      <div className="space-y-1.5">{content.scenarios.map((s: any, i: number) => (
                        <div key={i} className="text-sm"><span className="font-medium">{s.label}:</span> <span className="text-muted-foreground">{s.description}</span></div>
                      ))}</div>
                    </div>
                  )}

                  {/* Rules */}
                  {content.rules?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Rules / Logic</h4>
                      <ul className="text-sm text-muted-foreground space-y-0.5 list-disc list-inside">{content.rules.map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>
                    </div>
                  )}

                  {/* Dependencies */}
                  {content.dependencies?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Dependencies</h4>
                      <div className="flex gap-1.5 flex-wrap">{content.dependencies.map((d: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{d}</Badge>)}</div>
                    </div>
                  )}

                  {/* Common Issues */}
                  {content.commonIssues?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-yellow-500" /> Common Issues</h4>
                      <ul className="text-sm text-muted-foreground space-y-0.5 list-disc list-inside">{content.commonIssues.map((c: string, i: number) => <li key={i}>{c}</li>)}</ul>
                    </div>
                  )}

                  {/* Screenshots */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-primary" /> Screenshots
                      <Button size="sm" variant="ghost" className="h-6 text-xs ml-2" onClick={() => { setUploadingFor(doc.id); fileInputRef.current?.click(); }}>
                        <Upload className="w-3 h-3 mr-1" /> Upload
                      </Button>
                    </h4>
                    {modScreenshots.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {modScreenshots.map(s => (
                          <div key={s.id} className="relative border rounded-lg overflow-hidden group">
                            <img src={s.image_url} alt={s.title} className="w-full h-32 object-cover" />
                            <div className="p-1.5 text-xs text-muted-foreground">{s.title}</div>
                            <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteScreenshot(s.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
                        No screenshots yet — click Upload to add
                      </div>
                    )}
                  </div>

                  {/* Technical Notes */}
                  {content.technicalNotes?.length > 0 && (
                    <Accordion type="single" collapsible>
                      <AccordionItem value="tech">
                        <AccordionTrigger className="text-sm py-2">Technical Notes</AccordionTrigger>
                        <AccordionContent>
                          <ul className="text-sm text-muted-foreground space-y-0.5 list-disc list-inside font-mono">{content.technicalNotes.map((t: string, i: number) => <li key={i}>{t}</li>)}</ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}

                  {/* Changelog / Notes */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" /> Changelog & Notes
                      <Button size="sm" variant="ghost" className="h-6 text-xs ml-2" onClick={() => setNoteDialog({ moduleId: doc.id })}>
                        <Plus className="w-3 h-3 mr-1" /> Add Note
                      </Button>
                    </h4>
                    <div className="space-y-2 border-l-2 border-border pl-4">
                      {modNotes.map(n => (
                        <div key={n.id} className="text-sm group flex items-start gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {n.version_tag && <Badge variant="outline" className="text-[10px]">v{n.version_tag}</Badge>}
                              <span className="font-medium">{n.note_title}</span>
                              <span className="text-muted-foreground text-xs">— {new Date(n.created_at).toLocaleString()}</span>
                            </div>
                            {n.note_body && <p className="text-muted-foreground text-xs mt-0.5">{n.note_body} • by {n.updated_by || "Admin"}</p>}
                          </div>
                          <Button size="icon" variant="ghost" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteNote(n.id)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      {modNotes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet</p>}
                    </div>
                  </div>
                  {/* Module-specific Change History */}
                  <Separator />
                  <div>
                    <ChangeLog moduleFilter={doc.module_key} />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No documentation matches your filters.</p>
        </div>
      )}

      {/* Hidden file input for screenshot upload */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshotUpload} />
      </TabsContent>
      </Tabs>

      {/* Edit Module Dialog */}
      <Dialog open={!!editingModule} onOpenChange={open => !open && setEditingModule(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit: {editingModule?.module_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Module Name</Label><Input value={editFields.module_name} onChange={e => setEditFields(p => ({ ...p, module_name: e.target.value }))} /></div>
              <div><Label>Version</Label><Input value={editFields.version} onChange={e => setEditFields(p => ({ ...p, version: e.target.value }))} /></div>
            </div>
            <div><Label>Description / Title</Label><Input value={editFields.description} onChange={e => setEditFields(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={editFields.status} onValueChange={v => setEditFields(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="needs_review">Needs Review</SelectItem>
                    <SelectItem value="updated">Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Access Roles (comma-separated)</Label><Input value={editFields.access_roles} onChange={e => setEditFields(p => ({ ...p, access_roles: e.target.value }))} placeholder="guest, user, admin" /></div>
            </div>
            <Separator />
            <div><Label>Purpose</Label><Textarea value={editContent.purpose || ""} onChange={e => setEditContent((p: any) => ({ ...p, purpose: e.target.value }))} rows={2} /></div>
            <div><Label>Features (one per line)</Label><Textarea value={(editContent.features || []).join("\n")} onChange={e => setEditContent((p: any) => ({ ...p, features: e.target.value.split("\n").filter(Boolean) }))} rows={4} /></div>
            <div><Label>User Flow (one step per line)</Label><Textarea value={(editContent.userFlow || []).join("\n")} onChange={e => setEditContent((p: any) => ({ ...p, userFlow: e.target.value.split("\n").filter(Boolean) }))} rows={3} /></div>
            <div><Label>Admin Flow (one step per line)</Label><Textarea value={(editContent.adminFlow || []).join("\n")} onChange={e => setEditContent((p: any) => ({ ...p, adminFlow: e.target.value.split("\n").filter(Boolean) }))} rows={3} /></div>
            <div><Label>Rules (one per line)</Label><Textarea value={(editContent.rules || []).join("\n")} onChange={e => setEditContent((p: any) => ({ ...p, rules: e.target.value.split("\n").filter(Boolean) }))} rows={3} /></div>
            <div><Label>Dependencies (one per line)</Label><Textarea value={(editContent.dependencies || []).join("\n")} onChange={e => setEditContent((p: any) => ({ ...p, dependencies: e.target.value.split("\n").filter(Boolean) }))} rows={2} /></div>
            <div><Label>Common Issues (one per line)</Label><Textarea value={(editContent.commonIssues || []).join("\n")} onChange={e => setEditContent((p: any) => ({ ...p, commonIssues: e.target.value.split("\n").filter(Boolean) }))} rows={2} /></div>
            <div><Label>Technical Notes (one per line)</Label><Textarea value={(editContent.technicalNotes || []).join("\n")} onChange={e => setEditContent((p: any) => ({ ...p, technicalNotes: e.target.value.split("\n").filter(Boolean) }))} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingModule(null)}>Cancel</Button>
            <Button onClick={handleSaveModule}><Save className="w-4 h-4 mr-1" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={!!noteDialog} onOpenChange={open => !open && setNoteDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Changelog Note</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={newNote.title} onChange={e => setNewNote(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={newNote.body} onChange={e => setNewNote(p => ({ ...p, body: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={newNote.type} onValueChange={v => setNewNote(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="fix">Fix</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Version Tag</Label><Input value={newNote.version} onChange={e => setNewNote(p => ({ ...p, version: e.target.value }))} placeholder="1.0" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialog(null)}>Cancel</Button>
            <Button onClick={handleAddNote} disabled={!newNote.title}><Plus className="w-4 h-4 mr-1" /> Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDocumentation;
