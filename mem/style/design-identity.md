---
name: design-identity
description: PrayerForward editorial brand — dark teal + warm gold, Playfair/Lato/Cormorant, no gradients
type: design
---
PrayerForward visual system (May 2026 rebrand). Replaces the prior forest-green + vibrant-orange + Inter system.

**Palette (HSL tokens in src/index.css):**
- --pf-primary #22333B (dark teal) — main brand color, nav/hero CTA
- --pf-secondary #F2F4F3 (off-white) — primary surface
- --pf-accent #C9A96E (warm gold) — accent, eyebrows, gold rules, hover underline
- --pf-mid #3D5A67, --pf-surface #EAECEA, --pf-dark #1A2A30 (footer), --pf-body #2C3E45, --pf-muted #6B7F86

**Typography (loaded in index.html):**
- --font-display Playfair Display (headings, weight 600)
- --font-body Lato (body weight 300, micro-labels weight 700)
- --font-scripture Cormorant Garamond italic (pull-quotes, .font-scripture / .pf-scripture)

**Hard rules — no exceptions:**
- No gradients on any element. bg-mesh / bg-aurora / text-gradient have been flattened.
- No box shadows except `0 2px 8px rgba(34,51,59,0.08)` on the nav when scrolled, plus the same value on cards.
- Button border-radius 4px max. No pill/rounded-full buttons.
- No purple/blue/default-Tailwind color classes. Use semantic tokens or pf-* utilities.
- Inter, Roboto, Arial are NOT heading fonts. Headings always Playfair.
- Lucide is retained but icons in card/feature contexts should be tinted gold (text-accent / hsl(var(--pf-accent))).

**Editorial helpers in index.css:**
- `.pf-eyebrow` — 10px uppercase Lato 700, letter-spacing 0.18em, gold
- `.pf-rule-gold` — 48px × 1px gold horizontal rule centered (use `.pf-rule-gold-left` for left-align)
- `.pf-scripture` — Cormorant italic 14px, gold left border
- `.pf-btn-primary` / `.pf-btn-secondary` — editorial CTA buttons (10px uppercase Lato 700)
- `.pf-navlink` / `.pf-navlink-cta` — nav links on dark teal bar (65% opacity → 100% on hover with gold underline)

**Layout:**
- Page max-width 1140px centered.
- Section padding 80px top/bottom desktop, 48px mobile.
