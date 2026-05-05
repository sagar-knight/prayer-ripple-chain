# Final Launch Alignment — Simplified Prayer Experience

## What changed

- **Homepage**: Above-the-fold reduced to headline, subtext, single Featured
  Prayer card, and a quiet activity pulse. Secondary content (church/family,
  reminder hook, how-it-works, features, scripture, newsletter, final CTA)
  remains below the fold.
- **Prayer cards**: Standardized across `PrayerRequestCard`, `FeaturedPrayerCard`,
  `PrayerRippleChain`, and `PrayerStatusTracker`. One emotional line
  ("X people are praying with you" / "Be the first to pray"), optional
  "Shared X times" only when > 0. Removed duplicate metrics and the
  "Prayer Chain" stats grid.
- **Post-pray flow**: `PrayerImpactDialog` shows thank-you, joined count,
  optional country reach, and two next steps (Pray for another, Share).
  No forced navigation.
- **Lifecycle + updates**: `global_prayer_requests.status` extended to
  `open | progress | answered | archived`. New `prayer_updates` table for
  owner-posted testimonies. Status badges and "Latest update" preview
  surface on cards. `auto_archive_stale_prayers()` archives prayers older
  than 30 days with no recent activity.
- **Navigation**: Primary nav = Pray, Request, Ripple, Churches, More.
  Family, Scripture, Store, Support Mission, Calendar live under More.
- **Store gating**: Store stays accessible but is hidden from the More menu
  for authenticated users until they've prayed at least 3 times. Signed-out
  visitors still see it for discovery.
- **Activity signals**: `ActivityPulse` aggregates real prayer counts to make
  the app feel alive without exposing identity.
- **Sample state**: Empty feeds show a clearly labeled "Sample prayer" badge
  and route the user into the real flow on tap.

## Why

Reduce confusion and time-to-first-prayer. Replace analytical, task-driven
language with grace-based, emotionally meaningful copy. Protect trust by
keeping monetization away from sensitive prayer surfaces.

## What was NOT changed

- No routes removed
- No features deleted
- No backend logic rewritten beyond additive lifecycle/update support
- No private/family/church prayer visibility relaxed
- No identity exposed in activity signals
- The 🙏 emoji remains retired per project convention; Sparkles (Lucide) is
  the action symbol throughout

## Test coverage

Existing Playwright suites cover the affected flows:

- `e2e/01-home.spec.ts` — homepage above-the-fold
- `e2e/03-prayer-submit.spec.ts` — submit flow (default ACTIVE status)
- `e2e/04-pray-action.spec.ts` — pray action + impact dialog
- `e2e/08-ripple-impact.spec.ts` — ripple page
- `e2e/09-prayer-share.spec.ts` — share links

Manual verification checklist:

- [ ] User understands action in 3 seconds
- [ ] Pray Now succeeds and post-pray confirmation appears
- [ ] Cards show identical structure across surfaces
- [ ] No duplicate metrics on any card
- [ ] Private prayers remain invisible to non-members
- [ ] Share links open the correct prayer
- [ ] More menu hides Store until 3+ prayers (authenticated)
- [ ] Owner can post a status change and an update
- [ ] Latest update preview appears on the owner's tracker card