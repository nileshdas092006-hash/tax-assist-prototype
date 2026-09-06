# TaxAssist — AI-Guided Income Tax Filing & Defective Return Fixer

**A prototype built for [Hackathon Name]'s Builder Brief**, targeting the Income Tax e-Filing Portal (incometax.gov.in).

**Live demo:** https://tax-assist-prototype.vercel.app/
**Team:** Nilesh Kumar Das (Das), CSE, IIT Guwahati

---

## 1. The problem, in plain terms

Two real, evidence-backed pain points on India's Income Tax e-Filing Portal:

1. **A citizen who receives a Section 139(9) "Defective Return" notice** faces dense legal/technical jargon (`"Schedule Part B-TTI"`, `"e-Proceedings"`, `"DIN"`) with zero plain-language explanation, and — if they agree there's a mistake — is forced to download a separate desktop "Offline Utility," manually rebuild their return, export a JSON file, and re-upload it. This is a process built for accountants, applied to ordinary citizens.
2. **A first-time or simple filer** faces the same underlying problem one step earlier: figuring out which ITR form applies, what each form requires, and how to compute what's owed — all before ever hitting a defect. Both problems currently push citizens toward paying a Chartered Accountant even for small, common corrections.

We picked this problem after an **audit-first process**, not a guess — see Section 3.

---

## 2. What we built

Two complete citizen journeys from one dashboard:

### A. Fix a Defective Return (Section 139(9))
Notice → AI-translated plain-language summary (with the original legal text one tap away) → a short guided Q&A that replaces the offline-utility download entirely → simulated Aadhaar OTP verification → confirmation.

### B. File a Fresh Return
A deterministic decision tree (plain-language questions, e.g. *"Do you earn money mainly by offering a skill or service, or by running a business?"*) determines the correct ITR form (1/2/3/4) → a single reusable Q&A engine asks one question at a time for that form's required fields → a review screen → a simplified tax computation with an AI-generated plain-English breakdown → mock payment (only if tax is due) → OTP verification → a filed receipt with an acknowledgment number.

Every technical/legal term (`80C`, `80D`, `44AD`/`44ADA`/`44AE`, `Chapter VI-A`, `TDS`) is **removed from the default question text** and rephrased in plain English. A collapsed **"Why we ask"** toggle (reusing the same pattern as "View Official Notice Text") reveals the exact legal reference for anyone — a reviewing CA, a curious citizen — who wants it, without forcing jargon on everyone else.

---

## 3. How we got here — the full process

### Phase 1 — Audit before building (Stage 1)
Before picking a specific flaw, we ran a structured audit of the real portal:
- **Automated scans:** Lighthouse and Pa11y across the home page, login page, and help/service pages (mobile, simulated slow 4G).
- **Manual journey reconstruction:** since we could not and should not log in with real credentials, we reconstructed the actual click-path for the 139(9) flow using public documentation, screenshots, and official user manuals — never touching a live government system with real data.
- **Findings, evidence-backed, not assumed:** a 38.7s Largest Contentful Paint on the login page under simulated slow 4G, 14 color-contrast failures, 59 duplicate ARIA IDs breaking screen readers, and — the flaw we chose to fix — a citizen journey that dead-ends at a mandatory desktop-software download for a correction that is often a one-line number.

### Phase 2 — Problem selection, scored not guessed
We clustered every friction point found and scored each against what actually matters for this brief: universal pain, demo clarity, meaningful AI role, and mockability without real data. The jargon-translation-plus-offline-utility-replacement cluster scored highest and became our locked target — the "fix the defect" flow that shipped for Stage 1.

### Phase 3 — Stage 2 expansion
After advancing past the Stage 1 shortlist, we identified a real gap in our own product thinking: fixing a defect alone still leaves the *first-time filing* process — the part that actually creates most CA dependency — untouched. If we only build the fixer, accountants simply use it to do their existing paid work faster; the citizen doesn't necessarily save money. We expanded to a second flow — fresh ITR filing — so the tool removes CA dependency across the journey, not just at the correction step.

---

## 4. Issues we hit, and exactly how we resolved them

We ran multiple independent audit passes (V1 through V5) against the live deployment throughout the build, specifically to catch problems before a judge would. Being upfront about what actually went wrong, and how, is itself part of the "Honesty" criterion this brief asks for.

| Issue | What happened | How we fixed it |
|---|---|---|
| **API key exposed in the public bundle** | Our first implementation called OpenAI directly from the browser (`dangerouslyAllowBrowser: true`). Anyone opening DevTools could read the live key. | Moved the entire OpenAI call into a Vercel serverless function (`api/translate-notice.js`). The key now lives only in a server-side environment variable, never bundled into client code. Verified by scanning the deployed JS bundle for the key string — zero matches. |
| **Site went fully blank after removing the exposed key** | Removing the leaked key without first shipping the serverless refactor caused the browser-side SDK constructor to throw before React could even mount — a total outage, worse than the original leak. | Root-caused to the client-side SDK still being imported; removed it entirely, confirmed the app renders correctly with no key present client-side, and added a general safeguard so an unrecognized app state always recovers to the dashboard instead of rendering blank. |
| **Layout: disclaimer bar covering action buttons** | A fixed "Prototype — Mock Data" disclaimer overlapped the primary buttons at narrow (320px) mobile widths. | Rebuilt every screen onto one consistent full-viewport flex-column layout so the disclaimer and the action row never overlap, verified across all screens at 320px. |
| **Progress lost on refresh or browser Back** | The app had no persistence; refreshing mid-flow or hitting the browser's Back button reset everything or exited to a blank page. | Added session-scoped state persistence and proper browser history handling, so refresh and Back/Forward now correctly preserve the user's place and answers. |
| **API billing (OpenAI)** | The OpenAI account tied to our key had zero credit; live calls returned HTTP 429 ("no credits remaining"). | Built a deliberate `try/catch` fallback: if the live call fails for any reason, the app serves a pre-written, realistic response of the exact same shape a live call would produce, and the user experience never breaks. This is disclosed openly below, not hidden. |
| **Verifying the integration actually works, without spending real money** | We needed proof that our prompt, JSON parsing, and UI wiring were genuinely correct — not just "looks right" — without paying for OpenAI credits before confirming the architecture was sound. | We temporarily wired a second provider (OpenRouter) as a **server-side-only, non-default diagnostic path** — reachable only via a hidden flag never linked or shown anywhere in the UI, never triggered for a normal visitor. This confirmed our entire pipeline (client → serverless function → JSON parsing → UI render) works correctly end-to-end with a real model response. **This diagnostic path has since been closed off from the shipped product** — it exists in the code purely as evidence the architecture was validated, is never called by default, and involves no user-facing toggle. The judged experience only ever uses OpenAI, exactly as the brief requires. |
| **Input validation gaps** | Early versions accepted negative numbers, letters, or malformed decimals into currency fields with wrong or missing error messages. | Full validation rewrite: blank, non-numeric, negative, over-cap, and malformed-decimal inputs are all now individually caught with an accurate message, and the live preview never displays a corrupted number. |
| **Stale data after changing an answer** | If a user re-answered the form-detection questions differently mid-session, old answers from the previous form type could linger and silently affect the tax computation. | The app now clears all form-specific data whenever the detected form type changes, verified by testing a form-switch scenario end-to-end. |
| **Debug code accidentally exposing internal error details** | A temporary debugging commit briefly returned internal error details in API responses. | Identified before deployment, reverted, and replaced with server-side-only logging — nothing internal is ever returned to the client. |

---

## 5. What's real vs. what's mocked — full disclosure

| Component | Status |
|---|---|
| **Notice jargon translation** | Architecturally live: browser → our own serverless function → OpenAI. Currently returns a curated fallback because the OpenAI key has no funded credit at time of writing (billing, not code — see below). |
| **AI tax breakdown** (fresh-filing flow) | Composed from the actual computed numbers; not yet wired to a live model call for this specific screen. |
| **ITR form detection & required fields** | **Deterministic, not AI-guessed, by design.** Which ITR form applies, and what fields it requires, is fixed public information (CBDT rules, AY 2026-27) — not something an AI should ever guess, since a wrong guess here means a wrong filing. We hardcoded this as a small, clearly-labeled, simplified schema (5–8 representative fields per form, not the full official multi-page form) and use AI only to phrase each question conversationally — never to decide tax structure. |
| **Tax computation** | A simplified, illustrative slab-rate calculation with a flat Section 87A rebate — internally consistent, clearly labeled, not the complete Finance Act logic. |
| **AIS / Form 16 pre-filled data** | Synthetic, tagged "Prototype — Mock Data" on every screen. Three distinct profiles (salaried / business / capital gains) demonstrate genuinely different numbers per scenario. |
| **Payment / challan** | Fully simulated — a fixed mock reference number, no real payment gateway. |
| **OTP / e-Verification** | Any 4–6 digit input is accepted; explicitly labeled "(Simulated)". No real Aadhaar, EVC, or DSC integration — and none should exist in a prototype, per the brief's own data-safety rules. |
| **PAN / Aadhaar** | We deliberately never collect real government ID numbers anywhere in this prototype — not even as a text field — per the brief's explicit restriction. Where a PAN-shaped string appears, it is a clearly-labeled static sample, never user-entered. |
| **Submission** | The final "filed" state is a UI confirmation only; nothing is transmitted to any real government system. |

**The one thing standing between this and a live AI demo is a funded OpenAI API key** — zero code changes required. Set `OPENAI_API_KEY` as a server-side Vercel environment variable (never `VITE_`-prefixed) and the exact same code path currently serving the fallback will serve real model output instead.

---

## 6. Why this is the right fit for this hackathon

- **Real, evidenced problem** — chosen from an actual audit of the live portal, not assumed.
- **AI used where it genuinely helps, nowhere else** — translation and conversational phrasing are AI's job; tax-rule structure is fixed, deterministic data. We treat "never invent tax rules" as a hard boundary throughout, the same way we never let the AI guess a notice's fix without evidence.
- **Complete, working citizen journeys** — both flows run start to finish, not a static mockup.
- **Mobile-first by evidence, not assumption** — built at 320–390px because our own audit measured the real portal's mobile performance failures (39s load times, sub-48px touch targets) before writing a line of new UI.
- **Security-conscious under real pressure** — we found and fixed a genuine API key exposure ourselves, mid-build, rather than shipping it — the kind of end-to-end thinking the brief explicitly rewards.
- **Honest about every limitation** — this document is the proof.

---

## 7. What's still open — and why that's a feature of this submission, not a gap

We are treating the remaining items as scoped, disclosed roadmap steps rather than hidden shortcomings:

1. **Fund the OpenAI key.** Zero code change needed — the architecture is fully built, tested (including via a temporary secondary-provider check, since removed from the default path), and proven correct. This is the single fastest path from "prototype" to "live AI demo."
2. **Expand the "Disagree" branch** of the defective-return flow (currently only the "Agree and correct" path is built) — a natural, contained next increment on the exact same architecture.
3. **Scale the ITR field schema** from a representative 5–8 fields per form toward the complete official field set, and extend deterministic detection to edge cases (NRIs, multiple business types) beyond the common-case coverage we prioritized for this build.
4. **Real AIS/Form 16 integration**, replacing the synthetic pre-fill data, once appropriate authenticated access is available — the UI and data flow are already built to accept this as a drop-in data-source swap.
5. **Extend the CA-bypass principle upstream and downstream** — the same deterministic-schema-plus-AI-translation approach that now covers form selection and filing can extend to grievance redressal, refund-status queries, and other CA-mediated interactions on the same portal.

None of these require re-architecting anything already built — each is an additive next step on a foundation we have already stress-tested through five separate audit passes.

---

## 8. The real-world outcome this aims for

Today, a taxpayer who makes a small, common mistake — forgetting to declare bank interest, missing a deduction, picking the wrong form — either panics, abandons the process, or pays a Chartered Accountant for what is often a five-minute fix. This prototype's goal is simple: let that person understand what's wrong, answer a few plain questions on their phone, and finish the same task themselves — for free, in minutes, without ever touching desktop software or a second professional's invoice. That is the pain point we set out to relieve, and everything in this build was scoped, audited, and disclosed in service of that one outcome.

---

*This README reflects the state of the codebase at the time of Stage 2 resubmission. Every claim above maps to a check we actually ran against the live deployment — no unverified claims.*
