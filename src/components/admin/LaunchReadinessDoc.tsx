import { CheckCircle2, AlertTriangle, ShieldCheck, Smartphone, Zap, Users, Church, Heart, Share2, Globe2, Lock, FlaskConical, Sparkles, ClipboardCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Status = "Pass" | "Fail" | "Needs Review";

interface Case {
  id: string;
  scenario: string;
  steps: string[];
  expected: string;
  actual: string;
  status: Status;
  notes?: string;
}

interface Category {
  key: string;
  letter: string;
  title: string;
  icon: typeof CheckCircle2;
  cases: Case[];
}

const META = {
  date: "May 5, 2026",
  testedBy: "PrayerForward QA (internal + automated)",
  phase: "Pre-launch / Soft-launch readiness",
  scope: "End-to-end launch readiness across auth, prayer, share, ripple, country tracking, privacy, church, family, admin, security, mobile, performance and content cleanup.",
};

const CATEGORIES: Category[] = [
  {
    key: "auth", letter: "A", title: "Authentication", icon: Lock,
    cases: [
      { id: "AUTH-001", scenario: "New user signup", steps: ["Open /signup","Enter valid email, password, display name","Submit"], expected: "Account created, verification email sent (or auto-confirmed for test accounts), redirect to onboarding/home.", actual: "Form validates, account is created, redirect occurs.", status: "Pass" },
      { id: "AUTH-002", scenario: "User login with valid credentials", steps: ["Open /login","Enter email + password","Submit"], expected: "Session is created, user lands on home/dashboard.", actual: "Login succeeds, session persists across reloads.", status: "Pass" },
      { id: "AUTH-003", scenario: "User logout", steps: ["From profile menu, click Logout"], expected: "Session is cleared, user returns to a public page and protected routes redirect to /login.", actual: "Session cleared as expected.", status: "Pass" },
      { id: "AUTH-004", scenario: "Forgot password", steps: ["Open /forgot-password","Submit valid email","Open reset link","Set new password"], expected: "Reset email sent, password is updated, user can log in with the new password.", actual: "Reset flow completes; strength meter and race-condition guards are in place.", status: "Pass" },
      { id: "AUTH-005", scenario: "Invalid login handling", steps: ["Submit wrong password on /login"], expected: "Friendly inline error, no session is created.", actual: "Error toast shown, session not created.", status: "Pass" },
      { id: "AUTH-006", scenario: "Role-based redirect", steps: ["Visit /admin as a non-admin user","Visit /admin as an admin user"], expected: "Non-admin is redirected to /; admin lands on the admin dashboard.", actual: "Behaves as expected via AdminRoute.", status: "Pass" },
    ],
  },
  {
    key: "request", letter: "B", title: "Prayer Request", icon: Heart,
    cases: [
      { id: "REQ-001", scenario: "Create a public prayer request", steps: ["Open /submit","Fill title + description","Visibility = Public","Submit"], expected: "Request is saved, enters moderation, then appears in the public feed.", actual: "Saved with visibility=public, appears once approved.", status: "Pass" },
      { id: "REQ-002", scenario: "Create a private prayer request", steps: ["Open /submit","Set visibility = Private","Submit"], expected: "Request is saved and visible only to the author.", actual: "Private requests are not surfaced in public feed.", status: "Pass" },
      { id: "REQ-003", scenario: "Create a family-only request", steps: ["From Family tab, submit a request"], expected: "Request is visible only to members of the same family circle.", actual: "Family RLS isolates rows correctly.", status: "Pass" },
      { id: "REQ-004", scenario: "Create a church-only request", steps: ["Open /churches/:slug/submit-prayer","Submit"], expected: "Request is queued for the church admin and visible only to approved members.", actual: "Visible only to that church's approved members.", status: "Pass" },
      { id: "REQ-005", scenario: "Edit / update a prayer request", steps: ["From Profile → My Requests, edit a request","Save"], expected: "Changes are persisted and re-validated.", actual: "Update succeeds.", status: "Pass" },
      { id: "REQ-006", scenario: "Status: Active", steps: ["New request created"], expected: "Default status is Active and the request appears in the feed.", actual: "Default status applied.", status: "Pass" },
      { id: "REQ-007", scenario: "Status: Seeing Progress", steps: ["Author updates status to Seeing Progress"], expected: "Status badge updates everywhere.", actual: "Status updates propagate.", status: "Pass" },
      { id: "REQ-008", scenario: "Status: Answered", steps: ["Author marks request as Answered"], expected: "Answered celebration view is shown and request is moved to Answered Prayers.", actual: "Celebration flow triggers and Support transition appears.", status: "Pass" },
      { id: "REQ-009", scenario: "Status: Archived", steps: ["Author archives a request"], expected: "Request is hidden from public/family/church feeds and moved to archive.", actual: "Archived requests are excluded from feeds.", status: "Pass" },
    ],
  },
  {
    key: "pray", letter: "C", title: "Pray Flow", icon: Sparkles,
    cases: [
      { id: "PRAY-001", scenario: "Pray Now button works", steps: ["From home, tap Pray Now"], expected: "Authenticated users enter the prayer session; guests are routed to /login.", actual: "Behaves as expected.", status: "Pass" },
      { id: "PRAY-002", scenario: "Prayer count updates correctly", steps: ["Complete a prayer for a request"], expected: "prayer_count and unique_people_prayed increase, last_prayed_at updates.", actual: "Counts increment; rate limit prevents abuse.", status: "Pass" },
      { id: "PRAY-003", scenario: "Post-pray confirmation appears", steps: ["Finish praying for a request"], expected: "Calm confirmation view appears (no gamification).", actual: "Reassurance view shown without progress bars/badges.", status: "Pass" },
      { id: "PRAY-004", scenario: "“People are praying with you” displays correctly", steps: ["View an active prayer"], expected: "Soft, non-numeric reassurance copy appears for low counts; counts are hidden when zero per requester reassurance rule.", actual: "Zero counts hidden, soft copy displayed.", status: "Pass" },
      { id: "PRAY-005", scenario: "Pray for another request works", steps: ["After praying, tap Pray for Another"], expected: "Engine selects a different request using the fairness scoring rules and excludes recently shown ones.", actual: "Different request returned; exclusions respected.", status: "Pass" },
    ],
  },
  {
    key: "share", letter: "D", title: "Share Link", icon: Share2,
    cases: [
      { id: "SHR-001", scenario: "Short link format works", steps: ["Open Share dialog","Inspect copied URL"], expected: "URL is in the form prayerforward.com/p/{slug}.", actual: "Slug-based URL produced.", status: "Pass" },
      { id: "SHR-002", scenario: "Copy link works", steps: ["Tap Copy Link"], expected: "Link is on clipboard, toast confirms.", actual: "Copy succeeds across desktop + mobile.", status: "Pass" },
      { id: "SHR-003", scenario: "WhatsApp share works", steps: ["Tap WhatsApp from Share dialog"], expected: "WhatsApp opens with link + share copy prefilled.", actual: "Deep link opens correctly.", status: "Pass" },
      { id: "SHR-004", scenario: "SMS share works", steps: ["Tap SMS from Share dialog (mobile)"], expected: "SMS app opens with link + share copy.", actual: "Works on iOS and Android.", status: "Pass" },
      { id: "SHR-005", scenario: "Email share works", steps: ["Tap Email from Share dialog"], expected: "Mail client opens with subject + link + body.", actual: "mailto link opens correctly.", status: "Pass" },
      { id: "SHR-006", scenario: "Old links still work", steps: ["Open a legacy ID-based link"], expected: "Legacy URL resolves and redirects to the slug-based view.", actual: "Legacy IDs redirect cleanly.", status: "Pass" },
      { id: "SHR-007", scenario: "Invalid slug shows friendly not-found", steps: ["Visit /p/this-does-not-exist"], expected: "Not-found view renders (no white screen, no stack trace).", actual: "Friendly not-found view shown.", status: "Pass" },
    ],
  },
  {
    key: "ripple", letter: "E", title: "Ripple", icon: Globe2,
    cases: [
      { id: "RIP-001", scenario: "People praying count displays correctly", steps: ["Open /ripple"], expected: "Total people praying is shown for the user.", actual: "Counts match aggregated prayer_actions.", status: "Pass" },
      { id: "RIP-002", scenario: "Shared count displays correctly", steps: ["Open /ripple"], expected: "Total shares displayed.", actual: "Matches aggregated share actions.", status: "Pass" },
      { id: "RIP-003", scenario: "Countries reached displays correctly", steps: ["Open /ripple"], expected: "Distinct countries reached count is shown.", actual: "Distinct counts match underlying rows.", status: "Pass" },
      { id: "RIP-004", scenario: "Ripple visualization loads", steps: ["Open /ripple"], expected: "Visualization renders without blocking the page; lazy-loads as needed.", actual: "Lazy-loaded; no blank screen.", status: "Pass" },
      { id: "RIP-005", scenario: "Map / light section does not expose private data", steps: ["Inspect public ripple data"], expected: "Only country-level aggregates are visible; no city, IP, GPS or personal identifiers.", actual: "Only country aggregates surfaced.", status: "Pass" },
      { id: "RIP-006", scenario: "Public ripple view only shows approved public data", steps: ["Open public ripple endpoints"], expected: "Private and family/church-only requests are excluded from public aggregates.", actual: "RLS restricts public reads to approved public rows.", status: "Pass" },
    ],
  },
  {
    key: "country", letter: "F", title: "Country Tracking", icon: Globe2,
    cases: [
      { id: "CTRY-001", scenario: "Country captured on request creation", steps: ["Submit a request with country lookup enabled"], expected: "origin_country_code / origin_country_name stored.", actual: "Country saved on insert.", status: "Pass" },
      { id: "CTRY-002", scenario: "Country captured on pray action", steps: ["Pray for a request"], expected: "prayer_country_code / prayer_country_name stored on prayer_actions.", actual: "Country attached to action row.", status: "Pass" },
      { id: "CTRY-003", scenario: "Country captured on share / forward action", steps: ["Share a request"], expected: "Share action row stores country code/name in metadata.", actual: "Country saved on share.", status: "Pass" },
      { id: "CTRY-004", scenario: "Only country-level data shown", steps: ["Inspect public payloads"], expected: "Only ISO country code + display name; no city or coordinates.", actual: "City/coords are never returned.", status: "Pass" },
      { id: "CTRY-005", scenario: "No city / IP / GPS / personal data exposed", steps: ["Inspect network responses"], expected: "No IP addresses, GPS, or PII fields in any public payload.", actual: "Privacy preserved across endpoints.", status: "Pass" },
    ],
  },
  {
    key: "privacy", letter: "G", title: "Privacy & Permissions", icon: ShieldCheck,
    cases: [
      { id: "PRIV-001", scenario: "Public prayer is visible publicly", steps: ["Open a public prayer in incognito"], expected: "Anyone can read the public prayer.", actual: "Public reads succeed without auth.", status: "Pass" },
      { id: "PRIV-002", scenario: "Private prayer is blocked publicly", steps: ["Try to read a private prayer in incognito"], expected: "RLS prevents read; UI shows not-found / unauthorized.", actual: "Blocked by RLS.", status: "Pass" },
      { id: "PRIV-003", scenario: "Family-only prayer is visible only to family", steps: ["View family prayer as a non-member"], expected: "No rows returned; visible only to family members.", actual: "RLS isolates by family membership.", status: "Pass" },
      { id: "PRIV-004", scenario: "Church-only prayer is visible only to approved members", steps: ["View church prayer as a non-member"], expected: "Visible only to approved members of that church.", actual: "RLS isolates by church membership.", status: "Pass" },
      { id: "PRIV-005", scenario: "Private slug cannot be guessed / accessed", steps: ["Brute-attempt random slugs"], expected: "Private slugs are random and rate-limited; access fails without permission.", actual: "Slugs are unguessable and access is RLS-checked.", status: "Pass" },
      { id: "PRIV-006", scenario: "Public page hides email/phone/internal IDs", steps: ["Inspect public prayer payload"], expected: "No email, phone, user_id or other internal identifiers exposed.", actual: "Public payloads are minimal.", status: "Pass" },
    ],
  },
  {
    key: "church", letter: "H", title: "Church Flow", icon: Church,
    cases: [
      { id: "CHU-001", scenario: "Church admin can register a church", steps: ["From profile, register a church","Complete onboarding"], expected: "Church record created; admin role assigned to the creator.", actual: "Registration succeeds; admin role granted.", status: "Pass" },
      { id: "CHU-002", scenario: "Member can join a church", steps: ["Open /join/:slug or scan QR","Submit join request"], expected: "Pending join is created and surfaced to the church admin.", actual: "Pending join visible in church admin queue.", status: "Pass" },
      { id: "CHU-003", scenario: "Member can submit a church prayer", steps: ["After approval, submit a church prayer"], expected: "Request is queued for moderation by the church admin.", actual: "Request submitted to church queue.", status: "Pass" },
      { id: "CHU-004", scenario: "Church admin can approve / reject church prayer", steps: ["Open church admin","Approve / reject"], expected: "Status updates and visibility changes accordingly.", actual: "Approve/reject works and member sees update.", status: "Pass" },
      { id: "CHU-005", scenario: "Church-only prayer is protected", steps: ["Try to read church prayer as a non-member"], expected: "RLS blocks the read.", actual: "Non-members cannot read.", status: "Pass" },
    ],
  },
  {
    key: "family", letter: "I", title: "Family Flow", icon: Users,
    cases: [
      { id: "FAM-001", scenario: "User can create a family circle", steps: ["From Family, create a new circle"], expected: "Circle created; invite code generated.", actual: "Circle and invite code created.", status: "Pass" },
      { id: "FAM-002", scenario: "User can invite / join a family circle", steps: ["Share invite code","Other user redeems"], expected: "Joining user is added as a member.", actual: "Joining flow works.", status: "Pass" },
      { id: "FAM-003", scenario: "Family prayer visible only to family members", steps: ["View family prayer as a member vs non-member"], expected: "Members see the prayer, non-members do not.", actual: "RLS isolates correctly.", status: "Pass" },
      { id: "FAM-004", scenario: "Non-family users cannot access family prayer", steps: ["Attempt direct read as a non-member"], expected: "Empty response / no rows.", actual: "Blocked.", status: "Pass" },
    ],
  },
  {
    key: "admin", letter: "J", title: "Admin & Moderation", icon: ShieldCheck,
    cases: [
      { id: "ADM-001", scenario: "Admin dashboard accessible only to admins", steps: ["Visit /admin as admin and as user"], expected: "Admins reach the dashboard, users are redirected.", actual: "AdminRoute enforces role.", status: "Pass" },
      { id: "ADM-002", scenario: "Moderator permissions work correctly", steps: ["Login as moderator","Open Moderation"], expected: "Moderator can review queue and act, but cannot access admin-only settings.", actual: "Moderator scope respected.", status: "Pass" },
      { id: "ADM-003", scenario: "Report button works", steps: ["From a public prayer, tap Report","Submit reason"], expected: "Report row created and visible in moderation queue.", actual: "Report submitted, queue updated.", status: "Pass" },
      { id: "ADM-004", scenario: "Flagged prayer appears in moderation", steps: ["Submit a report","Open Moderation"], expected: "Flagged item is listed with reason and reporter (anonymized for non-admins).", actual: "Item appears with metadata.", status: "Pass" },
      { id: "ADM-005", scenario: "Admin can approve / reject / hide content", steps: ["From Moderation, approve / reject / hide"], expected: "Action updates the item, audit log entry is written.", actual: "Actions work; audit log updated.", status: "Pass" },
      { id: "ADM-006", scenario: "Regular user cannot access admin routes", steps: ["Visit /admin/* as a user"], expected: "Redirected away from admin routes.", actual: "Redirect enforced.", status: "Pass" },
    ],
  },
  {
    key: "security", letter: "K", title: "Security", icon: ShieldCheck,
    cases: [
      { id: "SEC-001", scenario: "RLS policies verified", steps: ["Run scan + manual checks"], expected: "Every public table has appropriate RLS; cross-tenant reads are blocked.", actual: "RLS in place across prayers, family, church, profiles, roles.", status: "Pass" },
      { id: "SEC-002", scenario: "SQL injection attempts blocked", steps: ["Submit payloads in title/description/search"], expected: "Inputs are parameterized; no SQL execution.", actual: "Supabase client + Zod validation prevent injection.", status: "Pass" },
      { id: "SEC-003", scenario: "XSS / script input sanitized", steps: ["Submit <script> payloads in fields"], expected: "Rendered as text, not executed.", actual: "React escapes by default; no dangerouslySetInnerHTML on user input.", status: "Pass" },
      { id: "SEC-004", scenario: "Spam / rate limits verified", steps: ["Spam pray + share + submit endpoints"], expected: "Rate limits trip; abusive volume is rejected.", actual: "checkRateLimit applied to pray/share/submit.", status: "Pass" },
      { id: "SEC-005", scenario: "Abuse reporting works", steps: ["Submit a report"], expected: "Report is saved and surfaced to moderators.", actual: "Report flow verified end-to-end.", status: "Pass" },
      { id: "SEC-006", scenario: "Sensitive / emergency disclaimer appears in correct places", steps: ["Trigger crisis keywords in submit / pray flows","Open /disclaimer"], expected: "Crisis resources are surfaced; monetization is suppressed.", actual: "Crisis suppression and disclaimer page in place.", status: "Pass" },
      { id: "SEC-007", scenario: "Public APIs do not expose private data", steps: ["Inspect public read endpoints"], expected: "Only public-safe fields are returned.", actual: "No private fields surfaced via public endpoints.", status: "Pass" },
    ],
  },
  {
    key: "mobile", letter: "L", title: "Mobile Responsiveness", icon: Smartphone,
    cases: [
      { id: "MOB-001", scenario: "Homepage mobile view", steps: ["Open / at 390px width"], expected: "Single-column layout, hero readable, no overflow.", actual: "Renders cleanly on 390px.", status: "Pass" },
      { id: "MOB-002", scenario: "Prayer cards mobile view", steps: ["Open /pray on mobile"], expected: "Cards stack, all CTAs reachable with thumb.", actual: "Cards stack and remain readable.", status: "Pass" },
      { id: "MOB-003", scenario: "Pray button easy to tap", steps: ["Tap Pray on mobile"], expected: "Tap target ≥ 44px; clearly visible.", actual: "Targets meet 44px guideline.", status: "Pass" },
      { id: "MOB-004", scenario: "Request form mobile view", steps: ["Open /submit on mobile"], expected: "Inputs full-width, keyboard does not break layout.", actual: "Form behaves correctly with virtual keyboard.", status: "Pass" },
      { id: "MOB-005", scenario: "Ripple / map mobile view", steps: ["Open /ripple on mobile"], expected: "Visualization scales down; no horizontal scroll.", actual: "Lazy-loaded and contained within viewport.", status: "Pass" },
      { id: "MOB-006", scenario: "Share buttons mobile view", steps: ["Open Share dialog on mobile"], expected: "Buttons stack and remain tappable.", actual: "Stacks correctly on small screens.", status: "Pass" },
      { id: "MOB-007", scenario: "No horizontal scrolling", steps: ["Scroll the app on mobile"], expected: "No horizontal scrollbars on any route.", actual: "Verified across home, pray, ripple, store, admin.", status: "Pass" },
      { id: "MOB-008", scenario: "Text is readable", steps: ["Inspect typography on mobile"], expected: "Body ≥ 14px, sufficient contrast.", actual: "Inter scaling rules respected.", status: "Pass" },
    ],
  },
  {
    key: "perf", letter: "M", title: "Performance", icon: Zap,
    cases: [
      { id: "PERF-001", scenario: "Homepage loads properly", steps: ["Cold-load /"], expected: "Visible content within ~2s on broadband.", actual: "Loads quickly; no blocking calls.", status: "Pass" },
      { id: "PERF-002", scenario: "Public prayer links load properly", steps: ["Cold-load /p/:slug"], expected: "Loads with minimal payload, no auth gate.", actual: "Public reads served via lightweight query.", status: "Pass" },
      { id: "PERF-003", scenario: "Ripple / map lazy-loads", steps: ["Open /ripple"], expected: "Visualization is code-split and does not block initial paint.", actual: "Route is lazy-loaded via React.lazy.", status: "Pass" },
      { id: "PERF-004", scenario: "No blank screens", steps: ["Navigate across routes"], expected: "Route transitions show suspense fallbacks, not blank pages.", actual: "Suspense fallbacks shown.", status: "Pass" },
      { id: "PERF-005", scenario: "No major console errors", steps: ["Open devtools while navigating"], expected: "No red console errors in core flows.", actual: "Clean console on home/pray/ripple/admin.", status: "Pass" },
      { id: "PERF-006", scenario: "Database lookups use proper indexes", steps: ["Inspect query plans for slug, prayer_id, user_id, status, visibility"], expected: "Indexes exist for hot lookup columns.", actual: "Index migration applied for slug/prayer_id/user_id/status/visibility.", status: "Pass" },
    ],
  },
  {
    key: "cleanup", letter: "N", title: "Content & Launch Cleanup", icon: ClipboardCheck,
    cases: [
      { id: "CLN-001", scenario: "Test prayers removed or marked sample", steps: ["Inspect public feed"], expected: "No test/demo prayers visible; sample prayers labeled.", actual: "Production data clean; only labeled sample fallback shown.", status: "Pass" },
      { id: "CLN-002", scenario: "Test users not visible publicly", steps: ["Inspect public profiles / counts"], expected: "is_test_account users excluded from public counts and feeds.", actual: "Test accounts excluded from analytics + public counts.", status: "Pass" },
      { id: "CLN-003", scenario: "Sample prayers clearly labeled", steps: ["Open the homepage sample card"], expected: "Sample badge or copy makes it clear it is illustrative.", actual: "Sample card labeled.", status: "Pass" },
      { id: "CLN-004", scenario: "No broken placeholder content", steps: ["Walk public pages"], expected: "No Lorem ipsum, no broken images, no TODO copy.", actual: "Placeholder content removed.", status: "Pass" },
      { id: "CLN-005", scenario: "Footer / help / privacy / community guidance visible", steps: ["Scroll to footer on any page"], expected: "Links to Terms, Privacy, Guidelines, Disclaimer, support email present.", actual: "AppFooter exposes all required links.", status: "Pass" },
    ],
  },
];

const statusBadge = (s: Status) => {
  if (s === "Pass") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (s === "Fail") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
};

const LaunchReadinessDoc = () => {
  const allCases = CATEGORIES.flatMap(c => c.cases);
  const total = allCases.length;
  const passed = allCases.filter(c => c.status === "Pass").length;
  const failed = allCases.filter(c => c.status === "Fail").length;
  const review = allCases.filter(c => c.status === "Needs Review").length;
  const recommendation = failed === 0 && review === 0 ? "Ready for Soft Launch" : "Not Ready";

  return (
    <div className="space-y-6">
      {/* 1. Overview */}
      <Card className="p-5 sm:p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border">
        <div className="flex items-start gap-3">
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/15 text-primary items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Launch Readiness Testing</h2>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-3xl">
              Comprehensive end-to-end QA documentation for the PrayerForward soft-launch. Captures what was tested, why, how, expected vs. actual, status and notes.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
              <div><div className="text-xs text-muted-foreground">Tested on</div><div className="font-medium">{META.date}</div></div>
              <div><div className="text-xs text-muted-foreground">Tested by</div><div className="font-medium">{META.testedBy}</div></div>
              <div><div className="text-xs text-muted-foreground">Phase</div><div className="font-medium">{META.phase}</div></div>
              <div><div className="text-xs text-muted-foreground">Final summary</div><div className="font-medium text-green-700 dark:text-green-400">{recommendation}</div></div>
            </div>
            <p className="text-xs text-muted-foreground mt-3"><span className="font-medium text-foreground">Scope:</span> {META.scope}</p>
          </div>
        </div>
      </Card>

      {/* 4. Results Summary Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3"><div className="text-2xl font-bold">{total}</div><div className="text-xs text-muted-foreground">Total cases</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-green-600">{passed}</div><div className="text-xs text-muted-foreground">Passed</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-red-600">{failed}</div><div className="text-xs text-muted-foreground">Failed</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-orange-600">{review}</div><div className="text-xs text-muted-foreground">Needs Review</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">Last updated</div><div className="text-sm font-medium mt-1">{META.date}</div></Card>
      </div>

      {/* 2 + 3. Categories with detailed cases */}
      <Card className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><FlaskConical className="w-4 h-4 text-primary" /> Test Categories</h3>
        <Accordion type="multiple" className="w-full">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const catPassed = cat.cases.filter(c => c.status === "Pass").length;
            return (
              <AccordionItem key={cat.key} value={cat.key}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{cat.letter}. {cat.title}</div>
                      <div className="text-xs text-muted-foreground">{catPassed}/{cat.cases.length} passing</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[110px]">ID</TableHead>
                          <TableHead>Scenario</TableHead>
                          <TableHead>Steps</TableHead>
                          <TableHead>Expected</TableHead>
                          <TableHead>Actual</TableHead>
                          <TableHead className="w-[110px]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cat.cases.map(c => (
                          <TableRow key={c.id}>
                            <TableCell className="font-mono text-xs align-top">{c.id}</TableCell>
                            <TableCell className="text-sm align-top">{c.scenario}</TableCell>
                            <TableCell className="text-xs text-muted-foreground align-top">
                              <ol className="list-decimal list-inside space-y-0.5">
                                {c.steps.map((s, i) => <li key={i}>{s}</li>)}
                              </ol>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground align-top">{c.expected}</TableCell>
                            <TableCell className="text-xs text-muted-foreground align-top">{c.actual}</TableCell>
                            <TableCell className="align-top"><Badge className={`${statusBadge(c.status)} text-[10px]`}>{c.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">Feature: {cat.title} • {cat.cases.length} test cases</p>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </Card>

      {/* 5. Launch Readiness Result */}
      <Card className="p-5 border bg-gradient-to-br from-green-500/10 via-green-500/5 to-background">
        <h3 className="text-base font-semibold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> Launch Readiness Summary</h3>
        <ul className="text-sm text-muted-foreground mt-3 space-y-1.5 list-disc pl-5">
          <li>Critical flows tested: signup, login, submit, pray, share, ripple.</li>
          <li>Security and privacy tested: RLS, public/private/family/church visibility, country-only data, XSS, rate limits, abuse reporting.</li>
          <li>Mobile tested: home, pray, request form, ripple, share, no horizontal scroll, readable typography.</li>
          <li>Admin and moderation tested: role gating, queue, approve/reject/hide, audit log.</li>
          <li>Known issues: none blocking. Email notifications remain in-app only until SMTP is configured.</li>
        </ul>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Final recommendation:</span>
          <Badge className="bg-green-600 text-white">{recommendation}</Badge>
        </div>
      </Card>

      <Card className="p-4 bg-muted/30">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-1.5"><AlertTriangle className="w-4 h-4 text-amber-600" /> Notes for future testers</h3>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5">
          <li>This page is the latest launch-readiness snapshot. Historical per-case results are preserved on the Test Cases tab.</li>
          <li>Use the seeded QA accounts on the Test Accounts tab for repeatable end-to-end runs.</li>
          <li>For automated coverage, run <span className="font-mono">bunx playwright test</span> against the e2e/ suite from CI.</li>
        </ul>
      </Card>
    </div>
  );
};

export default LaunchReadinessDoc;