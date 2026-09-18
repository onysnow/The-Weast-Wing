# Modernization design: The Weast Wing

**Status:** Proposed
**Date:** 2026-09-18
**Author:** Claude (with Ony)
**Related:** ADR-0001 (content model)

The brief was "not average — the best it can be." This document says what that
means concretely for this codebase, what it costs, and — as importantly — what
to deliberately leave out. Every number below was measured against this repo on
2026-09-18, not estimated.

---

## 1. Requirements

### Functional

A satirical news publication: a live counter, an incident log, press releases
with real URLs, reusable video / poll / social-post components, reader
submissions and polls, a mailing list.

### Non-functional

| Requirement | Target | Rationale |
|---|---|---|
| LCP (p75, mobile) | ≤ 2.0s | 500ms of headroom under Google's 2.5s |
| INP (p75) | ≤ 150ms | under the 200ms threshold |
| CLS (p75) | ≤ 0.05 | half the 0.1 threshold; achievable on a static-ish site |
| Initial-route JS | ≤ 170 KB gz | the long-standing defensible ceiling |
| Accessibility | WCAG 2.2 AA | EN 301 549 v4.1.1 (2026) now references 2.2 |
| Availability | Cloudflare edge default | no custom infrastructure |
| Cost | ≈ £0–20/month | hobby project economics |

### Constraints that shape everything

1. **One author, intermittent time.** Anything requiring routine operational
   attention will rot. This rules out self-hosted anything.
2. **Lovable co-owns the repo.** `vite.config.ts` delegates to
   `@lovable.dev/vite-tanstack-config`, which warns that adding plugins
   manually breaks the app. Any build-layer change must go through that config's
   escape hatch or be negotiated with Lovable's defaults.
3. **Two agents edit this code.** Structure has to survive an AI agent editing
   it without the whole design in its head. That argues for small files,
   explicit types and tests that fail loudly.
4. **It is satire about a real person.** Labelling and provenance are not
   polish; see §6.

---

## 2. Measured baseline

Production build, 2026-09-18:

```
Initial-route JS      232 KB gz   (218 KB in ONE chunk + 14 KB routes)   ✗ 62 KB over budget
Total client JS       799 KB raw / 233 KB gz across all chunks
CSS                   ~26 KB gz
Hero video            555 KB (H.264 only, no AV1 source)
DOM nodes (home)      1,980
Tests                 0
CI                    none  (no .github/)
Error monitoring      none
Analytics             none
RUM / field data      none
```

Three specific findings behind that number:

- **There is no route-level code splitting.** 218 KB of the 232 sits in a single
  `index` chunk. `/bea` adds 1 KB, which tells you everything: the split is
  nominal.
- **`@supabase/supabase-js` is in the browser bundle** — `GoTrueClient` and
  `RealtimeClient` both appear in it. As of the current `dev` branch **nothing
  in the browser imports it any more**; the last consumer was the email popup,
  which now goes through a server function. The only remaining reference is a
  commented-out line in `client.ts`. This is free weight.
- **Unused shadcn dependencies are correctly tree-shaken.** recharts, embla,
  cmdk, vaul, react-day-picker and input-otp all appear zero times in the
  bundle. Do not spend time on this — it is already handled. (11 of the 46
  component files are actually imported, so there is a tidiness problem, but not
  a performance one.)

---

## 3. Target architecture

```
                          ┌──────────────────────────┐
  Reader ───────────────▶ │  Cloudflare Workers      │
                          │  (Nitro cloudflare-module)│
                          └───────────┬──────────────┘
                                      │
              ┌───────────────────────┼────────────────────────┐
              │                       │                        │
      ┌───────▼───────┐      ┌────────▼────────┐      ┌────────▼────────┐
      │ SSR + loaders │      │ Server routes   │      │ Server fns      │
      │ TanStack Start│      │ /rss /sitemap   │      │ votes, tips,    │
      │               │      │ /og/:slug       │      │ signups         │
      └───────┬───────┘      └─────────────────┘      └────────┬────────┘
              │                                                │
      ┌───────▼────────────────┐                     ┌─────────▼────────┐
      │ Content (in repo, TS)  │                     │ Supabase         │
      │ incidents │ articles   │                     │ service role only│
      │ ContentItem (ADR-0001) │                     │ RLS: deny by dflt│
      └────────────────────────┘                     └──────────────────┘
```

The shape is already right. Content in git, reader data in Postgres, all
privileged access behind server functions. What is missing is everything around
it: the feedback loops (tests, CI, monitoring) and the delivery layer (splitting,
images, headers).

---

## 4. Workstreams

### 4.1 Performance — get under the budget

| Action | Est. saving | Confidence |
|---|---|---|
| Drop `supabase-js` from the client graph | 40–60 KB gz | high — measured present, zero consumers |
| Route-level code splitting (lazy-load `/bea`, article routes, the submission form) | 20–40 KB gz off first paint | medium |
| Replace the always-mounted `EmailSignupPopup` with a lazy import on the 6s timer | ~5 KB gz | high |
| Lucide: verify per-icon imports survive tree-shaking | 0–15 KB gz | unknown, measure |

Budget enforcement: **`size-limit` in CI**, asserting on the initial-route
chunk. Deterministic, unlike a Lighthouse score.

The hero is the LCP element and it is a 555 KB H.264 video. Add an AV1 source
(H.264 stays as the mandatory fallback — AV1 is ~83% full support, and Safari
needs hardware decode), and make sure the poster carries `fetchpriority="high"`
and is never lazy-loaded.

**Images:** AVIF with a WebP fallback in `<picture>`, drop JPEG. `srcset`/`sizes`
on plain `<img>` for resolution switching — reserve `<picture>` for format
fallback and art direction. Cloudflare Images gives 5,000 transforms/month free
for images stored outside Cloudflare, which at a few hundred images × 4 widths
is comfortably inside the free tier.

### 4.2 Confidence — tests and CI

Current versions: Vitest 5.0.1, Playwright 1.63, `@testing-library/react`
16.3.3. **Vitest Browser Mode became stable in v4** — for a Radix-heavy UI this
matters, because jsdom lies about focus management, portals and
`:focus-visible`, which is precisely what Radix does.

The pyramid for a site this size is mostly integration:

**Worth testing**
- Server functions touching Supabase with the service role — the actual risk surface
- Date and streak maths (`incident-stats.ts`) — just changed timezone behaviour with nothing pinning it
- Content array → route mapping
- 3–5 Playwright smoke paths: home renders, an article renders with correct meta, 404, nav
- `@axe-core/playwright` on 5–8 pages, inside the existing Playwright job

**Not worth testing:** presentational components, shadcn components (we didn't
write them), markup snapshots, anything asserting Tailwind class strings or
generated CSS.

Structure server functions so `createServerFn` is a thin shell over a plain
exported async function, and unit-test the plain function. TanStack Start's
testing story is thin and the maintainers have said they will only support
Vitest here — plan for friction rather than being surprised by it.

**CI:** one GitHub Actions job — `actions/checkout@v6`, `oven-sh/setup-bun@v2`,
`bun install --frozen-lockfile`, then typecheck, lint, test, build, size-limit.
A second PR-only job for Playwright against the preview URL. Skip Bun dependency
caching until measured; setup-bun deliberately omits it.

**Preview deploys:** Cloudflare now recommends Workers with Static Assets over
Pages for new projects, and we already emit a Workers bundle. Use **Workers
Builds** with per-branch preview URLs rather than driving wrangler from Actions —
fewer moving parts and no API token in CI.

### 4.3 Knowing what is happening

We currently cannot answer "is the site fast for real people" or "did that
deploy break anything."

- **Sentry** free tier (5K errors/month) is enough. Budget half a day: the
  TanStack Start + Workers integration has documented rough edges, including
  that SSR render exceptions are *not* caught by the middleware and need manual
  `captureException`.
- **Cloudflare Web Analytics** on day one — free, already in the account. Its
  script is ~10.7 KB against Plausible's ~1.9 KB, which is real when budgeting
  100 KB; revisit if that shows up in the numbers or if goals are needed.
- **`web-vitals` reporting LCP/INP/CLS to a Worker endpoint.** This is the only
  way to know real field numbers, and it costs nothing. Lighthouse is a
  regression detector, not a measure of what users experience — INP is not even
  in the Lighthouse score.
- **OpenTelemetry: no.** It buys distributed tracing across services that do not
  exist here.

### 4.4 Structure

Per ADR-0001: `ContentItem` base type, `site.tsx` split, one `ContentCard`,
`content_votes` keyed on `(kind, slug, poll_key)`, `buildHead()`, article routes
with loaders. Plus: delete the 35 unused shadcn component files — they are not
bundle weight, but they are 35 files an agent has to read past.

Route loaders are the piece with the widest blast radius. React Query is
installed, a provider is mounted, and there is not one `useQuery` in the
codebase. Polls currently render `0%` into the SSR HTML and pop to real numbers
after hydration. Loaders fix that class of problem generally.

### 4.5 Security and supply chain

**Headers.** CSP with per-request nonces plus `'strict-dynamic'` is the current
consensus and is the right fit for SSR, where the script set is dynamic. Expect
a day of `Content-Security-Policy-Report-Only` iteration because of Vite's
inline module preload. Also: HSTS, `nosniff`, `Referrer-Policy`,
`frame-ancestors 'none'`, `base-uri 'self'`, and a minimal `Permissions-Policy`.

**COOP/COEP: skip.** Cross-origin isolation exists to unlock `SharedArrayBuffer`;
COEP will break third-party embeds for nothing in return.

**Supply chain is the biggest 2026 delta and it touches this project directly.**
The Shai-Hulud family of self-propagating npm worms continued through 2026, and
**the TanStack namespace itself was compromised on 11 May 2026.** Two structural
lessons: provenance attestation is necessary but not sufficient (multiple waves
shipped malicious packages carrying valid SLSA L3 provenance, because the
attacker pushed to `main` and let the project's own release workflow publish);
and npm classic tokens were permanently revoked in December 2025.

The highest-leverage single line of configuration in this entire document:

```json
{ "minimumReleaseAge": "7 days" }
```

Renovate with a cooldown. Nearly every worm wave was caught and yanked within
hours to days; a one-week quarantine would have prevented all of them, for
roughly zero effort. Alongside: `bun install --frozen-lockfile` in CI, GitHub
Actions pinned to commit SHAs, `--ignore-scripts` where feasible, Dependabot
alerts on. Do not buy a supply-chain product at this scale.

### 4.6 Publication standards

Covered in the audit and not repeated here, but they belong in the definition of
"best it can be": `SatiricalArticle` JSON-LD, an above-the-fold satire marker on
every card and article, OG images with the badge baked into the picture (there
are currently no OG images at all, despite the site declaring
`summary_large_image`), RSS + JSON Feed, sitemap, and a real disclaimer page.

The satire labelling is not decoration. Meta ended US third-party fact-checking
in 2025 in favour of crowd-sourced notes, and the published fact-checker
standard is that a satire indicator must be visible without scrolling or
clicking. A news-style domain with journalistic prose and a government layout
raises that bar rather than lowering it.

---

## 5. Sequencing

Ordered so that each phase makes the next cheaper, and so that nothing depends
on a decision that has not been made.

**Phase 1 — feedback loops (no user-visible change).** Vitest + the first tests
on date/streak logic; GitHub Actions; `size-limit` with the budget recorded as
failing; Renovate with the cooldown. *Everything after this is safer.*

**Phase 2 — structure (ADR-0001 steps 1–3).** `ContentItem`, split `site.tsx`,
one `ContentCard`, delete the 35 dead component files.

**Phase 3 — the cheap performance wins.** Drop `supabase-js` from the client
graph, route-level splitting, lazy popup. Expect to land under 170 KB here; the
budget assertion flips to passing.

**Phase 4 — publication layer.** `buildHead()`, article routes with loaders,
JSON-LD, OG image endpoint, RSS, sitemap, satire labelling.

**Phase 5 — the embeds.** Video (lite-youtube facade), Poll (needs the
`content_votes` migration, which needs ADR-0002), SocialPost (self-rendered).

**Phase 6 — the long tail.** Sentry, analytics, web-vitals RUM, CSP, AV1 hero,
image pipeline, design-system tokens, motion system.

---

## 6. Explicitly not doing

Named so nobody relitigates them later:

OpenTelemetry · Lighthouse CI as a gate (`@lhci/cli` has not shipped since June
2025) · Pa11y (redundant with axe) · COEP · a headless CMS · migrating content
into Postgres · unit tests for presentational components · assertions on Tailwind
output · designing against WCAG 3.0 (still a Working Draft with no conformance
date) · AV2 (finalised May 2026, not web-viable) · a paid analytics plan before
goals are needed · chasing shadcn tree-shaking that already works.

---

## 7. What to revisit

- **Content in git** stops being right at several posts a week or a second
  author. `ContentItem` is the shape that would migrate into a table.
- **Automated accessibility tooling caps at ~57% of real issues** (Deque's own
  figure across 13,000+ pages). Budget one manual keyboard and screen-reader
  pass, then repeat on significant changes.
- **Vite 8 shipped March 2026 with Rolldown as the default bundler.** If the
  Lovable config is still on `rolldown-vite` (last published January 2026),
  moving to plain Vite 8 is the right call — and Vitest 5 requires Vite ≥ 6.4.
  This one is Lovable's call, not ours.
- **EAA has applied since June 2025** and EN 301 549 v4.1.1 now references WCAG
  2.2. A purely informational satire site with no commerce is a weak
  enforcement target; if the site ever sells anything into the EU, AA becomes a
  requirement rather than a goal.
