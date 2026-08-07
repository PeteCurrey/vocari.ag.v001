# Pathway Graph — Scope & Source Mapping Spec

> ## READ FIRST — how to use this document
>
> This document serves two audiences. Not all of it is an implementation spec.
>
> **NORMATIVE for implementation — build exactly to these:**
> - **§2** Data model — entities, fields, types
> - **§3** Source map — which source feeds which field, and the four joins
> - **§4** The 40 occupations — the seed list
> - **§5** Verification tiers — A/B/C definitions and review cycles
> - **§7** Architecture notes
>
> **CONTEXT ONLY — do not implement, do not treat as requirements:**
> - **§0, §1** Rationale and market timing
> - **§6** Effort and cost estimates (human planning)
> - **§8** Go/no-go tests (manual business validation, NOT features to build)
> - **§9** Out of scope
> - **§10** Open questions (unresolved decisions for the project owner)
>
> Where this document and `vocari-build-prompts.md` differ on a detail, the
> build prompt wins — it is the later and more specific artefact. Flag the
> conflict rather than silently picking one.

**Status:** Pre-build scoping. Go/no-go gate before any code.
**Scope:** England only at v1 (Scotland/Wales/NI are separate qualification frameworks — do not attempt).
**Date:** August 2026

---

## 0. What this document decides

Whether the pathway data layer is buildable and maintainable by one person with Claude Code, or whether it's a content operation that needs headcount. Section 8 has three cheap tests that answer that in two weeks for under £200.

**The core assertion being tested:** that a structured, sourced, dated, funding-aware pathway graph is meaningfully better than what a general-purpose chatbot produces for free — and that the difference is defensible.

If the graph can't beat ChatGPT on *verifiability and currency*, there is no product. Everything below exists to serve that one test.

---

## 1. The timing case

Three things happen in the next eight weeks. This is the reason to move now rather than next year.

| Date | Event | Consequence |
|---|---|---|
| **Sept 2026** | LLE applications open for courses starting Jan 2027 onwards | First cohort in England able to apply for a £38,140 lifetime tuition entitlement. Nobody has built a consumer tool to help them use it. |
| **30 Sept 2026** | National Careers Service contracts expire | Adult careers provision moves in-house to DWP |
| **1 Oct 2026** | NCS merges into Jobcentre Plus | Referral pipelines to training providers disrupted; careers companies lose funding |
| **Dec 2026** | Careerpilot closes | Best free UK pathway-planning tool disappears |
| *(already happened)* | **Oct 2025** — LMI for All API shut down permanently | No free UK labour market API exists. No replacement announced. |

The LMI for All closure is the important one. It was the join layer — occupation codes to salaries to apprenticeship standards — and it's gone. Everyone who built on it is now on static data or has removed the feature. **The gap you would be filling is a gap that was created 10 months ago and nobody has filled.**

Advanced Learner Loans have been extended to 2027 to bridge the LLE transition, so both systems run in parallel through the launch window. Your funding logic must handle both.

---

## 2. Data model

Six entities. The design principle is that **a pathway is a graph, not an article** — because the same qualification appears on multiple routes, and the same career has multiple valid entry points depending on what the user already has.

```
Occupation (40 at v1)
   └── has_many Routes (2–5 per occupation)
         └── has_many Steps (ordered, 2–6 per route)
               └── references one Requirement
                     └── resolves_to many Qualifications
                           ├── has FundingEligibility
                           └── has_many CourseInstances (live, geo)
   └── has_many RegistrationRequirements (0–3)
```

### 2.1 Occupation

```
occupation
  id                    slug, e.g. "electrician"
  title                 display name
  soc_2020_code         4-digit ONS SOC code
  aliases[]             search synonyms ("sparky", "electrical technician")
  summary               2–3 sentences, plain English
  tier                  A | B | C  (see §5 — drives verification burden)
  day_in_life           short structured description
  salary_entry          £, source-attributed
  salary_experienced    £, source-attributed
  salary_source         ASHE | LEO | job-ad-derived | provider-stated
  salary_as_at          date of underlying data
  demand_signal         nullable — live vacancy count, if feed available
  physical_demands[]    standing, lifting, shift work, driving licence req'd
  work_pattern[]        shifts, on-call, weekends, self-employed common
  provenance            (see §2.7)
```

### 2.2 Route

A distinct way in. Most occupations have 3–4.

```
route
  id
  occupation_id
  type            apprenticeship | college | university | direct_entry |
                  work_based_progression | conversion | military_transfer
  label           "Level 3 apprenticeship (most common)"
  is_primary      bool — the route most people actually take
  from_position   nullable — "if you already work in care"
  entry_requirements[]  structured — GCSEs, prior level, licence, age, DBS
  typical_duration_months
  typical_cost_gbp_min / _max      to the *learner*, after funding
  typical_cost_gross_gbp           sticker price before funding
  earn_while_learning   bool
  typical_wage_during   nullable £
  suitability_notes     who this route is realistically for
  provenance
```

### 2.3 Step

Ordered sequence within a route. This is what renders as the visual pathway.

```
step
  id, route_id, sequence
  label                 "Get a Level 2 in Electrical Installation"
  requirement_id
  duration_months
  can_run_parallel      bool — some steps overlap
  blocking              bool — hard prerequisite vs nice-to-have
```

### 2.4 Requirement

Abstract — "a level 3 electrical qualification" — which resolves to many concrete quals.

```
requirement
  id
  kind          qualification | registration | licence | check |
                experience_hours | medical | age_gate
  label
  rqf_level     nullable, 1–8
  mandatory     bool
  awarding_constraint  nullable — "must be from an approved AO"
```

### 2.5 Qualification

Concrete, identifiable, checkable.

```
qualification
  id
  qan                   Ofqual Qualification Number (the join key)
  title                 as registered
  awarding_org
  rqf_level
  tqt_hours             total qualification time
  status                live | withdrawn | expiring
  operational_end_date  nullable — critical, quals get withdrawn
  standard_ref          nullable — apprenticeship standard reference
  provenance
```

### 2.6 FundingEligibility

The single highest-value field in the whole model, and the least well served elsewhere.

```
funding_eligibility
  qualification_id
  scheme            adult_skills_fund | free_courses_for_jobs |
                    advanced_learner_loan | LLE | apprenticeship_levy |
                    employer_funded | self_funded_only
  learner_conditions[]   age band, prior attainment, employment status,
                         income threshold, residency, region
  covers             full | partial | loan_only
  learner_contribution_gbp
  scheme_valid_from / _to     ALL runs to 2027; LLE from Jan 2027
  provenance
```

### 2.7 Provenance (on every node — non-negotiable)

Same discipline as Signal Centre. If it can't be sourced and dated, it doesn't render.

```
provenance
  source_name
  source_url
  retrieved_at
  verified_by       human initials | automated
  verified_at
  review_due        date — tier-dependent (see §5)
  confidence        confirmed | inferred | provisional
```

**Rendering rule:** any node past `review_due` renders as `UNVERIFIED — confirm with provider before acting`, with the last-verified date shown. Never silently serve stale pathway data. A wrong funding answer costs a real person real money.

---

## 3. Source map

What actually feeds each field, and how solid each source is.

| Field group | Source | Access | Reliability |
|---|---|---|---|
| Qualification identity, QAN, level, TQT, AO, status | **Ofqual Register API** | Public REST, self-serve, plus daily CSV bulk download. ~48k quals. | **Solid.** Authoritative, maintained, machine-readable. |
| Apprenticeship standards, levels, durations, max funding | **Skills England** (ex-IfATE, transferred 1 June 2025) + `SkillsFundingAgency/das-courses-api` on GitHub (standards from IFATE + LARS) | Open source, live | **Solid**, but mid-transition — expect URL and structure churn through 2026 |
| Live course availability, providers, venues, regions | **NCS Course Directory transparency data** — monthly CSV, 2,700+ organisations, OGL licensed | gov.uk publication, monthly file | **Good.** Free, licensed, geo-coded. But monthly = up to 30 days stale, and the live service is currently degraded. |
| Salary by occupation | ONS ASHE, DfE LEO | Spreadsheets and CSV dumps across multiple sites | **Painful.** No API since Oct 2025. Manual SOC code mapping across classification versions. |
| Funding rules | gov.uk guidance pages, SLC, OfS, ESFA funding rules | HTML, PDF | **Worst source in the stack.** No API, changes annually, scattered. Manual + monitored. |
| Registration / licensing requirements | NMC, HCPC, GMC, GDC, Gas Safe, Social Work England, Engineering Council, DVSA, College of Policing | Individual websites | **No aggregate source exists anywhere.** 100% manual. |
| Live vacancies | Adzuna / Reed / ATS feeds | Commercial licence required | **Blocked at v1** — treat as optional enhancement, not core |

### The four joins nobody publishes

This is the actual work. The APIs above are the easy part; connecting them is what LMI for All spent 13 years and several DfE contracts doing, and what died in October 2025.

1. **SOC 2020 occupation ↔ apprenticeship standard.** LMI for All maintained this mapping. It is now gone. Skills England lists "typical job titles" per standard as free text — usable as a fuzzy join seed, but needs human confirmation per occupation. *~40 manual mappings at v1. Tractable.*

2. **Apprenticeship standard ↔ Ofqual QAN.** Partial via LARS. Many standards have no mandated qualification (knowledge, skills and behaviours assessed at end-point instead), so the join is genuinely one-to-none in places — the model must allow that rather than forcing a qualification.

3. **Ofqual QAN ↔ live course instance.** The NCS course directory carries qualification references. This is the most mechanically reliable join in the stack and the one that makes provider referral possible. **Prove this one first** (§8, Test 1).

4. **Occupation ↔ registering body ↔ actual registration criteria.** No source, no API, no shortcut. 40 occupations × manual research. This is where the liability sits and where the value sits, in equal measure.

---

## 4. The 40 occupations

Selected by career-change destination volume, not by coverage of the occupational map. Deliberately weighted toward routes that are (a) commonly switched into by adults, (b) funded, and (c) have live course supply.

**Health & care (7)** — Adult care worker · Healthcare assistant · Nursing associate · Registered nurse (adult) · Paramedic · Dental nurse · Pharmacy technician

**Construction & trades (8)** — Electrician · Plumbing & heating engineer · Gas engineer · Carpenter/joiner · Bricklayer · Plasterer · Refrigeration & air conditioning engineer · Construction site supervisor

**Transport & logistics (4)** — HGV driver · Bus/coach driver · Train driver · Warehouse/logistics supervisor

**Education (3)** — Teaching assistant · Primary school teacher · SEN learning support

**Digital & tech (5)** — Software developer · Data analyst · IT support technician · Cyber security analyst · Digital marketer

**Business & professional (6)** — Project manager · Bookkeeper / AAT accountant · HR advisor · Payroll administrator · Business administrator · Recruitment consultant

**Public safety (3)** — Police constable · Firefighter · Prison officer

**Personal services (4)** — Hairdresser · Beauty therapist · Personal trainer · Dog groomer

### Why this mix

Roughly a third are statutorily regulated (Tier A). Those are the highest-liability entries *and* the highest-value ones — they're precisely where a general chatbot gives a confident wrong answer and where being right is worth paying for. The unregulated tail (developer, marketer, dog groomer) is cheap to maintain and drives top-of-funnel search traffic.

---

## 5. Verification tiers

Verification burden is not uniform. Tiering it is the difference between a maintainable dataset and an unmaintainable one.

| Tier | Definition | Examples | Verification standard | Review cycle |
|---|---|---|---|---|
| **A** | Statutory registration required. Wrong info = someone spends thousands on a course that doesn't register them. | Registered nurse, paramedic, teacher, police constable, gas engineer, dental nurse, pharmacy technician, prison officer | Every requirement verified against the **regulator's own published criteria**, URL and date cited on-page. No inference. No AI-drafted content shipped unreviewed. | Quarterly |
| **B** | Licence, scheme membership, or mandatory check. Wrong info = wasted time and moderate money. | Electrician, HGV driver, teaching assistant, care worker, personal trainer, train driver | Verified against scheme operator or ESFA funding rules. AI draft permitted, human confirm required. | Half-yearly |
| **C** | Unregulated. Employer preference only. Wrong info = mildly bad advice. | Software developer, data analyst, digital marketer, dog groomer, recruitment consultant | AI draft with source links, spot-checked. State plainly that no formal requirement exists. | Annual |

**Tier A pages must carry a standing disclaimer** naming the regulator as the authoritative source, with a direct link. And if provider commission is ever taken on a Tier A route, the commercial relationship is disclosed on that page — same standard as the FTMO dual-role disclosure on Drawdown.

---

## 6. Effort and cost

Honest numbers, assuming Pete as architect and Claude Code as implementer.

### Content build (the real cost)

| Tier | Count | Hours each | Total |
|---|---|---|---|
| A | 13 | 5–6 | 65–78 |
| B | 14 | 3–4 | 42–56 |
| C | 13 | 1.5–2 | 20–26 |
| **Total** | **40** | | **127–160 hrs** |

Includes source research, route mapping, funding rules, registration criteria, and human verification. AI drafts the first pass; a human confirms every Tier A and B claim against the primary source. **AI-generated pathway content shipped unverified is the single fastest way to kill this product.**

At 12 hrs/week that's **11–13 weeks**. Buying it in at £30–45/hr for a researcher: **£4k–7k**.

### Engineering build

| Component | Estimate |
|---|---|
| Schema, migrations, Supabase setup | 8–12 hrs |
| Ofqual API ingest + nightly reconcile | 12–16 hrs |
| Skills England / das-courses ingest | 12–16 hrs |
| NCS course directory monthly ingest + geocoding | 16–20 hrs |
| Join layer + confidence scoring | 20–30 hrs |
| Provenance / staleness enforcement | 8–12 hrs |
| Funding rules engine (ALL + LLE dual-mode) | 20–30 hrs |
| Admin/verification UI | 16–24 hrs |
| **Total** | **112–160 hrs** |

### Ongoing

- **Funding rules:** annual rewrite, plus LLE transition through 2027. ~20 hrs/yr.
- **Qualification withdrawals:** automated via Ofqual `operational_end_date`, but needs review queue. ~1 hr/week.
- **Tier A re-verification:** 13 occupations × 4 × 1 hr = **52 hrs/yr**.
- **Realistic steady state: half a day a week, forever.**

That last line is the number that matters. This is a maintained dataset, not a shipped feature. If that's not acceptable, stop here.

---

## 7. Architecture notes

Standard stack — Next.js 15 App Router, Supabase, Vercel, TypeScript, Tailwind.

- **Postgres with explicit join tables**, not a graph DB. The graph is small (40 occupations, maybe 150 routes, 600 steps). Recursive CTEs handle traversal fine. Don't over-engineer.
- **Ingest as scheduled jobs writing to staging tables**, with a diff review queue before promotion to live. Never auto-promote a funding change.
- **Every user-facing figure renders with source and date.** Reuse the Signal Centre discipline directly — same rule, different domain.
- **Cache aggressively, invalidate on ingest.** Course availability is the only fast-moving field and it's monthly.
- **No live job feed at v1.** Design the schema so `demand_signal` is nullable and the UI degrades cleanly without it.

---

## 8. Go/no-go tests — do these before writing any code

Three tests. Two weeks. Under £200. Each one can kill the project cheaply, which is the point.

### Test 1 — The join test (2 days)

Manually, by hand: take **electrician**. Get from the occupation to a **bookable, funded, real course within 25 miles of Chesterfield**, with every claim sourced and dated. Record every step and every dead end.

- **Pass:** under 2 hours, with all four joins made from public sources.
- **Fail:** takes a full day, or any join requires data that isn't published.
- **Why it matters:** if a human with full context can't do it in 2 hours, an automated pipeline across 40 occupations will not work either. This is the cheapest possible test of the entire thesis.

### Test 2 — The supply test (2 days)

Download the NCS Course Directory monthly file (Feb 2026 or later). For 10 sample postcodes spread across England — including at least three rural — count how many of the 40 occupations have **three or more live courses within 25 miles**.

- **Pass:** 60%+ coverage.
- **Fail:** below 40% — the provider referral model has no inventory, and the monetisation collapses.
- **Why it matters:** the entire revenue thesis rests on referring learners to courses. If the courses aren't there, you have a lovely information product with no business model.

### Test 3 — The commercial test (1 week, 5 phone calls)

Call five training providers — mix of FE college, private provider, and apprenticeship training provider. Ask directly: **what do you pay for a qualified enrolled learner, and how do you currently acquire them?**

- **Pass:** at least three name a number, or describe an existing paid acquisition channel.
- **Fail:** all five say they don't pay for leads.
- **Why it matters:** this is the assumption the whole business model rests on and it has never been tested. It costs five phone calls. Do it first, honestly — it's the one test where a "no" saves you six months.

**Run Test 3 in week one, in parallel with Test 1.** It's the cheapest and the most likely to kill the idea.

---

## 9. What is explicitly out of scope at v1

- Scotland, Wales, Northern Ireland — different frameworks (SCQF, CQFW), separate build
- United States — entirely different system, state-by-state licensure, shares nothing
- Live job feeds — commercial licensing blocker, revisit post-revenue
- AI mentor personas — retention feature for a product with no retention yet
- Interview prep, CV tools — commoditised, no edge
- Career-progression-after-hire — v3 at earliest

---

## 10. Open questions

1. **Does DWP publish anything after the 1 Oct merger** that duplicates this? Watch the Jobs and Careers Service announcements closely between now and October. Unknowable today; check monthly.
2. **Ofqual API rate limits and commercial terms** — confirm before building ingest.
3. **NCS Course Directory licence** — OGL is stated, but confirm derived-use and commercial-referral rights explicitly. Same category of question as the Databento non-display issue on Signal Centre.
4. **Conflict of interest** — if provider commission is taken, what's the disclosure standard on Tier A pages? Needs deciding before the first commercial deal, not after.
5. **Liability position** — where does information provision end and regulated advice begin? Worth a cheap hour with a solicitor before Tier A content goes live.
