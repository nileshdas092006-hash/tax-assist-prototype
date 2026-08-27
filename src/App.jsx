import React, { useState } from 'react'
import NoticeIntakeScreen from './components/NoticeIntakeScreen'
import GuidedCorrectionScreen from './components/GuidedCorrectionScreen'
import SubmitConfirmationScreen from './components/SubmitConfirmationScreen'

function App() {
  const [step, setStep] = useState(1);
  const [correctionAnswers, setCorrectionAnswers] = useState({});
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const handleReturnToDashboard = () => {
    setStep(1);
    setCorrectionAnswers({});
    setAiAnalysis(null);
  };

  return (
    <div className="pb-12">
      {step === 1 && <NoticeIntakeScreen onNext={() => setStep(2)} aiAnalysis={aiAnalysis} setAiAnalysis={setAiAnalysis} />}
      {step === 2 && <GuidedCorrectionScreen answers={correctionAnswers} setAnswers={setCorrectionAnswers} onNext={() => setStep(3)} onBack={() => setStep(1)} aiAnalysis={aiAnalysis} />}
      {step === 3 && <SubmitConfirmationScreen handleReturnToDashboard={handleReturnToDashboard} onBack={() => setStep(2)} />}
      
      <div className="text-[10px] sm:text-xs text-center text-gray-500 bg-gray-100 py-2 fixed bottom-0 w-full z-50 border-t border-gray-300 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        Prototype — Mock Data — Not affiliated with the Income Tax Department of India.
      </div>
    </div>
  )
}

export default App
