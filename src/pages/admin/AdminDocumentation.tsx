import { useState, useMemo } from "react";
import { Search, Filter, ChevronDown, ChevronRight, FileText, Clock, Shield, User, Eye, Printer, ExternalLink, Image, BookOpen, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DocStatus = "active" | "draft" | "needs_review" | "updated";
type AccessRole = "guest" | "user" | "moderator" | "admin";

interface DocSection {
  id: string;
  module: string;
  title: string;
  status: DocStatus;
  version: string;
  lastUpdated: string;
  accessRoles: AccessRole[];
  purpose: string;
  features: string[];
  userFlow: string[];
  adminFlow?: string[];
  dataInputsOutputs: string[];
  scenarios: { label: string; description: string }[];
  rules: string[];
  dependencies: string[];
  commonIssues: string[];
  screenshotPlaceholders: string[];
  technicalNotes: string[];
  changelog: { title: string; description: string; updatedBy: string; date: string; version: string }[];
}

const STATUS_COLORS: Record<DocStatus, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  needs_review: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  updated: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const DOCS: DocSection[] = [
  {
    id: "auth",
    module: "Authentication",
    title: "Authentication & Access Control",
    status: "active",
    version: "1.2",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["guest", "user", "moderator", "admin"],
    purpose: "Handles user registration, login, password recovery, email verification, and session management. Ensures only authorized users access protected features.",
    features: [
      "Email + password signup with strength meter",
      "Email + password login",
      "Google OAuth social login",
      "Forgot password / reset password flow",
      "Email verification (users must verify before login)",
      "Session persistence via localStorage",
      "Auto-refresh token management",
      "Protected route wrapper (ProtectedRoute)",
      "Admin route wrapper (AdminRoute) with role verification",
      "Auth callback handler for OAuth redirects",
    ],
    userFlow: [
      "User visits /signup → fills email, password, display name",
      "Password strength meter validates input in real-time",
      "On submit → account created → verification email sent",
      "User clicks verification link → redirected to /auth/callback",
      "User can now login via /login with email+password or Google",
      "Session stored; auto-refresh keeps user logged in",
      "Protected routes redirect unauthenticated users to /login",
    ],
    adminFlow: [
      "AdminRoute checks user_roles table for 'admin' role",
      "If not admin → redirected to home page",
      "Loading state shown while verifying access",
    ],
    dataInputsOutputs: [
      "Input: email, password, display_name (signup); email, password (login)",
      "Output: Supabase auth session with JWT token",
      "Profile auto-created via handle_new_user() trigger on signup",
      "Session persisted in localStorage, auto-refreshed",
    ],
    scenarios: [
      { label: "Happy path", description: "User signs up → verifies email → logs in → accesses protected routes" },
      { label: "Invalid credentials", description: "Wrong email/password → error toast shown, no redirect" },
      { label: "Unverified email", description: "User tries to login before verifying → blocked with message" },
      { label: "Password reset", description: "User clicks 'Forgot password' → receives reset email → sets new password via /reset-password" },
      { label: "OAuth login", description: "User clicks 'Sign in with Google' → redirected to Google → callback processes session" },
      { label: "Unauthorized admin access", description: "Non-admin user navigates to /admin → redirected to /" },
      { label: "Session expiry", description: "Token expires → auto-refresh attempts → if fails, user redirected to login" },
    ],
    rules: [
      "Email must be valid format",
      "Password must meet strength requirements",
      "Email verification required before login (auto-confirm disabled)",
      "Anonymous signups are never used",
      "Google OAuth is the only social provider",
      "Admin role checked via has_role() security definer function",
      "Test accounts can be disabled (cannot login)",
    ],
    dependencies: ["profiles table (auto-created on signup)", "user_roles table (for admin/moderator checks)", "Supabase Auth"],
    commonIssues: [
      "User not receiving verification email → check spam folder",
      "OAuth redirect issues → ensure callback URL configured",
      "Session not persisting → check localStorage availability",
    ],
    screenshotPlaceholders: ["Login page", "Signup page with password strength meter", "Forgot password page", "Reset password page", "Auth callback loading state"],
    technicalNotes: [
      "Auth provider: src/hooks/useAuth.tsx wraps Supabase auth",
      "Protected routes: src/components/ProtectedRoute.tsx",
      "Admin routes: src/components/AdminRoute.tsx + src/hooks/useAdminRole.ts",
      "Profile trigger: handle_new_user() creates profile row on signup",
      "Password validation: src/components/PasswordStrengthMeter.tsx + src/lib/validation.ts",
    ],
    changelog: [
      { title: "Added Google OAuth", description: "Integrated Google social login alongside email/password", updatedBy: "System", date: "2026-04-10", version: "1.2" },
      { title: "Initial auth system", description: "Email/password signup, login, password reset, protected routes", updatedBy: "System", date: "2026-03-15", version: "1.0" },
    ],
  },
  {
    id: "pray",
    module: "PRAY",
    title: "Pray for Others",
    status: "active",
    version: "2.0",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["guest", "user"],
    purpose: "The core spiritual engagement feature. Users browse open prayer requests from the global feed and pray for others, building a chain of prayer support across the community.",
    features: [
      "Unified prayer feed from global_prayers_public view",
      "Prayer cards with title, description, category, and country",
      "Pray button with prayer count tracking",
      "Prayer session experience with scripture encouragement",
      "Pass-it-forward dialog to share prayers with others",
      "Prayer ripple chain visualization",
      "Anonymous prayer support (author hidden)",
      "Country display toggle per prayer",
      "Prayer coverage tracking (current vs target prayers)",
      "Daily prayer focus suggestions",
      "Test account prayers hidden from public feed",
    ],
    userFlow: [
      "User navigates to /pray",
      "Prayer feed loads from unified_prayer_feed view",
      "User browses prayer cards with category filters",
      "User clicks 'Pray' on a card → prayer session opens",
      "Prayer session shows scripture encouragement",
      "After praying → prayer count incremented via record_prayer_action RPC",
      "Optional: user can 'Pass it Forward' to share the prayer",
      "Prayer coverage updates (unique people prayed, total count)",
    ],
    dataInputsOutputs: [
      "Input: user click on 'Pray' button",
      "Output: prayer_actions record created, prayer_coverage updated",
      "Output: prayer_count on global_prayer_requests incremented",
      "Output: app_events log entry created",
      "Display: prayer cards from unified_prayer_feed view",
    ],
    scenarios: [
      { label: "Happy path", description: "User opens /pray → selects a prayer → completes prayer session → count updates" },
      { label: "Anonymous prayer", description: "Prayer marked anonymous → no author name/ID shown in feed" },
      { label: "Empty state", description: "No open prayers available → encouraging message displayed" },
      { label: "Guest viewing", description: "Unauthenticated visitor can see prayers via public view but cannot interact" },
      { label: "Duplicate prevention", description: "User prays for same request → unique_people_prayed calculated via DISTINCT" },
      { label: "Pass it forward", description: "After praying → dialog offers sharing via link/QR → invite created" },
    ],
    rules: [
      "Only 'open' and 'public' visibility prayers appear in feed",
      "Test account prayers are excluded from public views",
      "Anonymous prayers mask the created_by field (NULL in view)",
      "Prayer actions recorded via security definer RPC (no direct insert on prayer_actions)",
      "Coverage tracking: target default is 3 prayers per request",
      "Country shown only if show_country = true",
    ],
    dependencies: ["global_prayer_requests", "prayer_actions", "prayer_coverage", "unified_prayer_feed view", "profiles (for test account filtering)"],
    commonIssues: [
      "Prayer count not updating → check RPC function execution",
      "Anonymous prayers showing author → verify view masking logic",
      "Test prayers appearing in feed → check is_test_account filter in view",
    ],
    screenshotPlaceholders: ["Prayer feed page", "Prayer card detail", "Prayer session experience", "Pass-it-forward dialog", "Empty state"],
    technicalNotes: [
      "Feed source: unified_prayer_feed (security definer view)",
      "Prayer recording: record_prayer_action() RPC function",
      "Components: PrayerCard, PrayerSession, PassItForwardDialog, ScriptureEncouragement",
      "Page: src/pages/PrayForOthers.tsx",
      "Service hook: src/hooks/usePrayerService.ts",
    ],
    changelog: [
      { title: "Security hardening", description: "Switched to security definer views, removed public raw table access", updatedBy: "System", date: "2026-04-13", version: "2.0" },
      { title: "Test account filtering", description: "Added is_test_account exclusion to public views", updatedBy: "System", date: "2026-04-12", version: "1.5" },
      { title: "Initial prayer feed", description: "Basic prayer browsing and praying functionality", updatedBy: "System", date: "2026-03-15", version: "1.0" },
    ],
  },
  {
    id: "request",
    module: "Request",
    title: "Prayer Request Submission",
    status: "active",
    version: "1.3",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["guest", "user"],
    purpose: "Allows users to submit prayer requests that appear in the global prayer feed for others to pray over. Supports anonymous submissions and country display options.",
    features: [
      "Prayer request form with title, description, category",
      "Anonymous submission toggle",
      "Country selection with show_country option",
      "Content moderation via moderate-content edge function",
      "Auto-moderation based on automation rules",
      "Request status tracking (open, answered)",
      "Validation (required fields, character limits)",
    ],
    userFlow: [
      "User navigates to /submit-prayer",
      "Fills in title, description, selects category",
      "Optionally toggles anonymous and show_country",
      "Submits → content moderation edge function called",
      "If approved → request saved with status 'open'",
      "If flagged → enters moderation queue for admin review",
      "Prayer coverage record auto-created via trigger",
      "Request appears in unified prayer feed",
    ],
    adminFlow: [
      "Flagged requests appear in Admin → Moderation queue",
      "Admin can approve, reject, or add notes",
      "Rejection requires a reason",
      "All actions logged to admin_audit_log",
    ],
    dataInputsOutputs: [
      "Input: title (required), description (required), category, anonymous flag, country, show_country",
      "Output: global_prayer_requests row created",
      "Output: prayer_coverage row auto-created via trigger",
      "Output: app_events log entry",
      "Output: moderation_queue entry if flagged",
    ],
    scenarios: [
      { label: "Happy path", description: "User submits valid prayer → passes moderation → appears in feed" },
      { label: "Validation error", description: "Missing title/description → form shows inline errors, prevents submit" },
      { label: "Content flagged", description: "Inappropriate content detected → sent to moderation queue → not visible until approved" },
      { label: "Anonymous request", description: "User checks anonymous → author ID masked in public views" },
      { label: "Answered prayer", description: "Creator marks prayer as answered → status changes, may show in answered section" },
    ],
    rules: [
      "Title and description are required",
      "Category defaults to 'general'",
      "Visibility defaults to 'public'",
      "Status defaults to 'open'",
      "created_by must match authenticated user ID (RLS enforced)",
      "Content moderation runs before saving",
      "Anonymous prayers: created_by stored but masked in views",
    ],
    dependencies: ["global_prayer_requests", "prayer_coverage", "moderation_queue", "moderate-content edge function", "automation_rules"],
    commonIssues: [
      "Request not appearing → check if flagged in moderation queue",
      "Moderation edge function timeout → request may need manual review",
    ],
    screenshotPlaceholders: ["Submit prayer form", "Category selection", "Anonymous toggle", "Success state", "Validation errors"],
    technicalNotes: [
      "Page: src/pages/SubmitPrayer.tsx",
      "Edge function: supabase/functions/moderate-content/index.ts",
      "Trigger: handle_new_global_prayer() creates coverage record",
      "Hook: src/hooks/useContentModeration.ts",
    ],
    changelog: [
      { title: "Content moderation", description: "Added AI-based content moderation via edge function", updatedBy: "System", date: "2026-04-05", version: "1.3" },
      { title: "Initial submission form", description: "Basic prayer request creation with categories", updatedBy: "System", date: "2026-03-15", version: "1.0" },
    ],
  },
  {
    id: "churches",
    module: "Churches",
    title: "Church Community",
    status: "active",
    version: "1.4",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["guest", "user", "moderator", "admin"],
    purpose: "Enables church communities to register, manage members, and maintain private or public prayer walls. Churches can have their own prayer ecosystem within PrayerForward.",
    features: [
      "Church discovery and listing page",
      "Church registration form",
      "Public and private church privacy settings",
      "Church prayer wall with member submissions",
      "Church admin panel for managing members and prayers",
      "Church membership (join/leave)",
      "Invite links with unique slugs (/join/:slug)",
      "Church-specific prayer request moderation",
      "Role-based access: admin, moderator, member",
      "Church detail page with info and stats",
      "Public view (churches_public) filters sensitive data",
    ],
    userFlow: [
      "User browses /churches → sees active churches",
      "User clicks a church → views detail page",
      "User joins a church (assigned 'member' role enforced by RLS)",
      "Member can submit prayers to church prayer wall",
      "Church prayer requests go through approval flow",
      "Church admins manage members and review prayers",
    ],
    adminFlow: [
      "Platform admin can view all churches in Admin → Churches",
      "Can search, filter, verify churches",
      "Church admin (not platform admin) manages church-level settings",
      "Church moderators can approve/reject church prayer requests",
    ],
    dataInputsOutputs: [
      "Input: church name, denomination, contact email, country, city, state, privacy, website",
      "Output: churches row, church_memberships row (creator as admin)",
      "Output: slug auto-generated for invite links",
      "Display: churches_public view (security definer, masks sensitive data)",
    ],
    scenarios: [
      { label: "Happy path", description: "User registers church → becomes admin → invites members → members submit prayers → admin approves" },
      { label: "Join via link", description: "User visits /join/:slug → auto-joined as member" },
      { label: "Private church", description: "Privacy set to 'private' → only members see prayer wall" },
      { label: "Unauthorized admin", description: "Non-admin member tries church admin actions → blocked by RLS" },
      { label: "Role escalation prevention", description: "New members forced to 'member' role by RLS WITH CHECK constraint" },
    ],
    rules: [
      "New members always assigned 'member' role (security constraint)",
      "Church admins can update church details and manage members",
      "Church moderators can approve/reject prayer requests",
      "Public churches: approved prayers visible to visitors",
      "Private churches: prayers visible only to members",
      "Slug must be unique for invite links",
      "get_church_role() and is_church_member() are security definer functions",
    ],
    dependencies: ["churches", "church_memberships", "church_prayer_requests", "churches_public view", "profiles"],
    commonIssues: [
      "Slug conflict → ensure unique slug generation",
      "Member not seeing prayers → check membership status is 'active'",
      "Church not appearing → check status is 'active'",
    ],
    screenshotPlaceholders: ["Churches listing page", "Church detail page", "Church prayer wall", "Church admin panel", "Join via invite link", "Register church form"],
    technicalNotes: [
      "Pages: Churches.tsx, ChurchDetail.tsx, ChurchPrayerWall.tsx, ChurchSubmitPrayer.tsx, ChurchAdmin.tsx, RegisterChurch.tsx, ChurchJoin.tsx",
      "Hooks: useChurch.ts, useChurchBySlug.ts, useAutoJoinChurch.ts",
      "Security functions: get_church_role(), is_church_member()",
      "View: churches_public (security definer)",
      "Slugify: src/lib/slugify.ts",
    ],
    changelog: [
      { title: "Public view security", description: "churches_public view now security definer, masks sensitive fields", updatedBy: "System", date: "2026-04-13", version: "1.4" },
      { title: "Invite links", description: "Added /join/:slug for easy church invitations", updatedBy: "System", date: "2026-04-01", version: "1.2" },
      { title: "Initial churches", description: "Church registration, listing, prayer wall", updatedBy: "System", date: "2026-03-20", version: "1.0" },
    ],
  },
  {
    id: "ripple",
    module: "Ripple",
    title: "Ripple Impact & Prayer Chains",
    status: "active",
    version: "1.1",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["user"],
    purpose: "Visualizes the impact of prayer by showing how prayers ripple through the community. Tracks prayer chains, coverage, and the network effect of shared prayers.",
    features: [
      "Ripple impact dashboard with stats",
      "Prayer chain visualization",
      "Coverage tracking (prayers offered, received, chains started)",
      "Pass-it-forward sharing with invite links",
      "QR code generation for prayer sharing",
      "User prayer statistics (total prayers offered, received, chains)",
      "Prayer invite tracking (clicks, signups)",
    ],
    userFlow: [
      "User navigates to /ripple (protected)",
      "Dashboard shows personal prayer stats",
      "User sees prayers offered, received, chains started",
      "Prayer chain detail shows depth and participants",
      "User can share prayers via generated invite links",
      "Invite link tracks clicks and signups",
    ],
    dataInputsOutputs: [
      "Input: prayer sharing action",
      "Output: prayer_invites row with unique invite_code",
      "Output: prayer_chain_nodes tracking depth/parent",
      "Output: prayer_coverage updates (passed_forward_count)",
      "Display: user_prayer_stats aggregated data",
    ],
    scenarios: [
      { label: "Happy path", description: "User prays → shares → friend clicks link → signs up → prays → chain grows" },
      { label: "QR code share", description: "User generates QR code → friend scans → lands on invite page" },
      { label: "Chain visualization", description: "Multiple users pray and share → chain depth increases" },
      { label: "Empty state", description: "New user with no activity → encouraging message to start praying" },
    ],
    rules: [
      "Only authenticated users can view ripple dashboard",
      "Prayer chains tracked via prayer_chain_nodes with depth_level",
      "Invite codes must be unique",
      "Click counts tracked via increment_invite_click() RPC",
      "Coverage passed_forward_count updated on share action",
    ],
    dependencies: ["prayer_chain_nodes", "prayer_coverage", "prayer_invites", "user_prayer_stats", "prayer_actions"],
    commonIssues: [
      "Chain not showing → verify prayer_chain_nodes has correct parent_user_id",
      "Stats not updating → check user_prayer_stats row exists",
    ],
    screenshotPlaceholders: ["Ripple dashboard", "Prayer chain visualization", "Invite link generation", "QR code display"],
    technicalNotes: [
      "Page: src/pages/RippleImpact.tsx",
      "Components: PrayerRippleChain.tsx, PrayerChainsDetail.tsx, PrayersOfferedDetail.tsx, PrayersReceivedDetail.tsx",
      "Invite handling: InviteLanding.tsx + get_invite_by_code() RPC",
      "QR: qrcode.react library",
    ],
    changelog: [
      { title: "Invite tracking", description: "Added click_count and signup_count tracking for invites", updatedBy: "System", date: "2026-04-08", version: "1.1" },
      { title: "Initial ripple", description: "Prayer chain visualization and stats dashboard", updatedBy: "System", date: "2026-03-25", version: "1.0" },
    ],
  },
  {
    id: "support",
    module: "Support",
    title: "Support the Mission",
    status: "active",
    version: "1.0",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["guest", "user"],
    purpose: "Provides ways for users to support the PrayerForward mission through donations and engagement. Integrates with Stripe for payment processing.",
    features: [
      "Support/donation page",
      "Stripe checkout integration via edge function",
      "Multiple support tiers/amounts",
      "Success/failure handling",
    ],
    userFlow: [
      "User visits /support",
      "Selects support amount or tier",
      "Redirected to Stripe checkout",
      "On success → confirmation shown",
      "On failure → error message displayed",
    ],
    dataInputsOutputs: [
      "Input: donation amount selection",
      "Output: Stripe checkout session created via create-support-checkout edge function",
      "Output: app_events log entry",
    ],
    scenarios: [
      { label: "Happy path", description: "User selects amount → completes Stripe checkout → success page" },
      { label: "Payment failure", description: "Card declined → Stripe shows error → user can retry" },
      { label: "Cancelled checkout", description: "User closes Stripe modal → returned to support page" },
    ],
    rules: [
      "Stripe secret key stored as edge function secret",
      "Checkout session created server-side via edge function",
      "No payment data stored in app database",
    ],
    dependencies: ["Stripe", "create-support-checkout edge function"],
    commonIssues: ["Stripe key not configured → checkout fails", "Edge function timeout → retry logic needed"],
    screenshotPlaceholders: ["Support page", "Stripe checkout", "Success confirmation"],
    technicalNotes: [
      "Page: src/pages/SupportMission.tsx",
      "Edge function: supabase/functions/create-support-checkout/index.ts",
      "Secret: STRIPE_SECRET_KEY",
    ],
    changelog: [
      { title: "Initial support page", description: "Stripe checkout integration for donations", updatedBy: "System", date: "2026-03-20", version: "1.0" },
    ],
  },
  {
    id: "store",
    module: "Store",
    title: "Merchandise Store",
    status: "active",
    version: "1.1",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["guest", "user"],
    purpose: "An e-commerce storefront selling PrayerForward merchandise. Revenue supports the mission. Integrates with Gelato for print-on-demand fulfillment.",
    features: [
      "Product listing with categories and filters",
      "Product detail pages",
      "Shopping cart (Zustand state management)",
      "Cart drawer UI",
      "Cart sync across sessions",
      "Gelato product proxy for real-time inventory",
      "Store sub-navigation (Shop All, New, Apparel)",
      "Store information pages (About, Terms, Privacy, Shipping, Returns, FAQ, Contact)",
      "Order tracking page",
      "Store-specific layout and footer",
      "Cart icon visible only on store routes",
    ],
    userFlow: [
      "User browses /store → sees product grid",
      "Can filter by category or collection",
      "Clicks product → views detail page with images/description",
      "Adds to cart → cart drawer shows",
      "Proceeds to checkout (external or internal)",
      "Can track orders via /store/order-tracking",
    ],
    dataInputsOutputs: [
      "Input: product selection, quantity",
      "Output: cart state in Zustand store (persisted via localStorage)",
      "External: Gelato API for product data via gelato-proxy edge function",
    ],
    scenarios: [
      { label: "Happy path", description: "User browses → adds to cart → checks out" },
      { label: "Empty cart", description: "No items → empty cart message shown" },
      { label: "Product not found", description: "Invalid product handle → 404 or error state" },
      { label: "Gelato API down", description: "Proxy fails → fallback to static product data" },
    ],
    rules: [
      "Cart icon only shows on store-related routes (/store, /product, /cart, /checkout)",
      "Store sub-nav only on store routes",
      "Products can come from Gelato API or static data",
      "Cart persisted via localStorage + Zustand",
    ],
    dependencies: ["Gelato API", "gelato-proxy edge function", "cartStore (Zustand)", "static product data"],
    commonIssues: [
      "Gelato API key not set → products fail to load",
      "Cart not syncing → check useCartSync hook and localStorage",
    ],
    screenshotPlaceholders: ["Store listing page", "Product detail page", "Cart drawer", "Store sub-navigation"],
    technicalNotes: [
      "Pages: Store.tsx, ProductDetail.tsx, store/*.tsx (info pages)",
      "State: src/stores/cartStore.ts (Zustand)",
      "Hook: useCartSync.ts, useGelatoProducts.ts",
      "Edge function: gelato-proxy",
      "Layout: StoreLayout.tsx, StoreHeader.tsx, StoreFooter.tsx",
      "Data: src/data/products.ts (static fallback)",
      "Secrets: GELATO_API_KEY",
    ],
    changelog: [
      { title: "Gelato integration", description: "Added print-on-demand product fetching via Gelato proxy", updatedBy: "System", date: "2026-04-05", version: "1.1" },
      { title: "Initial store", description: "Product listing, detail pages, cart, store info pages", updatedBy: "System", date: "2026-03-25", version: "1.0" },
    ],
  },
  {
    id: "calendar",
    module: "Calendar",
    title: "Prayer Calendar",
    status: "active",
    version: "1.0",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["user"],
    purpose: "Provides a calendar view for tracking prayer commitments and reminders over time. Helps users maintain consistent prayer habits.",
    features: [
      "Calendar view of prayer reminders",
      "Daily prayer log tracking",
      "Reminder time settings per prayer",
      "Timezone-aware reminders",
      "Completion tracking per day",
    ],
    userFlow: [
      "User navigates to /calendar (protected)",
      "Calendar displays days with prayer reminders",
      "User can view which prayers are scheduled each day",
      "Can mark prayers as completed for the day",
      "Completion logged in prayer_reminder_daily_logs",
    ],
    dataInputsOutputs: [
      "Input: date selection, prayer completion toggle",
      "Output: prayer_reminder_daily_logs row",
      "Display: prayer_reminders with daily completion status",
    ],
    scenarios: [
      { label: "Happy path", description: "User views calendar → sees reminders → marks prayers complete" },
      { label: "No reminders", description: "Empty calendar → message to set up prayer reminders" },
      { label: "Past dates", description: "Can view historical completion data" },
    ],
    rules: [
      "Authenticated users only",
      "Reminders are per-user (RLS enforced)",
      "Daily logs use date_local string for timezone consistency",
      "Users can only see/modify their own reminders and logs",
    ],
    dependencies: ["prayer_reminders", "prayer_reminder_daily_logs"],
    commonIssues: ["Timezone mismatch → verify timezone field matches user's locale"],
    screenshotPlaceholders: ["Calendar view", "Day detail with reminders", "Empty state"],
    technicalNotes: [
      "Page: src/pages/PrayerCalendar.tsx",
      "Hooks: usePrayerReminders.ts, useReminderNotifications.ts",
      "Component: PrayerReminderToggle.tsx",
    ],
    changelog: [
      { title: "Initial calendar", description: "Prayer calendar with reminder tracking", updatedBy: "System", date: "2026-03-28", version: "1.0" },
    ],
  },
  {
    id: "family",
    module: "Family",
    title: "Family Prayer Groups",
    status: "active",
    version: "1.0",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["user"],
    purpose: "Enables families to create private prayer groups with shared prayer requests, scriptures, notes, and reminders. Invite-only access ensures privacy.",
    features: [
      "Create family groups",
      "Invite members via invite code",
      "Family prayer requests (create, view, track)",
      "Family prayer logs (mark prayed)",
      "Family shared scriptures",
      "Family notes",
      "Family reminders",
      "Member role management (admin, member)",
      "Privacy enforced via RLS",
    ],
    userFlow: [
      "User creates a family group → becomes admin",
      "Shares invite code with family members",
      "Members join using invite code → assigned 'member' role",
      "Members can submit prayer requests, share scriptures, add notes",
      "Family admin can manage members",
      "All family data is private to group members only",
    ],
    dataInputsOutputs: [
      "Input: group name, invite code, prayer requests, scriptures, notes",
      "Output: family_groups, family_members, family_prayer_requests, family_scriptures, family_notes rows",
      "Privacy: is_family_member() RLS checks on all family tables",
    ],
    scenarios: [
      { label: "Happy path", description: "User creates group → invites family → members pray together" },
      { label: "Invalid invite", description: "Wrong code → cannot join" },
      { label: "Non-member access", description: "Non-member tries to view family data → blocked by RLS" },
      { label: "Admin actions", description: "Family admin can update members, group details" },
    ],
    rules: [
      "New members assigned 'member' role",
      "is_family_member() security definer function checks membership",
      "All family tables use RLS with family membership check",
      "Only active members can access family data",
      "Family admins can manage member status",
    ],
    dependencies: ["family_groups", "family_members", "family_prayer_requests", "family_prayer_logs", "family_scriptures", "family_notes"],
    commonIssues: [
      "Member not seeing data → check status is 'active'",
      "Invite code collision → ensure unique generation",
    ],
    screenshotPlaceholders: ["Family groups list", "Family detail page", "Family prayer requests", "Family scriptures", "Family notes"],
    technicalNotes: [
      "Page: src/pages/FamilyRequests.tsx (redirects to Organizations for groups)",
      "Components: family/FamilyPrayerRequests.tsx, FamilyScriptures.tsx, FamilyNotes.tsx, FamilyReminders.tsx",
      "Security: is_family_member() function",
    ],
    changelog: [
      { title: "Initial family groups", description: "Private family prayer groups with shared content", updatedBy: "System", date: "2026-03-28", version: "1.0" },
    ],
  },
  {
    id: "scripture",
    module: "Scripture",
    title: "Scripture & Bible Reader",
    status: "active",
    version: "1.1",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["guest", "user"],
    purpose: "Provides scripture reading, daily verse cards, and AI-powered Bible analysis. Integrates spiritual content throughout the prayer experience.",
    features: [
      "Scripture page with Bible content",
      "Daily verse card on home page",
      "Bible reader with navigation",
      "AI-powered Bible analysis via edge function",
      "Scripture encouragement during prayer sessions",
      "Verse references in family scripture sharing",
    ],
    userFlow: [
      "User visits /scripture → browses Bible content",
      "Daily verse shown on home page",
      "User can request AI analysis of scripture passages",
      "Scripture encouragement shown during prayer sessions",
    ],
    dataInputsOutputs: [
      "Input: scripture reference/query for AI analysis",
      "Output: AI-generated analysis via bible-ai edge function",
      "Display: verse text, reference, daily verse cards",
    ],
    scenarios: [
      { label: "Happy path", description: "User reads scripture → requests AI analysis → receives insight" },
      { label: "AI unavailable", description: "Edge function fails → graceful error message" },
      { label: "Daily verse", description: "Home page shows rotating daily verse" },
    ],
    rules: [
      "Scripture content accessible to all (guest + authenticated)",
      "AI analysis uses Lovable AI Gateway (no user API key needed)",
      "Daily verse rotates based on date",
    ],
    dependencies: ["bible-ai edge function", "Lovable AI Gateway", "verse data (src/data/verses.ts, bible.ts)"],
    commonIssues: ["AI analysis timeout → retry or show cached response"],
    screenshotPlaceholders: ["Scripture page", "Bible reader", "AI analysis result", "Daily verse card"],
    technicalNotes: [
      "Pages: Scripture.tsx, BibleReader.tsx",
      "Edge function: supabase/functions/bible-ai/index.ts",
      "Components: DailyVerseCard.tsx, ScriptureEncouragement.tsx",
      "Data: src/data/verses.ts, src/data/bible.ts",
      "Secret: LOVABLE_API_KEY (for AI gateway)",
    ],
    changelog: [
      { title: "AI Bible analysis", description: "Added AI-powered scripture analysis via edge function", updatedBy: "System", date: "2026-04-01", version: "1.1" },
      { title: "Initial scripture", description: "Scripture reading, daily verse, Bible data", updatedBy: "System", date: "2026-03-20", version: "1.0" },
    ],
  },
  {
    id: "profile",
    module: "Profile",
    title: "User Profile & Activity",
    status: "active",
    version: "1.2",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["user"],
    purpose: "Central hub for user identity, activity history, settings, and account management. Contains profile details, activity dashboard, commitment settings, and admin access.",
    features: [
      "Profile page with display name, avatar",
      "Profile dropdown in navigation (Profile, My Activity, Settings, Admin, Sign Out)",
      "My Activity dashboard (/dashboard) with prayer history",
      "Settings / Commitments (/commitments) page",
      "Prayer reminders management (/prayer-reminders)",
      "Commitment level selector",
      "Test account badge (visible to admins)",
      "Admin link (visible only to admin users)",
    ],
    userFlow: [
      "User clicks profile avatar in navigation → dropdown appears",
      "Profile → opens /profile full page",
      "My Activity → opens /dashboard with activity history",
      "Settings → opens /commitments for prayer commitment settings",
      "Admin → opens /admin (visible only if admin role)",
      "Sign Out → logs out and redirects to home",
    ],
    dataInputsOutputs: [
      "Input: display_name, avatar_url, commitment_level updates",
      "Output: profiles table update",
      "Display: user_prayer_stats, prayer_actions, app_events for activity",
    ],
    scenarios: [
      { label: "Happy path", description: "User updates display name → saved to profiles → reflected everywhere" },
      { label: "Activity empty", description: "New user → no activity → encouraging message" },
      { label: "Admin badge", description: "Admin users see Shield icon and Admin link in dropdown" },
      { label: "Test account", description: "Test accounts show special badge in admin user list" },
    ],
    rules: [
      "Users can only update their own profile (RLS enforced)",
      "Admins can view and update any profile",
      "Test account fields (is_test_account, test_role_label, etc.) only editable by admins",
      "Commitment levels: open, committed, dedicated",
      "Profile auto-created on signup via trigger",
    ],
    dependencies: ["profiles", "user_prayer_stats", "prayer_actions", "app_events", "user_roles"],
    commonIssues: [
      "Profile not found → check handle_new_user trigger executed",
      "Activity not loading → check app_events actor_user_id matches",
    ],
    screenshotPlaceholders: ["Profile page", "Profile dropdown menu", "Activity dashboard", "Settings/commitments page"],
    technicalNotes: [
      "Pages: Profile.tsx, Dashboard.tsx, MyCommitments.tsx, MyPrayerReminders.tsx",
      "Components: CommitmentLevelSelector.tsx, PrayerReminderToggle.tsx",
      "Navigation dropdown: Navigation.tsx (profile dropdown section)",
      "Hook: useAuth.tsx for user data, useAdminRole.ts for admin check",
    ],
    changelog: [
      { title: "Profile dropdown restructure", description: "Moved Sign Out into profile dropdown, added My Activity/Settings/Admin links", updatedBy: "System", date: "2026-04-14", version: "1.2" },
      { title: "Test account system", description: "Added is_test_account, test_role_label, exclude_from_analytics, internal_only fields", updatedBy: "System", date: "2026-04-12", version: "1.1" },
      { title: "Initial profile", description: "Profile page with display name, commitment level", updatedBy: "System", date: "2026-03-15", version: "1.0" },
    ],
  },
  {
    id: "admin",
    module: "Admin",
    title: "Platform Administration",
    status: "updated",
    version: "2.1",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["admin"],
    purpose: "Centralized admin dashboard for platform oversight including moderation, user management, church administration, reports, automation, audit logging, documentation, and testing.",
    features: [
      "Admin dashboard with key metrics",
      "Content moderation queue with bulk actions",
      "User management (search, view, mark test accounts, assign roles)",
      "Church management (search, verify, status updates)",
      "Reports dashboard",
      "Automation rules management (auto-approve/deny logic)",
      "Audit log with searchable history",
      "Admin notification bell with 30-second polling",
      "5 color-coded alert types (moderation, reports, churches, auto-denied, suspicious)",
      "Documentation section (new)",
      "Unit Testing section (new)",
      "Role-based access: admin only (moderators get limited access to some sections)",
    ],
    userFlow: [
      "Admin clicks Shield icon or Admin link in navigation",
      "Lands on Admin dashboard with overview metrics",
      "Uses sidebar to navigate between sections",
      "Moderation: reviews flagged content, approves/rejects",
      "Users: searches users, marks test accounts, assigns roles",
      "Churches: verifies churches, manages status",
      "Reports: views platform reports",
      "Automation: toggles auto-moderation rules",
      "Audit: searches historical admin actions",
      "Documentation: views/searches app documentation",
      "Unit Testing: reviews test cases and coverage",
    ],
    adminFlow: [
      "All actions logged to admin_audit_log",
      "Notification bell polls every 30 seconds for alerts",
      "Moderation actions: approve, reject (with reason), add notes",
      "User actions: mark as test account, toggle roles",
      "Church actions: verify, change status",
    ],
    dataInputsOutputs: [
      "Input: admin actions (approve, reject, verify, toggle, etc.)",
      "Output: admin_audit_log entries",
      "Output: moderation_queue status updates",
      "Output: profiles updates (test account flags)",
      "Output: user_roles updates",
      "Output: churches updates (verified, status)",
      "Display: aggregated metrics from all tables",
    ],
    scenarios: [
      { label: "Happy path", description: "Admin logs in → reviews queue → approves/rejects → logs action" },
      { label: "Non-admin access", description: "Regular user navigates to /admin → redirected to /" },
      { label: "Moderator access", description: "Moderator can view moderation queue but not user/church management" },
      { label: "Automation rule", description: "Admin creates auto-approve rule → matching content auto-approved" },
      { label: "Audit trail", description: "Every admin action recorded with actor, target, reason, timestamp" },
    ],
    rules: [
      "Only users with 'admin' role in user_roles can access",
      "AdminRoute component verifies role before rendering",
      "All write actions require admin role (RLS enforced)",
      "Audit log is append-only (no update/delete)",
      "Notification polling uses 30-second interval (not real-time for security)",
      "Moderators have limited access to specific sections",
    ],
    dependencies: ["user_roles", "admin_audit_log", "moderation_queue", "automation_rules", "profiles", "churches", "app_events"],
    commonIssues: [
      "Admin dashboard slow → check query optimization for metrics",
      "Notifications not showing → verify polling interval and RLS policies",
    ],
    screenshotPlaceholders: ["Admin dashboard", "Moderation queue", "User management", "Church management", "Reports", "Automation rules", "Audit log", "Documentation home", "Unit testing dashboard"],
    technicalNotes: [
      "Layout: src/pages/admin/AdminLayout.tsx (sidebar + outlet)",
      "Route guard: src/components/AdminRoute.tsx",
      "Pages: AdminDashboard, AdminModeration, AdminUsers, AdminChurches, AdminReports, AdminAutomation, AdminAuditLog, AdminDocumentation, AdminUnitTesting",
      "Hook: useAdminRole.ts",
      "Notification: AdminNotificationBell.tsx",
    ],
    changelog: [
      { title: "Documentation & Unit Testing", description: "Added comprehensive documentation and unit testing sections to admin area", updatedBy: "System", date: "2026-04-14", version: "2.1" },
      { title: "Test account management", description: "Added ability to mark/unmark test accounts from user management", updatedBy: "System", date: "2026-04-12", version: "2.0" },
      { title: "Notification bell", description: "30-second polling alerts with 5 color-coded types", updatedBy: "System", date: "2026-04-08", version: "1.5" },
      { title: "Initial admin", description: "Dashboard, moderation, users, churches, reports, automation, audit", updatedBy: "System", date: "2026-04-01", version: "1.0" },
    ],
  },
  {
    id: "navigation",
    module: "Navigation",
    title: "Core Navigation & Layout",
    status: "active",
    version: "1.3",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["guest", "user", "moderator", "admin"],
    purpose: "Provides the global navigation bar, bottom mobile navigation, footer, and routing structure for the entire application.",
    features: [
      "Top navigation bar with logo and main links",
      "Core links: Home, Pray, Churches",
      "More dropdown: Store, Calendar, Family, Scripture",
      "Profile dropdown: Profile, My Activity, Settings, Admin (if admin), Sign Out",
      "Admin Shield icon + notification bell (admin only)",
      "Cart icon (store routes only)",
      "Bottom mobile navigation bar",
      "App footer with links and info",
      "Store sub-navigation (store routes only)",
      "Responsive design for mobile/tablet/desktop",
    ],
    userFlow: [
      "User sees top nav on all pages",
      "Clicks nav items to navigate between sections",
      "Mobile users use bottom nav for quick access",
      "Profile avatar opens dropdown menu",
      "Cart icon appears only on store pages",
    ],
    dataInputsOutputs: [
      "Input: user clicks, route changes",
      "Output: route navigation, dropdown toggles",
      "Conditional: admin links based on useAdminRole hook",
      "Conditional: cart icon based on current route",
    ],
    scenarios: [
      { label: "Guest view", description: "Shows Home, Pray, Churches, More, Login/Signup buttons" },
      { label: "Authenticated view", description: "Shows full nav + profile dropdown" },
      { label: "Admin view", description: "Shows Shield icon + notification bell in nav" },
      { label: "Store route", description: "Cart icon + store sub-nav appear" },
      { label: "Mobile view", description: "Bottom nav replaces some top nav items" },
    ],
    rules: [
      "Cart icon conditional on store routes",
      "Admin links conditional on admin role",
      "Profile dropdown consolidates all user actions",
      "Store sub-nav only on /store and /product routes",
      "Bottom nav shown on mobile viewports",
    ],
    dependencies: ["useAuth", "useAdminRole", "react-router-dom", "cartStore"],
    commonIssues: [
      "Nav not updating after login → check auth state subscription",
      "Cart icon showing on non-store pages → check route matching logic",
    ],
    screenshotPlaceholders: ["Desktop navigation", "Mobile navigation", "Profile dropdown", "More dropdown", "Admin nav indicators", "Store sub-nav"],
    technicalNotes: [
      "Component: src/components/Navigation.tsx",
      "Bottom nav: src/components/BottomNav.tsx",
      "Footer: src/components/AppFooter.tsx",
      "Store sub-nav: defined in App.tsx (StoreSubNav component)",
    ],
    changelog: [
      { title: "Profile dropdown restructure", description: "Consolidated Sign Out, My Activity, Settings, Admin into profile dropdown", updatedBy: "System", date: "2026-04-14", version: "1.3" },
      { title: "Conditional cart icon", description: "Cart icon only appears on store routes", updatedBy: "System", date: "2026-04-10", version: "1.2" },
      { title: "Initial navigation", description: "Top nav, bottom nav, footer, routing", updatedBy: "System", date: "2026-03-15", version: "1.0" },
    ],
  },
  {
    id: "moderation",
    module: "Moderation",
    title: "Content Moderation System",
    status: "active",
    version: "1.2",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["moderator", "admin"],
    purpose: "Ensures content quality and safety by reviewing prayer requests and other user-generated content through AI-assisted and manual moderation workflows.",
    features: [
      "AI-powered content moderation via edge function",
      "Moderation queue for flagged content",
      "Manual review by admins/moderators",
      "Approve/reject actions with reason tracking",
      "Confidence scoring from AI analysis",
      "Automation rules for auto-approve/deny",
      "Content preview in queue",
      "Bulk actions for efficiency",
      "Audit trail for all moderation decisions",
    ],
    userFlow: [
      "User submits content → moderate-content edge function evaluates",
      "If flagged → enters moderation_queue with reason and confidence score",
      "Admin/moderator sees item in queue",
      "Reviews content preview → approves or rejects",
      "Rejection requires reason → stored and optionally shown to user",
      "Action logged to admin_audit_log",
    ],
    dataInputsOutputs: [
      "Input: content text for moderation",
      "Output: moderation_queue row with status, reason, confidence",
      "Output: admin_audit_log entry on review action",
      "Output: content status update (approved/rejected)",
    ],
    scenarios: [
      { label: "Clean content", description: "AI passes content → saved immediately, no queue entry" },
      { label: "Flagged content", description: "AI flags → enters queue → admin reviews → approves/rejects" },
      { label: "Auto-approve rule", description: "Automation rule matches → content auto-approved" },
      { label: "Auto-deny rule", description: "Automation rule matches → content auto-rejected" },
      { label: "Edge function failure", description: "Moderation function fails → content queued for manual review" },
    ],
    rules: [
      "Only admins and moderators can access moderation queue",
      "Moderation decisions logged with actor, reason, timestamp",
      "Confidence score from AI helps prioritize review",
      "Automation rules checked before manual queue",
      "Content preview shown for context without navigating away",
    ],
    dependencies: ["moderation_queue", "automation_rules", "admin_audit_log", "moderate-content edge function", "Lovable AI Gateway"],
    commonIssues: [
      "AI false positives → adjust automation rules or manually approve",
      "Queue growing → increase review frequency or tune auto-rules",
    ],
    screenshotPlaceholders: ["Moderation queue", "Content review detail", "Approve/reject dialog", "Automation rules"],
    technicalNotes: [
      "Edge function: supabase/functions/moderate-content/index.ts",
      "Hook: src/hooks/useContentModeration.ts",
      "Admin pages: AdminModeration.tsx, AdminAutomation.tsx",
      "Page: ModerationDashboard.tsx (moderator view)",
    ],
    changelog: [
      { title: "Automation rules", description: "Added configurable auto-approve/deny rules", updatedBy: "System", date: "2026-04-08", version: "1.2" },
      { title: "AI moderation", description: "Integrated AI content analysis via edge function", updatedBy: "System", date: "2026-04-05", version: "1.1" },
      { title: "Initial moderation", description: "Manual moderation queue for content review", updatedBy: "System", date: "2026-04-01", version: "1.0" },
    ],
  },
  {
    id: "error-handling",
    module: "Error Handling",
    title: "Error Handling & Validation",
    status: "active",
    version: "1.0",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["guest", "user", "moderator", "admin"],
    purpose: "Provides consistent error handling, form validation, loading states, and empty states throughout the application.",
    features: [
      "Form validation with react-hook-form + zod",
      "Password strength validation",
      "Toast notifications for success/error feedback",
      "Loading spinners during async operations",
      "Empty state messages",
      "404 Not Found page",
      "Input sanitization via validation library",
      "Error boundaries for component failures",
    ],
    userFlow: [
      "User submits invalid form → inline errors shown",
      "Async operation in progress → loading spinner displayed",
      "Operation succeeds → success toast notification",
      "Operation fails → error toast with helpful message",
      "Unknown route → 404 page shown",
    ],
    dataInputsOutputs: [
      "Input: user form data",
      "Output: validated/sanitized data or error messages",
      "Display: toast notifications, inline errors, loading states",
    ],
    scenarios: [
      { label: "Validation error", description: "Required field empty → inline error message below field" },
      { label: "Network error", description: "API call fails → error toast with retry suggestion" },
      { label: "404 page", description: "User visits /nonexistent → NotFound page displayed" },
      { label: "Loading state", description: "Data fetching → spinner shown → content replaces spinner" },
      { label: "Empty state", description: "No data available → encouraging empty message" },
    ],
    rules: [
      "All forms use react-hook-form for state management",
      "Zod schemas define validation rules",
      "Toast notifications via sonner and custom toast",
      "Loading states use consistent spinner component",
      "404 page catches all unmatched routes",
    ],
    dependencies: ["react-hook-form", "zod", "sonner", "toast component"],
    commonIssues: [
      "Toast not showing → check Toaster component is mounted",
      "Validation not triggering → verify zod resolver configuration",
    ],
    screenshotPlaceholders: ["Form validation errors", "Loading spinner", "Success toast", "Error toast", "404 page", "Empty state"],
    technicalNotes: [
      "Validation: src/lib/validation.ts",
      "Toast: src/components/ui/toast.tsx, sonner",
      "404: src/pages/NotFound.tsx",
      "Password: src/components/PasswordStrengthMeter.tsx",
    ],
    changelog: [
      { title: "Initial error handling", description: "Form validation, toasts, loading states, 404 page", updatedBy: "System", date: "2026-03-15", version: "1.0" },
    ],
  },
  {
    id: "test-accounts",
    module: "Test Accounts",
    title: "Internal Testing Account System",
    status: "active",
    version: "1.0",
    lastUpdated: "2026-04-14 10:00",
    accessRoles: ["admin"],
    purpose: "Allows creation and management of internal test accounts for QA testing. Test accounts are hidden from production users, public feeds, analytics, and member counts.",
    features: [
      "Mark/unmark users as test accounts",
      "Test role labels (Admin 1, Moderator 1, Testing 1, etc.)",
      "Exclude from analytics flag",
      "Internal only flag",
      "Test account badge in admin user list",
      "Test account prayers hidden from public views",
      "Test accounts hidden from church member counts",
    ],
    userFlow: [
      "Admin navigates to Admin → Users",
      "Searches for user → clicks 'Mark Test'",
      "Sets test_role_label (e.g., 'Admin 1')",
      "User is now flagged as test account",
      "Test account's content excluded from public views",
      "Admin can unmark test accounts",
    ],
    adminFlow: [
      "Admin manages test accounts via Admin → Users",
      "Can filter to show only test accounts",
      "Test badge shown next to test account names",
      "Role assignment done separately via user_roles table",
    ],
    dataInputsOutputs: [
      "Input: toggle is_test_account, set test_role_label",
      "Output: profiles table update",
      "Effect: public views (global_prayers_public, unified_prayer_feed) filter out test accounts",
    ],
    scenarios: [
      { label: "Mark test account", description: "Admin marks user → prayers hidden from feed → badge shown in admin" },
      { label: "Unmark test account", description: "Admin unmarks → user's content reappears in public feeds" },
      { label: "Test account prayer", description: "Test user submits prayer → not visible in public views" },
    ],
    rules: [
      "Only admins can toggle test account flags",
      "Test account filtering in views uses COALESCE(p.is_test_account, false) = false",
      "Test accounts can have roles (admin, moderator) for testing permissions",
      "Disabled test accounts cannot login",
    ],
    dependencies: ["profiles", "global_prayers_public view", "unified_prayer_feed view", "user_roles"],
    commonIssues: [
      "Test prayer still visible → verify view was recreated with test filter",
      "Cannot mark test → check admin RLS on profiles update",
    ],
    screenshotPlaceholders: ["Admin user list with test badges", "Mark test account dialog", "Test role label display"],
    technicalNotes: [
      "Profile fields: is_test_account, test_role_label, exclude_from_analytics, internal_only",
      "Views filter: LEFT JOIN profiles + COALESCE(is_test_account, false) = false",
      "Admin UI: AdminUsers.tsx handles test account management",
    ],
    changelog: [
      { title: "Initial test account system", description: "Added test account fields, view filtering, admin UI", updatedBy: "System", date: "2026-04-12", version: "1.0" },
    ],
  },
];

const ROLE_COLORS: Record<string, string> = {
  guest: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  user: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  moderator: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const SectionDetail = ({ doc }: { doc: DocSection }) => (
  <div className="space-y-6">
    {/* Purpose */}
    <div>
      <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5"><Info className="w-4 h-4 text-primary" /> Purpose</h4>
      <p className="text-sm text-muted-foreground">{doc.purpose}</p>
    </div>

    {/* Access Roles */}
    <div>
      <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" /> Who Can Access</h4>
      <div className="flex gap-1.5 flex-wrap">{doc.accessRoles.map(r => <Badge key={r} variant="outline" className={ROLE_COLORS[r]}>{r}</Badge>)}</div>
    </div>

    {/* Features */}
    <div>
      <h4 className="font-semibold text-sm mb-1">Main Features</h4>
      <ul className="text-sm text-muted-foreground space-y-0.5 list-disc list-inside">{doc.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
    </div>

    {/* User Flow */}
    <div>
      <h4 className="font-semibold text-sm mb-1">User Flow</h4>
      <ol className="text-sm text-muted-foreground space-y-0.5 list-decimal list-inside">{doc.userFlow.map((s, i) => <li key={i}>{s}</li>)}</ol>
    </div>

    {/* Admin Flow */}
    {doc.adminFlow && (
      <div>
        <h4 className="font-semibold text-sm mb-1">Admin / Moderator Flow</h4>
        <ol className="text-sm text-muted-foreground space-y-0.5 list-decimal list-inside">{doc.adminFlow.map((s, i) => <li key={i}>{s}</li>)}</ol>
      </div>
    )}

    {/* Data */}
    <div>
      <h4 className="font-semibold text-sm mb-1">Data / Inputs / Outputs</h4>
      <ul className="text-sm text-muted-foreground space-y-0.5 list-disc list-inside">{doc.dataInputsOutputs.map((d, i) => <li key={i}>{d}</li>)}</ul>
    </div>

    {/* Scenarios */}
    <div>
      <h4 className="font-semibold text-sm mb-1">Scenarios</h4>
      <div className="space-y-1.5">{doc.scenarios.map((s, i) => (
        <div key={i} className="text-sm"><span className="font-medium">{s.label}:</span> <span className="text-muted-foreground">{s.description}</span></div>
      ))}</div>
    </div>

    {/* Rules */}
    <div>
      <h4 className="font-semibold text-sm mb-1">Rules / Logic</h4>
      <ul className="text-sm text-muted-foreground space-y-0.5 list-disc list-inside">{doc.rules.map((r, i) => <li key={i}>{r}</li>)}</ul>
    </div>

    {/* Dependencies */}
    <div>
      <h4 className="font-semibold text-sm mb-1">Dependencies</h4>
      <div className="flex gap-1.5 flex-wrap">{doc.dependencies.map((d, i) => <Badge key={i} variant="secondary" className="text-xs">{d}</Badge>)}</div>
    </div>

    {/* Common Issues */}
    <div>
      <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-yellow-500" /> Common Issues</h4>
      <ul className="text-sm text-muted-foreground space-y-0.5 list-disc list-inside">{doc.commonIssues.map((c, i) => <li key={i}>{c}</li>)}</ul>
    </div>

    {/* Screenshots */}
    <div>
      <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5"><Image className="w-4 h-4 text-primary" /> Screenshots</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">{doc.screenshotPlaceholders.map((s, i) => (
        <div key={i} className="border border-dashed border-border rounded-lg p-4 text-center text-xs text-muted-foreground bg-muted/30 flex flex-col items-center gap-1">
          <Image className="w-5 h-5" />{s}
        </div>
      ))}</div>
    </div>

    {/* Technical Notes */}
    <Accordion type="single" collapsible>
      <AccordionItem value="tech">
        <AccordionTrigger className="text-sm py-2">Technical Notes</AccordionTrigger>
        <AccordionContent>
          <ul className="text-sm text-muted-foreground space-y-0.5 list-disc list-inside font-mono">{doc.technicalNotes.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>

    {/* Changelog */}
    <div>
      <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> Changelog</h4>
      <div className="space-y-2 border-l-2 border-border pl-4">
        {doc.changelog.map((c, i) => (
          <div key={i} className="text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">v{c.version}</Badge>
              <span className="font-medium">{c.title}</span>
              <span className="text-muted-foreground text-xs">— {c.date}</span>
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">{c.description} • by {c.updatedBy}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdminDocumentation = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandAll, setExpandAll] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return DOCS.filter(d => {
      const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.module.toLowerCase().includes(search.toLowerCase()) || d.purpose.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || d.accessRoles.includes(roleFilter as AccessRole);
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [search, roleFilter, statusFilter]);

  const handleExpandAll = () => {
    if (expandAll) {
      setOpenSections([]);
    } else {
      setOpenSections(filtered.map(d => d.id));
    }
    setExpandAll(!expandAll);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary" /> Documentation</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete reference for the PrayerForward platform — {DOCS.length} modules documented</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExpandAll}>
            {expandAll ? "Collapse All" : "Expand All"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3"><div className="text-2xl font-bold">{DOCS.length}</div><div className="text-xs text-muted-foreground">Total Modules</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-green-600">{DOCS.filter(d=>d.status==='active').length}</div><div className="text-xs text-muted-foreground">Active</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-blue-600">{DOCS.filter(d=>d.status==='updated').length}</div><div className="text-xs text-muted-foreground">Updated</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-yellow-600">{DOCS.filter(d=>d.status==='draft'||d.status==='needs_review').length}</div><div className="text-xs text-muted-foreground">Draft / Review</div></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search modules..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px]"><Filter className="w-4 h-4 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="guest">Guest</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="updated">Updated</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="needs_review">Needs Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick links */}
      <div className="flex gap-2 flex-wrap">
        {filtered.map(d => (
          <Button key={d.id} size="sm" variant="ghost" className="text-xs h-7" onClick={() => {
            setOpenSections(prev => prev.includes(d.id) ? prev : [...prev, d.id]);
            document.getElementById(`doc-${d.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}>
            {d.module}
          </Button>
        ))}
      </div>

      <Separator />

      {/* Documentation sections */}
      <Accordion type="multiple" value={openSections} onValueChange={setOpenSections}>
        {filtered.map(doc => (
          <AccordionItem key={doc.id} value={doc.id} id={`doc-${doc.id}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <div className="font-semibold text-sm">{doc.title}</div>
                  <div className="text-xs text-muted-foreground">{doc.module} • v{doc.version}</div>
                </div>
                <Badge className={`${STATUS_COLORS[doc.status]} text-[10px] ml-2`}>{doc.status}</Badge>
                <span className="text-[10px] text-muted-foreground ml-auto mr-4 hidden sm:block">{doc.lastUpdated}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4 px-1">
                <SectionDetail doc={doc} />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No documentation matches your filters.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentation;
