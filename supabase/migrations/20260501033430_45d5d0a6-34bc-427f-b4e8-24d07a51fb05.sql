
-- 1) Log change entries in the master Change Log
INSERT INTO public.documentation_updates
  (title, summary, detailed_description, module_keys, submodule_keys, change_type, affected_roles, flow_types, version_tag, status, created_by)
VALUES
  (
    'Global UI/UX upgrade — gradients, glass cards, premium feel',
    'Replaced flat backgrounds with soft gradients, added glass-style cards with 16–20px radius, refined spacing on an 8px grid, and improved contrast across the app.',
    'Introduced animated mesh background (.bg-mesh), shimmering text-gradient utility, hover-glow composite, and rise-in entrance animations. Added new keyframes: shimmer, gradient-shift, glow-pulse, rise-in. Tightened typography hierarchy and unified card depth/shadows.',
    ARRAY['navigation','pray','ripple','scripture','profile'], ARRAY[]::text[], 'ui',
    ARRAY['guest','user'], ARRAY['user'], '2.1', 'documentation_updated', 'system'
  ),
  (
    'Dark Mode + Theme Toggle',
    'Added full dark mode support with a header ThemeProvider and ThemeToggle.',
    'New components: src/components/theme/ThemeProvider.tsx and src/components/theme/ThemeToggle.tsx. Wired into App.tsx and Navigation.tsx. All semantic tokens (background, foreground, primary, accent, muted) tuned for both light and dark themes via index.css.',
    ARRAY['navigation','profile'], ARRAY[]::text[], 'feature',
    ARRAY['guest','user','moderator','admin'], ARRAY['user'], '1.4', 'documentation_updated', 'system'
  ),
  (
    'Prayer Streaks card on Home Dashboard',
    'Added a calm Prayer Streaks card on the Home Dashboard surfacing consistent prayer rhythm in a grace-based, non-gamified tone.',
    'Card uses bg-aurora overlay and rise-in entrance animation. Wording avoids task-driven/gamified language per project tone guidelines.',
    ARRAY['profile','pray'], ARRAY[]::text[], 'feature',
    ARRAY['user'], ARRAY['user'], '1.1', 'documentation_updated', 'system'
  ),
  (
    'Sparkles branded symbol replaces 🙏 emoji',
    'Replaced the praying-hands emoji across the app with a Lucide Sparkles icon inside a glowing gradient container to match the forest-green / vibrant-orange identity.',
    'Files updated: PrayFocusSelector.tsx, PrayerCard.tsx, RippleImpact.tsx, Scripture.tsx, Login.tsx, PrayerCalendar.tsx, Organizations.tsx, OrganizationDetail.tsx, FamilyRequests.tsx, family/FamilyNotes.tsx, family/FamilyPrayerRequests.tsx. Memory rule "Minimal emojis (🙏 in primary actions)" superseded — Sparkles is now the primary action symbol.',
    ARRAY['pray','ripple','scripture','family','churches','navigation'], ARRAY[]::text[], 'ui',
    ARRAY['guest','user'], ARRAY['user'], '2.1', 'documentation_updated', 'system'
  ),
  (
    'Ripple Impact screen visual overhaul',
    'Hero now uses animated mesh background with floating decorative orbs; stats upgraded to 4xl shimmering numbers; Live Impact card uses glow-pulse animation.',
    'Maintains vertical timeline and non-competitive milestones (no progress bars/badges). Pure presentation changes — no backend or scoring logic touched.',
    ARRAY['ripple'], ARRAY[]::text[], 'ui',
    ARRAY['user'], ARRAY['user'], '1.2', 'documentation_updated', 'system'
  ),
  (
    'Pray screen refinements',
    'PrayFocusSelector restyled with gradient Sparkles emblem, float-slow animation, and softer card surfaces. PrayerRequestCard uses fade-and-rise entrance via framer-motion.',
    'Aligned with Prayer Card UI memory: 12px rounded corners, fade-and-rise motion, calm typography. No changes to selection engine or fairness scoring.',
    ARRAY['pray'], ARRAY[]::text[], 'ui',
    ARRAY['guest','user'], ARRAY['user'], '2.1', 'documentation_updated', 'system'
  );

-- 2) Bump version & status on affected modules
UPDATE public.documentation_modules SET version = '2.1', status = 'updated', last_updated_at = now() WHERE module_key = 'pray';
UPDATE public.documentation_modules SET version = '1.2', status = 'updated', last_updated_at = now() WHERE module_key = 'ripple';
UPDATE public.documentation_modules SET version = '1.4', status = 'updated', last_updated_at = now() WHERE module_key = 'navigation';
UPDATE public.documentation_modules SET version = '1.1', status = 'updated', last_updated_at = now() WHERE module_key = 'profile';
UPDATE public.documentation_modules SET version = '1.2', status = 'updated', last_updated_at = now() WHERE module_key = 'scripture';
UPDATE public.documentation_modules SET version = '1.1', status = 'updated', last_updated_at = now() WHERE module_key = 'family';

-- 3) Add per-module notes summarizing the visual changes
INSERT INTO public.documentation_notes (documentation_module_id, note_title, note_body, note_type, version_tag, updated_by)
SELECT id, 'UI/UX upgrade v2.1', 'Animated mesh background, glass cards (16–20px radius), Sparkles branded action symbol, fade-and-rise prayer card animations, dark mode support via ThemeProvider/ThemeToggle. No backend or selection-engine changes.', 'update', '2.1', 'system'
FROM public.documentation_modules WHERE module_key = 'pray';

INSERT INTO public.documentation_notes (documentation_module_id, note_title, note_body, note_type, version_tag, updated_by)
SELECT id, 'Visual overhaul v1.2', 'Hero uses animated mesh + floating orbs. Stats use 4xl shimmering text; Live Impact card pulses with glow-pulse keyframe. Vertical timeline and non-competitive milestones preserved.', 'update', '1.2', 'system'
FROM public.documentation_modules WHERE module_key = 'ripple';

INSERT INTO public.documentation_notes (documentation_module_id, note_title, note_body, note_type, version_tag, updated_by)
SELECT id, 'Theme toggle + dark mode v1.4', 'Added ThemeProvider and ThemeToggle in the top navigation. All semantic tokens tuned for light/dark. Cart icon visibility and admin-only links unchanged.', 'update', '1.4', 'system'
FROM public.documentation_modules WHERE module_key = 'navigation';

INSERT INTO public.documentation_notes (documentation_module_id, note_title, note_body, note_type, version_tag, updated_by)
SELECT id, 'Home Dashboard v1.1', 'Added Prayer Streaks card (grace-based wording, no gamification). Header uses rise-in entrance animation; aurora overlay on Prayer Journey card.', 'update', '1.1', 'system'
FROM public.documentation_modules WHERE module_key = 'profile';

INSERT INTO public.documentation_notes (documentation_module_id, note_title, note_body, note_type, version_tag, updated_by)
SELECT id, 'Sparkles topic icon v1.2', 'Gratitude topic icon updated from 🙏 to ✨ to align with new branded action symbol.', 'update', '1.2', 'system'
FROM public.documentation_modules WHERE module_key = 'scripture';

INSERT INTO public.documentation_notes (documentation_module_id, note_title, note_body, note_type, version_tag, updated_by)
SELECT id, 'Family UI alignment v1.1', 'Sparkles icon replaces 🙏 across Family Notes and Family Prayer Requests components. No changes to RLS or family membership logic.', 'update', '1.1', 'system'
FROM public.documentation_modules WHERE module_key = 'family';
