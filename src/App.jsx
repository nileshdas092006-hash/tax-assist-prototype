import { useState, useEffect, useCallback } from 'react'
import NoticeIntakeScreen from './components/NoticeIntakeScreen'
import GuidedCorrectionScreen from './components/GuidedCorrectionScreen'
import SubmitConfirmationScreen from './components/SubmitConfirmationScreen'
import DashboardScreen from './components/DashboardScreen'
import FormDetectionScreen from './components/FormDetectionScreen'
import DynamicFormFillerScreen from './components/DynamicFormFillerScreen'
import TaxSummaryScreen from './components/TaxSummaryScreen'
import PaymentScreen from './components/PaymentScreen'

const SESSION_KEY = 'tax-assist:flow'

// Every step the router below renders a real screen for. Anything else — stale
// sessionStorage written by an older build, or a half-built flow — must fall back
// to the Dashboard rather than render a blank page (the failure class that took
// the site down once already).
const KNOWN_STEPS = [0, 1, 2, 3, 10, 11, 12, 13, 14]

// The ordered steps of each flow, used to seed the history stack on load so the
// browser Back button walks the flow instead of leaving the app or landing on
// steps the user never visited.
const DEFECTIVE_FLOW = [1, 2, 3]
const FILING_FLOW = [0, 10, 11, 12, 13, 14]

function historyPathTo(target, payload) {
  if (target >= 10) {
    let seq = FILING_FLOW.filter((s) => s <= target)
    // A refund / nil return skips the payment screen (12 -> 14).
    if (target === 14 && !(payload && payload.payment)) seq = seq.filter((s) => s !== 13)
    return seq
  }
  return DEFECTIVE_FLOW.filter((s) => s <= target)
}

// Read the persisted flow state from sessionStorage. Returns null when nothing
// is stored or storage is unavailable (private mode, storage disabled, quota).
function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : null
  } catch {
    return null
  }
}

function App() {
  // Hydrate the whole flow from sessionStorage once, on first render.
  const [restored] = useState(readSession)

  const initialStep = KNOWN_STEPS.includes(restored?.step) ? restored.step : 0

  const [step, setStep] = useState(initialStep)
  const [correctionAnswers, setCorrectionAnswers] = useState(
    restored?.correctionAnswers && typeof restored.correctionAnswers === 'object'
      ? restored.correctionAnswers
      : {},
  )
  const [aiAnalysis, setAiAnalysis] = useState(restored?.aiAnalysis ?? null)
  const [backgroundITRPayload, setBackgroundITRPayload] = useState(
    restored?.backgroundITRPayload && typeof restored.backgroundITRPayload === 'object'
      ? restored.backgroundITRPayload
      : {}
  )

  // Persist the flow on every change so a refresh restores the user in place.
  useEffect(() => {
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ step, correctionAnswers, aiAnalysis, backgroundITRPayload }),
      )
    } catch {
      /* storage unavailable — persistence is best-effort, the app still works */
    }
  }, [step, correctionAnswers, aiAnalysis, backgroundITRPayload])

  // Rebuild a history back-stack for the current step on mount. A page load
  // (including a refresh mid-flow) starts with a single history entry, so without
  // this the native Back arrow would leave the app. We seed one entry per step
  // the user actually passed through, so Back walks e.g. 12 -> 11 -> 10 -> 0.
  useEffect(() => {
    const path = historyPathTo(initialStep, restored?.backgroundITRPayload)
    window.history.replaceState({ step: path[0] ?? 0 }, '')
    for (let i = 1; i < path.length; i += 1) {
      window.history.pushState({ step: path[i] }, '')
    }
  }, [initialStep, restored])

  // Native Back / Forward: mirror whatever history entry we land on into React
  // state instead of unloading the page.
  useEffect(() => {
    const handlePopState = (event) => {
      const target =
        event.state && typeof event.state.step === 'number' ? event.state.step : 0
      setStep(KNOWN_STEPS.includes(target) ? target : 0)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Final guard against a blank page: every path that sets `step` is already
  // filtered against KNOWN_STEPS (hydration, popstate, goToStep), so this only
  // ever matters if something regresses — an unknown step renders the Dashboard.
  const activeStep = KNOWN_STEPS.includes(step) ? step : 0

  // Advance a step and push a matching history entry so Back can undo it.
  const goToStep = useCallback((next) => {
    setStep(next)
    window.history.pushState({ step: next }, '')
  }, [])

  // In-app Back defers to the browser; the popstate handler updates React state.
  const goBack = useCallback(() => {
    window.history.back()
  }, [])

  const handleReturnToDashboard = useCallback(() => {
    setCorrectionAnswers({})
    setAiAnalysis(null)
    setBackgroundITRPayload({})
    goToStep(0)
  }, [goToStep])

  const [isDevMode] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('devmode') === 'verify';
    } catch {
      return false;
    }
  });

  return (
    <div className={isDevMode ? 'app-devmode' : undefined}>
      {isDevMode && (
        <div className="fixed top-0 inset-x-0 h-8 flex items-center justify-center bg-yellow-100 text-yellow-800 text-[11px] font-bold text-center px-4 z-[60] border-b border-yellow-200 shadow-sm">
          Verification Mode: Secondary LLM Provider Active.
        </div>
      )}
      {activeStep === 0 && (
        <DashboardScreen
          onSelectDefectiveReturn={() => goToStep(1)}
          onSelectFreshFiling={() => goToStep(10)}
        />
      )}
      {activeStep === 1 && <NoticeIntakeScreen onNext={() => goToStep(2)} aiAnalysis={aiAnalysis} setAiAnalysis={setAiAnalysis} />}
      {activeStep === 2 && <GuidedCorrectionScreen answers={correctionAnswers} setAnswers={setCorrectionAnswers} onNext={() => goToStep(3)} onBack={goBack} aiAnalysis={aiAnalysis} />}
      {activeStep === 3 && (
        <SubmitConfirmationScreen
          payload={backgroundITRPayload}
          setPayload={setBackgroundITRPayload}
          handleReturnToDashboard={handleReturnToDashboard}
          onBack={goBack}
        />
      )}
      {activeStep === 10 && (
        <FormDetectionScreen
          payload={backgroundITRPayload}
          setPayload={setBackgroundITRPayload}
          onNext={() => goToStep(11)}
          onBack={() => goToStep(0)}
        />
      )}
      {activeStep === 11 && (
        <DynamicFormFillerScreen
          payload={backgroundITRPayload}
          setPayload={setBackgroundITRPayload}
          onNext={() => goToStep(12)}
          onBack={() => goToStep(10)}
        />
      )}
      {activeStep === 12 && (
        <TaxSummaryScreen
          payload={backgroundITRPayload}
          setPayload={setBackgroundITRPayload}
          onPayment={() => goToStep(13)}
          onVerification={() => goToStep(14)}
          onBack={() => goToStep(11)}
        />
      )}
      {activeStep === 13 && (
        <PaymentScreen
          payload={backgroundITRPayload}
          setPayload={setBackgroundITRPayload}
          onNext={() => goToStep(14)}
          onBack={() => goToStep(12)}
        />
      )}
      {activeStep === 14 && (
        <SubmitConfirmationScreen
          flowType="filing"
          formType={backgroundITRPayload.recommended_form || 'ITR-1'}
          payload={backgroundITRPayload}
          setPayload={setBackgroundITRPayload}
          handleReturnToDashboard={handleReturnToDashboard}
          onBack={goBack}
        />
      )}

      {/* Fixed disclaimer, locked to h-8 (2rem). Each screen is a flex column of
          [header, scrolling content, action row]; the action row carries pb-12 so its
          buttons always clear this 2rem bar, down to 320px width. */}
      <div className="flex items-center justify-center h-8 text-[10px] sm:text-xs text-center text-gray-500 bg-gray-100 fixed bottom-0 w-full z-50 border-t border-gray-300 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        Prototype — Mock Data — Not affiliated with the Income Tax Department of India.
      </div>
    </div>
  )
}

export default App
