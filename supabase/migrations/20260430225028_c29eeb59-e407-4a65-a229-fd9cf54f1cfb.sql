
INSERT INTO public.documentation_modules (module_key, module_name, slug, description, content_json, status, version)
VALUES (
  'testing_and_security',
  'Testing & Security',
  'testing-and-security',
  'End-to-end testing (Playwright), unit tests (Vitest), and security scanning tools used to keep PrayerForward stable and safe.',
  jsonb_build_object(
    'sections', jsonb_build_array(
      jsonb_build_object(
        'heading', 'Overview',
        'body', 'PrayerForward uses a layered approach: unit tests for logic, end-to-end tests for full user flows, and automated scans for security and dependency issues.'
      ),
      jsonb_build_object(
        'heading', '1. Unit & Component Tests (Vitest)',
        'body', 'Fast tests in Node + jsdom for pure logic, validation, and React components. Location: src/**/*.test.ts(x). Run: bunx vitest run (one-shot), bunx vitest (watch), bunx vitest --ui (browser UI). Already covered: src/lib/__tests__/validation.test.ts (moderation rules, rate limiter), src/test/example.test.ts (smoke).'
      ),
      jsonb_build_object(
        'heading', '2. End-to-End Tests (Playwright)',
        'body', 'Real-browser tests across Chromium and mobile viewports. Location: e2e/*.spec.ts. Run locally: bunx playwright install (one-time), then bunx playwright test. Run against preview/production: E2E_BASE_URL=https://prayer-ripple-chain.lovable.app bunx playwright test.',
        'flows', jsonb_build_array(
          '01-home: Public home renders without console errors',
          '02-auth: Login + signup form fields render',
          '03-prayer-submit: /submit redirects unauthenticated users to /login',
          '04-pray-action: /pray is reachable',
          '05-translate: Home stays stable for public users',
          '06-admin-moderation: /admin is route-guarded',
          '07-church-join: /join/:slug handles invalid slugs gracefully',
          '08-ripple-impact: /ripple is auth-guarded'
        )
      ),
      jsonb_build_object(
        'heading', '3. Security Scanning',
        'body', 'Built-in (on demand): Lovable Security Scan (RLS, exposed data, auth misconfigs), Supabase Linter (RLS gaps, function search_path, SECURITY DEFINER exposure). Continuous: Aikido at workspace level (dependency CVEs, secret leakage, SAST) shows in Security tab. Manual / quarterly: OWASP ZAP or Burp Suite (active pen-test), Lighthouse CI (perf, a11y, SEO), axe DevTools (accessibility).'
      ),
      jsonb_build_object(
        'heading', '4. Pre-Release QA Checklist',
        'body', 'Run before each public release.',
        'checklist', jsonb_build_array(
          'bunx vitest run passes',
          'bunx playwright test passes against preview URL',
          'Security Scan + Supabase Linter return no new ERROR-level findings',
          'Manual flow: signup, submit prayer, pray, translate, admin approve',
          'Crisis-keyword path still shows emergency resources and suppresses monetization',
          'Anonymous prayers do not leak the requester display name anywhere',
          'Test accounts excluded from public counts and admin analytics',
          'Mobile viewport (Pixel 7) renders all primary pages without overflow'
        )
      ),
      jsonb_build_object(
        'heading', '5. Test Accounts',
        'body', 'Use the seeded accounts in Admin -> Unit Testing. They carry is_test_account = true and are excluded from analytics and public counters.'
      ),
      jsonb_build_object(
        'heading', '6. Current Security Posture',
        'body', 'Last scan: 0 critical / error findings. 22 warnings, all in the same class: SECURITY DEFINER functions in the public schema are callable by anon/authenticated. Most are intentional (has_role, is_church_member, record_prayer_action). Functions not meant to be called from the client should have EXECUTE revoked from anon and authenticated roles. Re-run scans any time from the Security tab.'
      )
    )
  ),
  'active',
  '1.0'
)
ON CONFLICT (module_key) DO UPDATE SET
  module_name = EXCLUDED.module_name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  content_json = EXCLUDED.content_json,
  last_updated_at = now(),
  updated_at = now();
