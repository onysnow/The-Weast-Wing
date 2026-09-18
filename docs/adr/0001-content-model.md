# ADR-0001: Content model for incidents, press releases, and reusable embeds

**Status:** Accepted
**Date:** 2026-09-18
**Deciders:** Ony

## Context

The site has exactly one content type. `Incident` (`src/data/incidents.ts`) is a
hardcoded TypeScript array of 13 entries, and Supabase holds only
user-generated data — votes, submissions, subscribers. That split is sound:
editorial content is versioned in git, reader input is in the database.

The problem is that everything is welded to `Incident`:

- Incidents aren't pages. They are `#incident-<id>` anchors on `/`. There is no
  `$slug` route anywhere, no route loaders, and per-route metadata is
  hand-written per file.
- `ResearchDrawer` takes `established`/`notes`/`references`; `CompactMedia`
  takes `headline` for its aria-label. The media, reference and share
  components read `Incident` fields directly rather than a shared shape.
- The poll is hardwired: `incident_votes.incident_id`, and the server rejects
  anything not in `new Set(incidents.map(i => i.id))`. An article poll fails
  validation outright.

So "add press releases" currently means a parallel universe of the type, the
stats helpers, the card, the media frame, the drawer and the share bar. And the
three reusable components we want — Video, Poll, SocialPost — cannot be written
once until there is a shape for them to take.

Constraints: a single author; Lovable's agent also edits this repo; content
changes should not need a deploy pipeline we do not have; articles need real
URLs because OG cards, JSON-LD and RSS all key off them.

## Decision

Introduce a shared `ContentItem` base type in the repo, with `Incident` and
`Article` as extensions. Keep editorial content in TypeScript files. Give
articles real routes with loaders. Re-key polls on `(kind, slug, poll_key)` so
any content type can carry one.

## Options considered

### Option A: Parallel types, duplicated components

| Dimension | Assessment |
|---|---|
| Complexity | Low now, high later |
| Cost | Zero upfront |
| Scalability | Poor — a third type doubles it again |
| Familiarity | Highest |

**Pros:** nothing to design; articles ship immediately.
**Cons:** two cards that drift apart — this bug already exists, as the featured
report and the log card duplicate the same anatomy and have diverged. Embeds
get written twice.

### Option B: Shared `ContentItem` in TypeScript files — chosen

| Dimension | Assessment |
|---|---|
| Complexity | Medium, one-time |
| Cost | ~2 days of mechanical refactor |
| Scalability | Good to a few hundred items |
| Familiarity | High — the same files we edit now |

```ts
type ContentItem = {
  kind: "incident" | "article";
  slug: string; date: string; title: string; summary: string;
  media?: MediaRef; references?: Reference[]; blocks?: Block[];
};
```

**Pros:** one card, one media frame, one share bar. Content stays in git —
diffable, revertible, no CMS to pay for or log into. Fits how Lovable already
edits the repo.
**Cons:** publishing requires a commit. No scheduled publishing without extra
work.

### Option C: Move content into Supabase

| Dimension | Assessment |
|---|---|
| Complexity | High |
| Cost | Migration plus an admin UI that does not exist |
| Scalability | Best |
| Familiarity | Medium |

**Pros:** publish without deploying; drafts and scheduling are natural; the
submission queue could flow straight into it.
**Cons:** this is building a CMS. Content stops being reviewable in git. Every
page gains a database dependency on the render path.

### Option D: MDX

**Pros:** prose in prose, components inline — a natural fit for satirical
articles.
**Cons:** adds a build plugin, and Lovable's agent handling `.mdx` is unproven.
Revisit once article volume justifies it.

## Trade-off analysis

The real question is where content lives, and 13 items is not a CMS problem.
Option C's advantages all appear at a volume we do not have, and its cost — an
admin UI, auth, a draft workflow — is the most expensive thing on the table.
Option A is cheapest today and we can already see where it ends.

Option B's one genuine cost is that publishing means a commit. For a satire
site with a single author who wants to reread every joke before it goes out,
that is close to a feature.

The sub-decision that matters most: article bodies are structured blocks, not a
single HTML string. That is what lets `<Video>`, `<Poll>` and `<SocialPost>` sit
mid-article rather than only at the top, and it is the difference between
reusable components and three one-offs.

## Consequences

**Easier:** one card serves both types; embeds written once; article routes get
OG images, JSON-LD, RSS and sitemap nearly for free once `buildHead()` exists; a
third content type later is cheap.

**Harder:** publishing needs a commit; `blocks` is more to type out than prose.

**To revisit:** at several posts a week, or with a second author, Option C
becomes right — and `ContentItem` is the shape we would migrate into a table,
so this is not wasted work.

## Action items

1. [x] `src/content/types.ts` — `ContentItem`, `MediaRef`, `Block`; redefine
       `Incident` as an extension
2. [x] Split `site.tsx`; rename `IncidentMedia` to `MediaFrame`, taking a
       `MediaRef`
3. [x] Extract a card with a `variant` prop, replacing both existing card
       implementations — shipped as `IncidentCard`, not `ContentCard`. The
       duplication is gone, which was the point, but generalizing the name
       implies generalizing the shape, and there is still only one content
       type to generalize from: an article card wants a byline, a dek and a
       reading time, none of them knowable until an article exists. Rename
       when step 6 lands. Same reasoning as leaving media normalization in
       the data until then.
4. [ ] Migration: `incident_votes` to
       `content_votes(kind, slug, poll_key, voter_token, choice)`, and swap the
       server whitelist for a registry covering both types
5. [ ] `src/lib/seo.ts` with `buildHead()`; retrofit `/` and `/bea`
6. [ ] `/press` and `/press/$slug` with route loaders
7. [ ] Then the embeds — small once 1–4 exist

Steps 1–3 touch no database. Step 4 is the only migration, and it depends on
ADR-0002 (vote identity), which is still open.
