import { useState, useEffect, useCallback } from 'react'
import NoticeIntakeScreen from './components/NoticeIntakeScreen'
import GuidedCorrectionScreen from './components/GuidedCorrectionScreen'
import SubmitConfirmationScreen from './components/SubmitConfirmationScreen'
import DashboardScreen from './components/DashboardScreen'
import AIIntakeScreen from './components/AIIntakeScreen'

const SESSION_KEY = 'tax-assist:flow'

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

  const initialStep = restored?.step !== undefined ? restored.step : 0

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
  // this the native Back arrow would leave the app. After this runs the stack is
  // [step 1, step 2, ... current step] and Back walks 3 -> 2 -> 1.
  useEffect(() => {
    window.history.replaceState({ step: 1 }, '')
    for (let s = 2; s <= initialStep; s += 1) {
      window.history.pushState({ step: s }, '')
    }
  }, [initialStep])

  // Native Back / Forward: mirror whatever history entry we land on into React
  // state instead of unloading the page.
  useEffect(() => {
    const handlePopState = (event) => {
      const target =
        event.state && typeof event.state.step === 'number' ? event.state.step : 0
      setStep(target)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

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

  return (
    <div>
      {step === 0 && (
        <DashboardScreen
          onSelectDefectiveReturn={() => goToStep(1)}
          onSelectFreshFiling={() => goToStep(10)}
        />
      )}
      {step === 1 && <NoticeIntakeScreen onNext={() => goToStep(2)} aiAnalysis={aiAnalysis} setAiAnalysis={setAiAnalysis} />}
      {step === 2 && <GuidedCorrectionScreen answers={correctionAnswers} setAnswers={setCorrectionAnswers} onNext={() => goToStep(3)} onBack={goBack} aiAnalysis={aiAnalysis} />}
      {step === 3 && <SubmitConfirmationScreen handleReturnToDashboard={handleReturnToDashboard} onBack={goBack} />}
      {step === 10 && (
        <AIIntakeScreen
          payload={backgroundITRPayload}
          setPayload={setBackgroundITRPayload}
          onBack={() => goToStep(0)}
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
