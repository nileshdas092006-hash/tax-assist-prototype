# TaxAssist — Section 139(9) defective-return helper

A phone-sized web app that takes an Indian Income Tax **Section 139(9) "defective
return" notice** and turns it into something a non-expert can act on: a
plain-language summary of what went wrong, two or three guided questions, a live
preview of the corrected figure, and a simulated e-verification handoff — all in
the browser, instead of downloading a desktop "Offline Utility", rebuilding the
return, and re-uploading a JSON file.

It also has a second flow — **File a New Return** — that walks a salaried,
business, or trading profile through intake → pre-filled income → deductions →
tax computation → payment / e-verification → a filed acknowledgement.

**Live:** https://tax-assist-prototype.vercel.app/

---

## What's real vs. mocked

This is a prototype built for a hackathon. It demonstrates an **interaction
model**, not a working filing system. Everything below is deliberate and
labelled in the UI.

| Area | State |
|---|---|
| Notice → plain-language translation | **Real LLM call**, server-side (`/api/translate-notice`). Primary: OpenAI `gpt-4o-mini`. Optional secondary provider (OpenRouter) behind `?devmode=verify`. If neither responds, the app shows a **curated example** for the one bundled notice so the flow is always demoable. |
| The notice itself | One hard-coded synthetic Section 139(9) record (`src/data/mockNotice.json`). |
| New-return intake questions | Static list with a simulated "thinking" delay (`src/utils/fetchIntakeQuestions.js`). |
| Pre-filled income (AIS/26AS) | Three synthetic profiles (`src/data/mockAIS.json`), each tagged *"Synthetic AIS Data"* on screen. |
| Tax computation | A **simplified illustrative** slab table + a flat Section 87A rebate. Internally consistent; **not** the full Finance Act logic. |
| "AI Tax Breakdown" text | Composed locally from the computed numbers — no model call. |
| Payment | Simulated gateway, fixed challan / CRN, *"Simulated Sandbox"* tag. |
| e-Verification (OTP) | Accepts any 4–6 digit code; a "Fill Demo OTP" button is provided. Nothing is signed or transmitted. |

### Security

The OpenAI / OpenRouter keys live **only** in the Vercel serverless function
(`process.env`), never in the client bundle. The browser makes one same-origin
`POST /api/translate-notice`; it never talks to a model API directly. An earlier
build leaked a key via a `VITE_`-prefixed env var — that has been removed and the
key must be rotated.

---

## Roadmap

The gap between this prototype and something usable:

1. **Real notice ingestion** — parse an uploaded PDF / DIN lookup instead of one
   bundled record; handle the full set of 139(9) defect codes, not just Error
   Code 14 (Gross Total Income nil vs. TDS claimed).
2. **Real pre-fill** — pull AIS / Form 26AS / AIS through the official
   consent-based APIs rather than synthetic profiles.
3. **Accurate computation** — replace the illustrative slab table with the
   assessment-year-correct old/new-regime logic, surcharge, cess, and the actual
   87A thresholds; show the working.
4. **Real submission** — generate the Schedule Part B-TTI revised computation and
   file it through the portal's return-filing API, with genuine Aadhaar-OTP /
   DSC e-verification.
5. **More than one defect path** — today the guided questions only resolve the
   TDS-vs-nil-income case.

---

## Run locally

```bash
npm install
npm run dev            # Vite dev server
npm run build          # production build
npm run lint           # oxlint
```

Set keys in `.env` (git-ignored, server-side only — **no `VITE_` prefix**):

```dotenv
OPENAI_API_KEY=...
OPENROUTER_API_KEY=...   # optional; used only under ?devmode=verify
```

Without keys, or when the providers are unavailable, the notice screen falls back
to the curated example and the rest of the app is unaffected.

## Stack

Vite 8 · React 19 · Tailwind CSS 3 · oxlint · Vercel (static build + one Node
serverless function).
