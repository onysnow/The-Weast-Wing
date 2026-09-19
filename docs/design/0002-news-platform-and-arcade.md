# Design: full news platform + the Unity arcade

**Status:** Proposed
**Date:** 2026-09-18
**Author:** Claude (with Ony)
**Related:** ADR-0001 (content model), design/0001 (modernization)

Two asks: every bell and whistle a modern news product ships, and a place to
upload Unity games that play in the browser. They are different problems. The
news half is mostly additive. The games half introduces the first genuinely
dangerous thing this codebase will contain — arbitrary third-party code — and
most of this document is about getting that right.

---

## Part A — The news platform

### A.1 What 2026 actually rewards

The Reuters Institute's 2026 trends survey is the relevant data: publishers
report Google organic traffic **down 33% globally, 38% in the US** between
November 2024 and November 2025, and expect a further **43% decline in search
referrals over three years**. Priorities moved to video, audio and owned
channels; conventional SEO was net-deprioritised.

For a one-person satire site that inverts the usual advice. Building a
recommendation engine is pointless. Building things you own is not.

### A.2 Worth building

**Newsletter.** If search halves again, the mailing list and RSS are the only
distribution nobody can take away. The subscriber table now exists and is
locked down. Next: a send path (Buttondown or Resend), a real archive page, and
inline capture units mid-article and at the end — those convert better than the
timed popup and carry no intrusive-interstitial penalty on mobile.

**Audio versions, and this is the interesting one.** Browser `SpeechSynthesis`
is free and unlistenable. A 2026 TTS API costs well under a cent per article and
produces something you'd actually play. Generate at publish time, store the MP3
in R2 (zero egress), expose a podcast RSS feed. For this site it isn't an
accessibility checkbox — a deadpan government-newsreader voice reading an
official denial *is the joke*, and it opens a distribution channel that is
growing while search shrinks.

**PWA install and offline reading.** A service worker caching article shells and
images. Cheap on this stack. Caveat: iOS evicts unused site data after roughly
seven days for non-installed sites, so treat the offline cache as opportunistic.

**Saved articles.** Supabase auth plus one table. The cheapest reason anyone has
to make an account.

**Live blog.** Append-only table, polling or SSE, `LiveBlogPosting` schema.
Only worth it with a real event peg, but as satirical scaffolding — a
"developing situation" that updates all evening — it's strong, and it's a day's
work.

**AI-crawler policy as a feature.** `robots.txt` AI directives, Cloudflare's AI
Crawl Control, `llms.txt`, full-text RSS. With search referrals collapsing,
being legible to assistants is where discovery is going. There's a
satire-specific hazard too: being scraped and surfaced *without* the framing.
`SatiricalArticle` structured data and a visible label are defensive, not
decorative.

### A.3 Deliberately not building

**Web push.** On iOS it still requires the user to add the site to their Home
Screen first. That funnel converts at approximately nobody, and the desktop
prompt is a trust tax. The newsletter does the same job better.

**Personalization.** Needs thousands of articles and real behavioural volume to
beat "newest first" plus good tag pages. Before that it's a recommender trained
on noise.

**Paywall or membership.** The subscription trend is for organisations with
staff and scoops. For satire, a tip jar with no content gate converts better,
and metered paywalls fight the share-driven distribution satire depends on.

**Self-hosted comments.** Nobody self-hosts anymore and the ones who do regret
the moderation load — which here skews toward people who didn't realise it was
satire. Giscus if you must; otherwise point at whichever platform you're active
on.

---

## Part B — The Unity arcade

### B.1 The threat, stated plainly

Uploading a "game" is uploading arbitrary JavaScript and WebAssembly. If it runs
on `theweastwing.com`, it runs with that origin's full authority:

- **It reads `localStorage` — where Supabase stores auth JWTs by default.** That
  is complete account takeover of every player, you included. This is the first
  and most important fact in this document.
- It reads non-`HttpOnly` cookies, and can `fetch()` your own API with the
  victim's session attached. Same-origin, so CSRF protection does nothing.
- It rewrites the DOM — a convincing fake login under your real domain and
  padlock.
- It can register a **service worker**, which is a persistent cache-backed MITM
  over whatever scope it gets, surviving deletion of the game.
- It persists in IndexedDB and Cache Storage after the upload is removed.

WebAssembly adds little attack surface over JavaScript — wasm has no ambient
I/O, every capability arrives through JS imports. What it adds is
*operational*: a malicious payload inside a 20 MB `.wasm` is effectively
unreviewable, and cryptomining is cheap. Treat wasm as JavaScript you cannot
read.

### B.2 The decision that makes everything else work

**Games are served from a separate registrable domain, not a subdomain.**

A subdomain is not isolation. `document.domain` is largely dead, which closes
one escape, but **cookies are scoped by domain, not origin**: a page on
`games.theweastwing.com` can set a `Domain=theweastwing.com` cookie the main app
will accept (cookie tossing, CSRF-token overwrite) and read any parent-scoped
cookie. They are also same-site, so `SameSite` protections never fire between
them.

This is why Google's sandbox domain is `googleusercontent.com` and not
`sandbox.google.com`. itch.io serves games from `html-classic.itch.zone`;
Newgrounds from `uploads.ungrounded.net`. Everyone who does this seriously buys
a second domain.

There is a second reason, and it's the one that decides the design. Unity needs
`allow-scripts` **and** `allow-same-origin` on the iframe — without
`allow-same-origin` the frame gets an opaque origin and loses `localStorage`
(PlayerPrefs throws) and IndexedDB (the wasm compilation cache, so every load
recompiles). That token pair is catastrophic *when the frame is same-origin with
the parent*, because the framed page can then reach `parent.document`, strip the
`sandbox` attribute and reload itself unsandboxed. **Cross-domain, the same pair
is safe.** So the second domain is not defence in depth; it is the thing that
makes the only workable Unity configuration safe at all.

Cost: about £10/year. It is the only load-bearing purchase in this document.

We can also do better than itch.io for free: give each game its own subdomain of
the sandbox domain (`abc123.weastarcade.com`, wildcard cert, one Worker route).
That buys per-game `localStorage`/IndexedDB isolation, which itch.io explicitly
does not have — one game there can exhaust the shared quota or read another
game's saves.

### B.3 Architecture

```
  theweastwing.com                          weastarcade.com   (separate eTLD+1)
  ┌────────────────────────┐                ┌──────────────────────────────┐
  │ Article / arcade page  │                │ Games Worker                 │
  │                        │   iframe       │  • auth + visibility check   │
  │  <iframe               │ ─────────────▶ │  • Supabase: is this game    │
  │    src=https://abc123. │                │    published? (kill switch)  │
  │      weastarcade.com>  │                │  • sets Content-Encoding,    │
  │                        │                │    Content-Type, CSP, CORP   │
  │  CSP: frame-src        │                │  • Workers Cache in front    │
  │       weastarcade.com  │                └───────────┬──────────────────┘
  └────────────────────────┘                            │
                                                ┌───────▼────────┐
                                                │ R2: game builds │
                                                │ /g/<id>/<hash>/ │
                                                └─────────────────┘
```

**Why a Worker rather than a public R2 bucket.** Historically the proxy cost a
request per asset. Cloudflare shipped **Workers Cache in July 2026** — a tiered
cache in front of the Worker, where a cache hit doesn't execute the Worker at
all and isn't billed. That removes the cost objection, and we need the Worker
anyway for the publish/unpublish kill switch, per-game headers, and keeping the
bucket private. (`r2.dev` is development-only: rate-limited, no cache, no WAF.
Never ship on it.)

### B.4 Serving Unity correctly

Unity is unusually fussy here and most "my WebGL build won't load" reports trace
to these four lines.

| Asset | Headers |
|---|---|
| `*.wasm.br` | `Content-Type: application/wasm`, `Content-Encoding: br` |
| `*.js.br` | `Content-Type: application/javascript`, `Content-Encoding: br` |
| `*.data.br` | `Content-Type: application/octet-stream`, `Content-Encoding: br` |
| all | `Cache-Control: public, max-age=31536000, immutable, no-transform` |

- `application/wasm` is what enables `WebAssembly.instantiateStreaming`. Get it
  wrong and you lose streaming compilation and add seconds to load.
- Wrong or missing `Content-Encoding` hands Unity's loader raw compressed bytes
  and fails hard.
- **`no-transform`** forbids Cloudflare altering compression. Polish, Rocket
  Loader and Mirage all decompress-then-recompress; `no-transform` is the
  belt-and-braces.
- Passing Brotli through a Worker needs the **`brotli_content_encoding`
  compatibility flag**, or the runtime re-encodes and you get double-compressed
  or stripped bodies.
- Cloudflare does **not** cache `.wasm`/`.data` by default — they aren't in the
  default extension list. Add a Cache Rule or pay Class B on every request.
- Turn Unity's **Decompression Fallback off**. It exists for hosts you can't
  configure, adds ~150 KB of JS, and disables streaming instantiation.

**Build settings we require of uploads** (from Unity's own web guidance):
Brotli compression, Strip Engine Code on, Managed Stripping High, Code
Optimization "Disk Size with LTO", Exceptions None, Data Caching on,
`targetFrameRate = -1`, `vSyncCount = 0`.

**Memory is the real mobile constraint.** WebKit kills the content process
around ~2 GB, and wasm modules declaring 2 GB maximum memory fail at
instantiation on iOS Safari. Cap Maximum Memory Size at **256–512 MB** for
anything meant to work on a phone, set Initial Memory Size near the measured
peak (Safari handles one large upfront allocation better than incremental
growth), and keep bundles under ~30 MB.

**WebGPU changed in 2026.** Unity 6.6 (August/September 2026) graduated WebGPU
out of experimental — compute shaders, GPU skinning, VFX Graph in the browser.
Anything written before that calling it experimental is stale. **Still ship a
WebGL2 fallback**: list WebGPU above WebGL 2 in Graphics APIs and let Unity try
in order. There's a known 6.6 failure mode — blank canvas from shader-variant
fallback — so both paths need testing.

**Size expectations, so nobody is surprised:** an *empty* Unity 6 project is
~14.7 MB Brotli, ~12.5 MB with Disk Size + LTO. That's the floor. Small 2D:
5–15 MB. Modest 3D: 20–60 MB.

This also settles where builds live. **Workers Static Assets caps at 25 MiB per
file**, so a 40 MB `.data` cannot be served that way even though the `.br`
version usually fits. R2 has no such problem, and its egress is free.

### B.5 The embed

```html
<iframe src="https://abc123.weastarcade.com/"
        sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-downloads"
        allow="fullscreen; autoplay; gamepad; xr-spatial-tracking"
        referrerpolicy="no-referrer" allowfullscreen></iframe>
```

Never `allow-top-navigation` — it lets a game redirect the whole site to a
phishing page. Response headers on the game frame:

```
Content-Security-Policy: default-src 'none'; script-src 'self' 'wasm-unsafe-eval' blob:;
  worker-src blob: 'self'; connect-src 'self'; img-src 'self' data: blob:;
  media-src 'self' data: blob:; style-src 'self' 'unsafe-inline';
  frame-ancestors https://theweastwing.com
X-Content-Type-Options: nosniff
Cross-Origin-Resource-Policy: same-site
Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=(), usb=()
```

`connect-src 'self'` is the valuable line: it stops an uploaded game
exfiltrating anywhere or calling the Supabase project. `frame-ancestors` stops
hotlinking. **Leave Unity threads off** — SharedArrayBuffer needs full
cross-origin isolation on both frames, which breaks third-party embeds and is
why threaded builds are broken on most game portals.

### B.6 Upload pipeline

Validate a zip server-side and you inherit zip-slip, symlink entries, zip
bombs, entry-count explosions and lying size headers. A Cloudflare Worker is a
bad place to meet them: **128 MB memory**, no filesystem, and a 100 MB request
body cap (that limit is set by the *zone plan*, not the Workers plan — being on
Workers Paid does not raise it).

**So don't accept the archive at all.** Unzip client-side with `fflate`,
validate the manifest in the browser, upload each file through a
Worker-brokered presigned PUT. A zip bomb then only harms the uploader's own
tab. Server-side validation reduces to string work on each object key:

- reject any normalized path escaping the root, or absolute
- extension allowlist: `.js .wasm .data .json .html .css .png .jpg .webp .br .gz .symbols.json`
- entry count ≤ 500 (a Unity build is 10–60 files)
- total bytes ≤ a per-game cap
- require a recognisable Unity layout: `index.html` + `Build/*.loader.js`

Note R2 **does not support POST policy uploads** (S3-style browser form
uploads) — that returns 501 and catches people copying S3 tutorials. Presigned
PUT is supported, 1s to 7 days.

If uploads ever open to strangers, move extraction into a **Cloudflare
Container** triggered from a Queue — they went GA in 2026, and a 30-second
extraction is a fraction of a cent well inside the included tier.

**Virus scanning: skip it.** Signature AV is built for PE/ELF and Office macros;
a malicious Unity build is JS and wasm, which ClamAV waves straight through.
It would buy the appearance of diligence. The real controls are the extension
allowlist, the isolation domain, and `connect-src`.

### B.7 Data model

```sql
create table games (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  subdomain     text unique not null,      -- abc123.weastarcade.com
  title         text not null,
  blurb         text,
  cover_path    text,
  build_hash    text not null,             -- R2 prefix; immutable per version
  bytes         bigint not null,
  engine        text not null default 'unity',
  graphics_api  text[] default '{webgpu,webgl2}',
  mobile_ok     boolean not null default false,
  status        text not null default 'draft',   -- draft|published|unpublished
  published_at  timestamptz,
  created_at    timestamptz not null default now()
);

create table game_plays (                  -- aggregate only, no per-user rows
  game_id  uuid references games(id),
  day      date,
  plays    int not null default 0,
  primary  key (game_id, day)
);
```

`status` is the kill switch: the games Worker checks it before serving, which is
the reason the bucket is private and proxied. `build_hash` in the R2 prefix
makes every version immutable and lets everything cache for a year.

### B.8 Cost

| Item | Monthly |
|---|---|
| Sandbox domain | ~£0.80 (£10/yr) |
| R2, 50 games × 100 MB = 5 GB | ~$0.08 |
| R2 Class B, 1M gets | $0.36 |
| Workers Paid | $5 |
| **Total** | **under $7** |

Storage is noise. The only thing that could cost real money is failing to set
cache rules and paying Class B on every asset of every play.

---

## Part C — Sequencing

The arcade depends on nothing in the news platform, so it can run in parallel —
but it should not start before Phase 1 of design/0001 (tests and CI), because
the arcade is the part where a mistake has security consequences.

| Phase | Work |
|---|---|
| C1 | Buy the sandbox domain. Games Worker + R2, serving one hand-uploaded build via `wrangler r2 object put`. Prove the headers, Brotli passthrough and iframe sandbox on a real Unity build before building any UI. |
| C2 | `games` table, arcade index and detail pages, kill switch, play counts. |
| C3 | Client-side unzip + presigned upload + validation. Owner-only. |
| C4 | Per-game subdomains; consider the Public Suffix List submission. |
| C5 | Newsletter send path and archive; inline capture units. |
| C6 | TTS pipeline and podcast feed. |
| C7 | PWA offline, saved articles. |
| C8 | Live blog, when there's an event worth it. |

**C1 is deliberately a spike.** Unity WebGL on a CDN has a long tail of
header-related failure modes, and finding them with one build and curl is an
afternoon; finding them after building an upload UI is a week.

---

## Open questions

1. **Who uploads?** This design assumes Ony uploads his own games, with the
   architecture ready for more. Opening it to strangers adds moderation, abuse
   handling, storage quotas and per-uploader rate limits — and makes the
   Container extraction path mandatory rather than optional. The isolation
   model is the same either way, which is why it's worth building correctly now.
2. **Sandbox domain name**, and whether to pursue Public Suffix List inclusion
   (makes per-game subdomains cross-*site*, not merely cross-origin).
3. **Do games need accounts?** Leaderboards or saves that follow a player across
   devices would mean the game frame talking to an API — which conflicts with
   `connect-src 'self'`. Solvable with a narrow `postMessage` bridge to the
   parent, but it's a real design decision, not a detail.

## What to revisit

- If a game ever needs threads/SharedArrayBuffer, the whole cross-origin
  isolation question reopens and third-party embeds on that page break.
- If the arcade outgrows one Worker, per-game subdomains already give a clean
  sharding boundary.
- Unity's WebGL floor (~12.5 MB for an empty project) is the hard limit on
  "instant play". If that becomes the constraint, the answer is a different
  engine for small games, not more Unity optimization.
