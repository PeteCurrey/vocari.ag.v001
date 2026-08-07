# {{BRAND}} — Full Build Prompt Sequence (Antigravity)

**Working name:** Vocari (from *vocare*, to call). Alternates: Ascentra, Traject, Rungs.
Every prompt uses `{{BRAND}}` — find/replace once you've decided. Domain check before Phase 0.

**Companion doc:** `pathway-graph-scope.md` — the data model, source map and verification tiers. Antigravity should be given that file as context for Phases 1–3.

---

## Standing rules — prepend to EVERY prompt

```
STANDING RULES FOR THIS PROJECT

1. VERIFICATION: Do not report a phase complete based on your own summary.
   Completion is evidenced by terminal output, curl responses against a running
   server, build logs, or test output pasted verbatim. Prose claims of
   completion are treated as unverified hypotheses.

2. NO SILENT FALLBACKS: If data is unavailable, render an explicit unavailable
   state. Never substitute cached, hardcoded, placeholder or invented values.
   This applies especially to funding amounts, salaries, course availability
   and registration requirements.

3. NO FABRICATED CONTENT: Do not invent statistics, provider names, testimonials,
   case studies, partner logos, or qualification details. If content is needed
   and not supplied, insert a clearly marked TODO block. An invented funding
   figure in this product costs a real person real money.

4. TYPE SAFETY: No `ignoreBuildErrors`, no `ignoreDuringBuilds`, no `any` used
   to silence the compiler. Build must pass clean.

5. STOP AND ASK: If a phase requires a decision not specified here, stop and
   ask. Do not assume.
```

---

## Stack

Next.js 15 (App Router) · TypeScript strict · Supabase (Postgres + Auth + RLS) · Vercel · Tailwind · GSAP ScrollTrigger with scrub (never IntersectionObserver) · Lenis · Resend · Stripe · Anthropic API.

### Font licensing — resolve before Phase 0

The board specifies **Neue Haas Grotesk Display** and **Editorial New**. Both are commercially licensed (Monotype and Pangram Pangram respectively) and neither can be self-hosted without purchase. Two options:

- **Buy the licences** — roughly £300–600 combined for web use. Correct if this becomes a real product.
- **Ship free stand-ins now** — `Inter Tight` (display, very close to NHG's geometry) and `Instrument Serif` (editorial accents). Both on Google Fonts, both load via `next/font`.

Prompts below assume the stand-ins with a single swap point in the token file. **Do not let Antigravity self-host a paid font from a CDN scrape.**

---

## Design system — two registers, one token set

The Avorria board is Precision Luxe aimed at enterprise buyers. That is exactly right for the **partner/provider** side and wrong for the **consumer** side, where the user is a care worker on £24k wondering whether she can afford to retrain. Same tokens, different weighting.

| | Consumer surface | Partner surface |
|---|---|---|
| Base | Ivory `#F7F5F2` dominant | Charcoal `#121417` dominant |
| Type scale | Larger, more generous line height | Tighter, denser |
| Language register | Plain English, second person | Institutional, metric-led |
| Cobalt `#0057FF` | Primary action | Accent only |
| Coral `#FF6B57` | Warmth accent, progress states | Alert/attention only |
| Photography | People, workplaces, hands, real settings | Architectural, abstract, material |

**Tokens (single source of truth, `/lib/design/tokens.ts`):**

```
ivory        #F7F5F2
warm-stone   #E9E6E1
silver       #C7CCD1
graphite     #2B2D31
charcoal     #121417
cobalt       #0057FF
coral        #FF6B57
```

---

# PHASE 0 — Foundation, design system, shell

```
Initialise a Next.js 15 App Router project in TypeScript strict mode for
{{BRAND}}, a UK careers pathway platform.

SETUP
- Next.js 15 App Router, TypeScript strict, Tailwind, ESLint
- next/font: Inter Tight (display + UI), Instrument Serif (editorial accents),
  JetBrains Mono (data, codes, qualification numbers)
- Lenis smooth scroll, GSAP + ScrollTrigger installed and provider-wrapped
- Supabase client (browser + server + service-role, correctly separated)
- Vercel-ready config, no build error suppression

DESIGN TOKENS — create /lib/design/tokens.ts as the ONLY place colours,
type scale, spacing and easing are defined. Extend tailwind.config.ts from
it. No hardcoded hex anywhere else in the codebase.

  ivory #F7F5F2 · warm-stone #E9E6E1 · silver #C7CCD1
  graphite #2B2D31 · charcoal #121417
  cobalt #0057FF · coral #FF6B57

TWO SURFACE REGISTERS — implement as a `surface` context:
- `consumer`: ivory-dominant, generous type scale (base 17px, 1.65 line
  height), cobalt primary actions, coral for progress and encouragement states
- `partner`: charcoal-dominant, dense scale (base 15px, 1.5), cobalt as accent,
  coral reserved for alerts
Components read surface from context and style accordingly. Do not build two
component libraries.

COMPONENT PRIMITIVES (both registers):
Button (primary / secondary / text-link, all with arrow affordance),
Card, MetricCard, InsightCard, DownloadCard, Checkbox, Radio, Toggle,
StepIndicator (01/02/03/04 style), Tag, Badge, Callout, SourceStamp.

SOURCE STAMP — build this now, it is used everywhere:
A small mono-type component rendering `SOURCE · DATE` beneath any factual
value, with a `stale` variant that renders "UNVERIFIED — confirm before
acting" in coral when a review date has passed. Props: sourceName, sourceUrl,
verifiedAt, reviewDue.

MOTION: GSAP ScrollTrigger with scrub for all scroll-linked animation.
Never IntersectionObserver. Respect prefers-reduced-motion — all scrub
animations resolve to their end state immediately when set.

ROUTE SHELL (stubs only, no content yet):
  /                      consumer home
  /careers               occupation index
  /careers/[occupation]  occupation detail
  /cost                  £0 to Qualified calculator
  /courses               course search
  /account/*             learner dashboard
  /partners              partner marketing
  /partners/dashboard/*  provider portal
  /admin/*               internal verification
  /about /insights /contact

OUT OF SCOPE: all content, all data, all auth logic.

ACCEPTANCE (paste verbatim):
- `npm run build` full output, clean, no suppression flags
- `npx tsc --noEmit` clean
- Screenshot of a token test page rendering every primitive in BOTH surface
  registers side by side
- Confirm zero hardcoded hex outside tokens.ts: `grep -rn "#[0-9A-Fa-f]\{6\}" app/ components/ --include=*.tsx | grep -v tokens`
```

---

# PHASE 1 — Data layer and ingest

> Give Antigravity `pathway-graph-scope.md` as context before this prompt.

```
Implement the {{BRAND}} pathway data layer in Supabase, per the schema in
pathway-graph-scope.md sections 2 and 3.

TABLES (all with created_at, updated_at, and the provenance block):
occupations, routes, steps, requirements, qualifications,
funding_eligibility, registration_bodies, registration_requirements,
providers, course_instances, occupation_soc_map

PROVENANCE — every factual table carries:
  source_name, source_url, retrieved_at, verified_by, verified_at,
  review_due, confidence ('confirmed' | 'inferred' | 'provisional')
Enforce via a shared column set. A row with confidence='provisional' or
verified_at IS NULL must never be exposed by a public read.

STAGING PATTERN: every ingest writes to `staging_*` tables. Nothing reaches
live tables without passing through a diff-review queue (Phase 2). No
auto-promotion, ever, for funding_eligibility.

INGEST JOBS (Next.js route handlers, cron-scheduled on Vercel):
1. Ofqual Register API → qualifications
   Full sync nightly. Capture QAN, title, awarding org, RQF level, TQT,
   status, operational_end_date. Flag newly-withdrawn quals into the review
   queue — a withdrawn qualification on a live pathway is a critical error.
2. Skills England / das-courses-api → apprenticeship standards
   Standard reference, level, typical duration, max funding band, typical
   job titles (free text — store for fuzzy joining, do not auto-join).
3. NCS Course Directory monthly transparency CSV → providers, course_instances
   Parse, geocode venues to lat/lng, store region and postcode. This file is
   published monthly on gov.uk under OGL. Handle schema drift defensively —
   log and halt on unexpected columns rather than silently dropping.

JOIN LAYER — `/lib/joins/`:
- occupation ↔ SOC 2020 code: manual seed table, human-authored
- occupation ↔ apprenticeship standard: fuzzy candidate generation from
  typical job titles, written to review queue for human confirmation.
  NEVER auto-confirm.
- qualification ↔ course_instance: join on QAN. This is the reliable one.
- occupation ↔ registration body: manual seed table, no automation exists

Each join row stores match_method and match_confidence.

RLS: public read only on rows where confidence='confirmed' AND
verified_at IS NOT NULL. Everything else service-role only.

OUT OF SCOPE: UI, salary data (Phase 8), seeding real occupation content.

ACCEPTANCE:
- Migration files, and `supabase db diff` output showing clean apply
- Run each ingest job. Paste row counts before/after for every table.
- `curl -s localhost:3000/api/admin/ingest/status | jq` showing last-run
  timestamp, row counts and error count per source
- Deliberately corrupt one column name in a test CSV and paste the output
  proving ingest HALTS rather than dropping the column
- Paste a query proving no row with confidence='provisional' is readable
  through the public (anon key) client
```

---

# PHASE 2 — Verification admin

```
Build the internal verification console at /admin. This is the quality gate
the entire product depends on — build it before any consumer surface.

AUTH: Supabase Auth, email allowlist, role='admin'. Middleware-protected.

REVIEW QUEUE (/admin/queue) — unified inbox of:
- New staging rows awaiting promotion
- Diffs where an ingest changed an existing live value
- Fuzzy join candidates awaiting human confirmation
- Rows past review_due (grouped by verification tier)
- Qualifications newly marked withdrawn that appear on a live route

Each item: side-by-side old vs new, source URL as a clickable link, and
Approve / Reject / Edit-and-approve. Approving writes verified_by,
verified_at, and sets review_due per tier: A = +90 days, B = +180, C = +365.

TIER GATE — hard rule, enforce in the database with a trigger:
An occupation with tier='A' cannot be set to published=true unless EVERY
one of its routes, steps, requirements and registration_requirements has
confidence='confirmed' AND verified_by IS NOT NULL. Not a warning. A
constraint that raises.

PATHWAY EDITOR (/admin/occupations/[id]):
Visual route builder — add routes, order steps, attach requirements, resolve
requirements to qualifications. Each field has an inline provenance editor
(source name, URL, date). Cannot save a factual field without a source URL.

FUNDING RULES EDITOR (/admin/funding):
Scheme, learner conditions, validity window. Must support Advanced Learner
Loans and LLE running CONCURRENTLY — ALL extended to 2027, LLE applies to
courses starting on or after 1 January 2027. A qualification can have
multiple funding_eligibility rows with different validity windows and the
resolver must pick by course start date, not by today's date.

HEALTH DASHBOARD (/admin): rows past review_due by tier, ingest freshness
per source, published occupations by tier, count of live routes containing
a withdrawn qualification (must be zero).

ACCEPTANCE:
- Attempt to publish a tier-A occupation with one unverified step. Paste the
  database error proving the trigger fired.
- Approve one queue item. Paste before/after row showing verified_by,
  verified_at and review_due correctly set.
- Create a qualification with both an ALL row (valid to 2027) and an LLE row
  (valid from Jan 2027). Paste resolver output for a course starting
  Nov 2026 and one starting Feb 2027, proving different schemes resolve.
- Screenshot of health dashboard with real counts
```

---

# PHASE 3 — Consumer core: discovery and pathway explorer

```
Build the consumer-facing discovery and pathway experience. Surface register
= consumer (ivory-dominant, generous scale).

/careers — OCCUPATION INDEX
Filterable grid: sector, RQF level of entry, earn-while-you-learn,
no-qualifications-needed, typical time to qualify. Each card: title, plain
summary, entry salary with SourceStamp, time to qualify, route count.
Filters must be URL-driven (searchParams) so states are linkable and
indexable.

/careers/[occupation] — THE CORE PAGE
Sections in order:
1. Hero — title, plain-English summary, three key metrics (entry salary,
   time to qualify, typical cost to you) each with SourceStamp
2. Is this you? — physical demands, work patterns, honest downsides.
   Include what people find hard about it, not just the sell.
3. Routes in — the pathway visualisation. THE flagship component.
4. What you'd need — requirements grouped as qualifications, registrations,
   checks, licences
5. Registration and regulation — for tier A/B, the regulator named with a
   direct link and a standing "always confirm with the regulator" notice
6. What it pays — entry, experienced, with source and date
7. Courses near you — postcode input, live results (Phase 6)
8. Related careers — sideways moves and progression

PATHWAY VISUALISATION COMPONENT:
Horizontal stepped track per route, tabs to switch between routes. Each step
is a node: label, duration, cost to learner, blocking vs parallel. Steps
expand in place to reveal qualifications and funding. GSAP ScrollTrigger
with scrub draws the track as it enters view. Fully accessible: keyboard
navigable, semantic ordered list underneath, screen-reader coherent,
resolves to end state under prefers-reduced-motion.

WHERE ARE YOU NOW? — route personalisation
Three questions (highest qualification, currently working in the sector,
age band). Filters routes to those actually open to the user and reorders
by suitability. Stored in localStorage, no account required. This is the
retention hook — it makes the page feel like advice rather than an article.

CRITICAL: every factual value renders through SourceStamp. A value past
review_due renders the coral unverified state. Never hide the staleness.

OUT OF SCOPE: accounts, calculator, course booking.

ACCEPTANCE:
- Seed THREE occupations fully by hand, all tier-verified: electrician
  (tier B), adult care worker (tier B), registered nurse (tier A).
  Every claim sourced with a real URL. Paste the seed data.
- `curl -s localhost:3000/careers/electrician | grep -c "SourceStamp"` > 0
- Lighthouse on /careers/electrician — paste all four scores, accessibility
  must be 100
- Video or screenshot sequence of pathway component: default, route switched,
  step expanded, reduced-motion
- Set one step's review_due to yesterday. Screenshot proving the unverified
  state renders.
```

---

# PHASE 4 — £0 to Qualified calculator

```
Build the calculator at /cost. This is the flagship free tool and the primary
organic acquisition asset. It answers the question nobody answers: what will
this actually cost ME, after funding, and what can I earn while I do it.

INPUTS (progressive, one question per screen, mobile-first):
- Target occupation (typeahead from published occupations)
- Highest current qualification (drives level-3 entitlement logic)
- Age band (19-23, 24+, 50+ — different entitlements)
- Employment status (employed / unemployed / self-employed)
- Region (postcode → region, for devolved adult skills funding)
- Household income band (optional, gates some support)
- Intended start date (CRITICAL — determines ALL vs LLE)

ENGINE (/lib/funding/resolver.ts):
For each route to the target occupation, resolve every qualification's
funding eligibility against the learner's conditions AND the intended start
date. Output per route:
  gross cost · funding applied (named scheme) · cost to learner ·
  loan available and repayment terms · earn-while-learning wage ·
  duration · net position over the training period

MUST HANDLE: Advanced Learner Loans (extended to 2027) and LLE (courses
starting on or after 1 Jan 2027) concurrently. Resolve by start date. If the
learner's start date straddles the boundary, show BOTH and explain plainly.

OUTPUT:
Route comparison, cheapest-to-you highlighted, but with an honest note where
cheapest is also slowest or hardest. Every figure carries SourceStamp naming
the funding scheme and the guidance page it came from.

HONESTY RULES — non-negotiable:
- Where eligibility genuinely cannot be determined, say "depends on your
  circumstances — check with the provider" and link. Never guess.
- Never present a loan as though it were a grant.
- Show the total repayable on any loan, not just the monthly figure.
- Where a route requires giving up income, show that as a cost.

EMAIL RESULT: Resend, plain HTML, results plus sources plus next actions.
Email capture optional and after results are shown, never gated before.

OUT OF SCOPE: accounts, saved plans, applying.

ACCEPTANCE:
- `curl -X POST localhost:3000/api/cost/resolve -d @test-cases/*.json`
  for at least 8 cases: paste input and output for each
- MUST include: a 24+ level-3 entitlement case, an unemployed case, a
  50+ case, an apprenticeship case, a start date in Dec 2026 and the same
  case in Feb 2027 showing ALL vs LLE divergence
- Paste output for a case where eligibility is indeterminate, proving it
  returns the honest unknown state rather than a number
- Lighthouse on /cost, all four scores
```

---

# PHASE 5 — Accounts and learner dashboard

```
Supabase Auth (email magic link + Google). RLS on every user table.

/account — LEARNER DASHBOARD
- Saved pathways with progress state per step
  (not started / researching / applied / in progress / complete)
- Cost calculation history
- Saved courses and providers
- Application tracker: provider, course, date applied, status, next action
- Documents: CV, certificates (Supabase Storage, private bucket, RLS)
- Reminders: application deadlines, course start dates

PROGRESS MODEL: a user's saved pathway snapshots the route at save time and
diffs against the live route. If a qualification is withdrawn or funding
changes underneath a user mid-journey, surface it prominently. This is a
core trust behaviour, not a nice-to-have.

MIGRATION: localStorage "where are you now" answers from Phase 3 migrate into
the account on first sign-up. No re-answering.

NOTIFICATIONS (Resend, all opt-in, one-click unsubscribe):
- Funding change affecting a saved pathway
- Qualification withdrawn from a saved pathway
- Course starting soon near you for a saved pathway
- Gentle re-engagement at 14 and 45 days of inactivity — capped, honest,
  easy to turn off. No dark patterns, no false urgency.

ACCEPTANCE:
- RLS proof: authenticate as user A, `curl` for user B's saved pathway,
  paste the 403/empty response
- Save a pathway, change a qualification to withdrawn in admin, paste the
  dashboard response showing the alert
- Paste the migration working: localStorage answers present pre-signup,
  in the DB post-signup
- Confirm every email template has a working unsubscribe link
```

---

# PHASE 6 — Course matching and provider referral

```
The revenue mechanic. Build carefully — the conflict of interest here is real
and must be handled in the product, not the small print.

/courses — SEARCH
Postcode + radius, occupation, qualification, level, funding scheme, start
date, delivery mode (classroom / online / blended), part-time vs full-time.
Results from course_instances with real geo distance.

RANKING — declare and implement in this order:
1. Relevance to the searched qualification (exact QAN match first)
2. Distance
3. Start date proximity
4. Commercial relationship (LAST, and disclosed)

Any result from a paying partner carries a visible "Partner" label. A
partner result NEVER outranks a more relevant or closer non-partner result.
Implement this as a test, not a promise.

DISCLOSURE: a persistent, plain-English line on every results page and every
occupation page carrying course results, stating that some providers pay a
fee when learners enrol and that this does not affect ranking. Same standard
as the FTMO dual-role disclosure on Drawdown.

TIER A ADDITIONAL: on any tier-A occupation page carrying commercial course
results, the regulator link appears ABOVE the course results, with the
standing notice to confirm registration requirements independently.

LEAD FLOW:
Enquiry form → validated → written to `leads` → routed to provider via
webhook or email → status tracked (new / contacted / applied / enrolled /
rejected). Learner sees their own enquiry status in /account.

CONSENT: explicit, granular, GDPR-compliant. Separate consent for (a) sharing
details with the named provider and (b) marketing. Never bundled. Consent
record stored with timestamp, IP and the exact wording shown.

ACCEPTANCE:
- Automated test proving a partner result cannot outrank a closer or more
  relevant non-partner result. Paste test output.
- `curl` a search, paste JSON showing distance calculation and partner flags
- Submit a test enquiry, paste the leads row including the consent record
  with stored wording
- Screenshot of a tier-A occupation page showing regulator notice ABOVE
  commercial results
```

---

# PHASE 7 — Partner portal

```
Provider-facing. Surface register = partner (charcoal-dominant, dense,
institutional). This is where the Avorria Precision Luxe board applies
almost verbatim.

/partners — MARKETING
Value proposition to FE colleges, private training providers and
apprenticeship training providers. Lead with the timing: NCS moves in-house
to DWP on 1 October 2026 and existing referral routes are disrupted.
Pricing, coverage, how leads are qualified. Request-access CTA.

/partners/dashboard — PORTAL
- Leads inbox: new, contacted, applied, enrolled, rejected. Bulk status
  update. CSV export.
- Course listings: view what {{BRAND}} holds for them from the NCS directory,
  and enrich it — real prices, real start dates, real availability. This
  enrichment is the partner's incentive and improves the whole dataset.
- Performance: impressions, clicks, enquiries, enrolments, conversion by
  course. Charts.
- Billing: current period, invoices, payment method (Stripe).
- Settings: lead routing (webhook / email / both), team members, coverage
  area.

MULTI-TENANCY: organisations table, users belong to an organisation with a
role. RLS enforced at organisation level on every partner table. This is the
single highest-risk RLS surface in the product — one provider seeing another
provider's leads is a business-ending incident.

ENRICHMENT WRITE-BACK: partner-supplied course data writes to staging and
enters the admin review queue. Partners cannot write directly to live course
data. They can correct their own listings, they cannot inject content.

ACCEPTANCE:
- RLS proof: authenticate as org A, curl every partner endpoint for org B's
  data. Paste all responses proving denial. Test leads, courses, billing
  and performance separately.
- Create a partner, submit an enrichment, paste the staging row and its
  appearance in the admin queue
- Paste proof that a partner cannot write directly to course_instances
- Screenshot of dashboard in partner surface register
```

---

# PHASE 8 — Marketing site and editorial

```
Consumer marketing surface. Register = consumer.

/ — HOMEPAGE
Scroll narrative, GSAP ScrollTrigger scrub throughout:
1. Hero — the promise in plain English. Not "AI-powered career intelligence".
   Something like "Find out what it actually takes — and what it actually
   costs — to change career." Single primary action into /careers.
2. The problem, honestly stated — careers advice in England is being
   reorganised, the free tools are closing, and nobody tells you the real cost
3. Occupation preview — live cards from the database, not static
4. The calculator — inline mini-version, real, working, no signup
5. How it works — three steps, the pathway visualisation as hero imagery
6. Sources — WHY this is trustworthy. Named government sources, the
   verification standard, the review cycle. This section is the whole
   differentiator against a free chatbot. Give it real space.
7. Partner strip → /partners

/insights — EDITORIAL
Article system in Supabase. Categories: funding explainers, sector guides,
policy changes, real route stories. MDX or rich text, author, dateModified
driven by actual content updates.

SEED CONTENT — write these five properly, they are the SEO and trust spine:
1. "What the LLE means if you want to retrain" — applications open Sept 2026
   for courses starting Jan 2027, £38,140 lifetime entitlement
2. "Advanced Learner Loans vs LLE: which applies to you"
3. "What's happening to the National Careers Service" — merges into
   Jobcentre Plus 1 Oct 2026
4. "Free courses you're entitled to at 24+ without a level 3"
5. "How we check our information" — the verification standard, tiers, review
   cycles, and the commercial disclosure. Link from every occupation page.

/about — the standard, the team, the sources, the disclosure policy
/contact — Resend-backed, no third-party form embeds

PHOTOGRAPHY: per the board's photography direction but consumer-warmed —
real people in real work settings, hands, workshops, wards, classrooms,
cabs. Architectural abstraction is reserved for the partner surface. Use
clearly-licensed sources only; insert TODO markers rather than placeholder
images from unclear origins.

ACCEPTANCE:
- Lighthouse on / and /insights, all four scores
- Paste homepage occupation cards proving they render from live DB, not
  static — change an occupation title in admin and show it change
- Confirm zero fabricated statistics, testimonials or partner logos:
  list every factual claim on the homepage with its source
- Reduced-motion test on the full homepage scroll narrative
```

---

# PHASE 9 — SEO estate

```
Institutional-grade SEO. Read this whole prompt before starting — the quality
gate is the most important part and it is easy to get wrong.

TECHNICAL FOUNDATION
- Canonical on every page. Self-referencing. No canonical inheritance from
  layout — implement per-page in generateMetadata and verify each template
  independently.
- Segmented sitemaps via sitemap.ts: sitemap-occupations, sitemap-routes,
  sitemap-qualifications, sitemap-locations, sitemap-insights, sitemap-static.
  Index sitemap at /sitemap.xml.
- robots.txt: admin, account and partner dashboard disallowed.
- lastmod on every sitemap entry driven by the row's verified_at — real
  freshness signals from the provenance layer, not build time.
- IndexNow ping on publish and on verification update.

STRUCTURED DATA (JSON-LD, validated):
- Organization + WebSite on layout
- Occupation on /careers/[occupation]
- EducationalOccupationalProgram on each route
- Course on course_instance detail
- FAQPage where genuine Q&A exists — never invented to farm the rich result
- BreadcrumbList site-wide
- Article on /insights/[slug] with dateModified from real edits

dateModified MUST come from verified_at / content updated_at. Never from
build time. Faking freshness is exactly the pattern that gets an estate
demoted.

PROGRAMMATIC PAGES — HARD QUALITY GATE
Location × occupation pages (/careers/[occupation]/[location]) only generate
where ALL of the following are true, checked at build time:
  - The occupation is published and tier-verified
  - There are 3 OR MORE live course_instances within 25 miles of the
    location centroid, from real NCS directory data
  - There is genuinely location-specific data to show — actual named
    providers, actual distances, actual start dates
  - Total unique on-page content exceeds 400 words that are NOT shared
    with the parent occupation page

Pages failing ANY condition are NOT generated at all. Not generated and
noindexed — not generated. No empty shells, no "no courses found in
{location}" pages.

NO TEMPLATE INTERPOLATION PROSE. Do not write sentences of the form
"Looking to become a {occupation} in {location}? {location} has a thriving
{sector} sector." Location pages present real data — provider names,
distances, prices, start dates, local funding variations — in structured
components, with a short honest intro. If there is no real data, there is
no page.

Build a verification script at /scripts/audit-programmatic.ts that outputs
every generated location page with its course count and unique word count,
and FAILS the build if any generated page breaches the thresholds.

INTERNAL LINKING
- Occupation → its routes → its qualifications → courses
- Occupation → related occupations (sideways and progression), from real
  SOC adjacency, not arbitrary
- Insights → relevant occupations, contextually placed in prose
- Every occupation reachable within 3 clicks of the homepage
- Zero orphans. Prove it.

PERFORMANCE BUDGET
LCP < 2.0s, CLS < 0.05, INP < 200ms on mobile 4G. First Load JS under 160KB
on consumer routes. GSAP and Lenis dynamically imported below the fold.

ACCEPTANCE — this phase's evidence bar is the highest:
- `curl -s https://[preview]/careers/electrician | grep -i canonical` for
  SIX different page templates, pasted, proving no canonical inheritance
- Full output of scripts/audit-programmatic.ts
- Deliberately create a location with 2 courses. Paste build output proving
  no page is generated.
- Every JSON-LD type through Google Rich Results Test — paste results
- Orphan check output: zero orphan pages
- Lighthouse mobile on: homepage, occupation, location, calculator, insights
  article. All four scores each.
- `curl -s https://[preview]/sitemap.xml` and every child sitemap, showing
  real lastmod values that differ per URL
```

---

# PHASE 10 — Billing, analytics, launch hardening

```
STRIPE (partner-side only, consumer is free at launch)
Products: Partner Listing (monthly), Lead Package (per-lead or bundled),
Featured Placement (monthly, clearly labelled, does not affect ranking).
Webhooks: subscription lifecycle, payment success/failure, dunning.
Partner account suspends listings on failed payment after grace period.

ANALYTICS
Vercel Analytics + a privacy-respecting product analytics layer.
Track: occupation page views, calculator completions and drop-off by step,
course search → enquiry conversion, partner lead → enrolment conversion,
saved pathway retention at 7/30/90 days.
Cookie consent that actually gates non-essential scripts.

LEGAL
Privacy policy, terms, cookie policy, commercial disclosure policy,
accessibility statement. Data retention schedule. Subject access request
process. TODO markers where legal review is required — do not invent
legal text.

HARDENING
- Rate limiting on all public API routes
- Input validation (zod) on every route handler
- Error boundaries and honest fallback states
- Sentry or equivalent
- Full RLS audit across every table — script it, run it, paste output
- Backup and restore verified, not assumed

ACCEPTANCE:
- Stripe test-mode: full subscription lifecycle, paste webhook logs
- Full RLS audit script output, every table
- Rate limit proof: paste a 429
- `npm run build` clean, plus bundle analysis showing consumer routes
  under 160KB First Load JS
- Lighthouse across all ten primary templates
```

---

## Sequencing notes

**Do Phases 0–4 first and stop.** That gives you a live, real, three-occupation product with a working calculator — enough to show a training provider and enough to prove the joins are makeable. Phases 5–10 are only worth building if Phase 3's hand-seeding proves the data work is tractable.

**Phase 3's three seeded occupations ARE the join test.** You cannot seed electrician, adult care worker and registered nurse properly without discovering whether the SOC → standard → QAN → course chain holds. If it takes a week per occupation instead of half a day, that's the answer, and you'll have it before Phase 5.

**Make the calls during Phase 3–4, not after Phase 10.** By then you'll have a real calculator and three real pathways to show — which is more persuasive than a finished marketing site with no data behind it.

---

## Carried-forward risks

1. **Skills England is mid-transition** from IfATE. Expect endpoint and structure churn through 2026. Build ingest defensively and log schema drift loudly.
2. **DWP may ship a competing free tool** after the 1 October merger. Monitor Jobs and Careers Service announcements monthly. Mitigation is to own the transactional layer — course matching, funding resolution, provider referral — not the advice layer.
3. **Font licensing** must be resolved before any commercial launch.
4. **Ofqual and NCS Course Directory licensing** — confirm commercial and derived-use rights in writing before Phase 6 revenue. Same category as the Databento non-display question on Signal Centre.
5. **Legal position on advice vs information** — worth an hour with a solicitor before tier-A content goes live with commercial results attached.
