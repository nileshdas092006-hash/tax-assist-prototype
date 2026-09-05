import React, { useState } from 'react';
import mockData from '../data/mockNotice.json';

const GuidedCorrectionScreen = ({ onNext, onBack, answers, setAnswers, aiAnalysis }) => {
  const [validationError, setValidationError] = useState('');

  // Resolve questions: prefer AI-generated, fall back to mock data
  const questions = aiAnalysis?.guided_questions ?? mockData.guided_questions ?? [];

  const validateAmount = (value) => {
    if (!value || String(value).trim() === '') {
      return { isValid: false, errorMessage: "Please enter a valid amount." };
    }
    // Strip ₹ and commas, but preserve the decimal point
    const stripped = String(value).replace(/[₹,]/g, '').trim();
    if (isNaN(stripped) || stripped === '') {
      return { isValid: false, errorMessage: "Please enter numbers only." };
    }

    // Ensure up to 2 decimal places max
    if (!/^\d+(\.\d{1,2})?$/.test(stripped)) {
      return { isValid: false, errorMessage: "Amount can only have up to 2 decimal places." };
    }

    const num = parseFloat(stripped);
    if (num <= 0) {
      return { isValid: false, errorMessage: "Amount must be greater than ₹0." };
    }
    if (num > 100000000) {
      return { isValid: false, errorMessage: "Amount cannot exceed ₹10,00,00,000." };
    }
    return { isValid: true, errorMessage: "" };
  };

  // Derived boolean from the current value in answers
  const numericQuestion = questions.find(q => q.type === 'currency' || q.type === 'numeric');
  const isAmountValid = numericQuestion ? validateAmount(answers[numericQuestion.id]).isValid : true;

  const q1Id = questions[0]?.id;
  const isQ1Answered = q1Id ? answers[q1Id] !== undefined : false;
  const isQ1True = q1Id ? answers[q1Id] === true : false;

  const handleAnswerChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    const q = questions.find(q => q.id === id);
    if (q && (q.type === 'currency' || q.type === 'numeric')) {
      const validation = validateAmount(value);
      setValidationError(validation.errorMessage);
    }
  };

  const computeCorrectedReturnPayload = (currentAnswers) => {
    let numericValue = '0';
    if (isQ1True && isAmountValid && numericQuestion) {
      const rawValue = currentAnswers[numericQuestion.id];
      // Preserve decimal point by allowing . in regex
      numericValue = rawValue ? String(rawValue).replace(/[^0-9.]/g, '') : '0';
    }
    
    const payload = {
      noticeId: mockData.notice_id,
      action: "CORRECT_DEFECT",
      payload: {
        scheduleTDS: {
          claimed: true
        },
        schedulePartB_TTI: {
          originalGrossTotalIncome: 0,
          correctedGrossTotalIncome: parseFloat(numericValue) || 0
        }
      },
      timestamp: new Date().toISOString()
    };
    console.log("🚀 Simulated Corrected JSON Payload Generated:");
    console.log(JSON.stringify(payload, null, 2));
    return payload;
  };

  const handleNext = () => {
    if (isQ1True && numericQuestion) {
      const validation = validateAmount(answers[numericQuestion.id]);
      if (!validation.isValid) {
        setValidationError(validation.errorMessage);
        return;
      }
    }
    computeCorrectedReturnPayload(answers);
    if(onNext) onNext();
  };

  let isButtonDisabled = false;
  let buttonText = "Verification \u2192";
  
  if (!isQ1Answered) {
    isButtonDisabled = true;
    buttonText = "Please answer Question 1";
  } else if (!isQ1True) {
    isButtonDisabled = false;
  } else {
    isButtonDisabled = !isAmountValid || validationError !== '';
  }

  return (
    <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-start">
      {/* Mobile Constraint Wrapper */}
      <div className="w-full max-w-[360px] bg-white shadow-xl h-dvh relative flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="bg-[#113C7A] text-white p-5 rounded-b-2xl shadow-md z-10">
          <h1 className="text-xl font-extrabold leading-tight">Guided Correction</h1>
          <p className="text-blue-200 text-xs mt-1">Replacing the "Offline Utility"</p>
        </header>

        {/* Scrollable Content */}
        <div className="p-5 flex-grow min-h-0 space-y-6 overflow-y-auto pb-4">
          
          {questions.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
              <p className="text-yellow-800 text-sm font-bold">⚠️ Unable to generate dynamic questions.</p>
              <p className="text-yellow-700 text-xs mt-2">Please consult a tax professional or try again later.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((q, index) => {
                // Only render subsequent questions if Q1 is true
                if (index > 0 && !isQ1True) {
                  return null;
                }
                
                return (
                  <div key={q.id} className="bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm">
                    <label className="block text-sm font-bold text-gray-800 mb-3 leading-snug">
                      <span className="text-blue-600 mr-2">Q{index + 1}.</span> 
                      {q.question}
                    </label>
                    
                    {q.type === 'boolean' && (
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleAnswerChange(q.id, true)}
                          className={`flex-1 min-h-[48px] rounded-lg font-bold border-2 transition-colors focus:outline-none ${answers[q.id] === true ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'}`}
                        >
                          Yes
                        </button>
                        <button 
                          onClick={() => handleAnswerChange(q.id, false)}
                          className={`flex-1 min-h-[48px] rounded-lg font-bold border-2 transition-colors focus:outline-none ${answers[q.id] === false ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'}`}
                        >
                          No
                        </button>
                      </div>
                    )}

                    {(q.type === 'currency' || q.type === 'numeric') && (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">₹</span>
                        <input 
                          type="text" 
                          placeholder={q.placeholder || 'Enter amount'}
                          value={answers[q.id] || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          onBlur={(e) => {
                            const validation = validateAmount(e.target.value);
                            setValidationError(validation.errorMessage);
                          }}
                          className={`w-full min-h-[48px] pl-8 pr-4 border-2 rounded-lg text-lg font-bold text-gray-900 focus:outline-none transition-all ${
                            validationError 
                              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                          }`}
                        />
                        {validationError && (
                          <p className="text-xs text-red-600 mt-1 font-medium">{validationError}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Dynamic Preview Card */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-inner mt-4">
            <h3 className="text-xs font-black text-green-800 uppercase tracking-widest mb-3 flex items-center">
              <span className="mr-2">🔄</span> Live Correction Preview
            </h3>
            
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-green-200/50">
              <span className="text-sm font-medium text-gray-600">Original Reported Income:</span>
              <span className="font-mono font-bold text-red-500 line-through">₹0</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900">Corrected Income:</span>
              <span className="font-mono font-black text-green-700 text-lg">
                {(() => {
                  if (!isQ1True || !isAmountValid) return '₹0';
                  const nq = questions.find(q => q.type === 'currency' || q.type === 'numeric');
                  const val = nq ? answers[nq.id] : null;
                  return val ? `₹${String(val).replace(/[^0-9.]/g, '')}` : '₹0';
                })()}
              </span>
            </div>
          </div>

        </div>

        {/* Sticky Footer CTAs */}
        <div className="p-4 pb-12 bg-white border-t border-gray-100 shrink-0 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] flex space-x-3">
          <button 
            onClick={onBack}
            className="w-1/3 min-h-[56px] bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-extrabold text-sm rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            &larr; Back
          </button>
          
          <button 
            onClick={handleNext}
            disabled={isButtonDisabled}
            className="w-2/3 min-h-[56px] text-white font-extrabold text-sm rounded-xl shadow-lg transition-transform focus:outline-none focus:ring-4 focus:ring-green-200 bg-[#27AE60] hover:bg-[#219653] active:bg-[#1E8449] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:active:scale-100 disabled:hover:bg-gray-400"
          >
            {buttonText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default GuidedCorrectionScreen;
