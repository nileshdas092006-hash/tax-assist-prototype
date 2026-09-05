import React, { useState, useEffect } from 'react';
import { fetchIntakeQuestions } from '../utils/fetchIntakeQuestions';

export default function AIIntakeScreen({ payload, setPayload, onNext, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [recommendedForm, setRecommendedForm] = useState(null);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      const data = await fetchIntakeQuestions();
      setQuestions(data.questions || []);
      setLoading(false);
    }
    loadQuestions();
  }, []);

  const determineITRForm = (finalPayload) => {
    const isBusiness = finalPayload.employment_type === 'business';
    const hasGains = finalPayload.capital_gains === 'yes';
    const hasForeign = finalPayload.foreign_assets === 'yes';

    if (isBusiness) {
      return hasGains || hasForeign ? 'ITR-3' : 'ITR-4';
    } else {
      return hasGains || hasForeign ? 'ITR-2' : 'ITR-1';
    }
  };

  const handleOptionSelect = (questionId, value) => {
    const newPayload = { ...payload, [questionId]: value };
    setPayload(newPayload);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finished all questions
      const form = determineITRForm(newPayload);
      setRecommendedForm(form);
      setPayload({ ...newPayload, recommended_form: form });
      setIsComplete(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-start">
      <div className="w-full max-w-[360px] bg-gray-50 shadow-xl h-dvh relative flex flex-col overflow-hidden sm:border-x sm:border-gray-200">
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 animate-pulse text-sm">AI is building your profile...</p>
        </div>
      </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-start">
      <div className="w-full max-w-[360px] bg-gray-50 shadow-xl h-dvh relative flex flex-col overflow-hidden sm:border-x sm:border-gray-200">
        <div className="flex flex-col items-center justify-center flex-1 min-h-0 overflow-y-auto p-6 pb-12 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Analysis Complete</h2>
          <p className="text-gray-600 text-sm">
            Based on your taps, we are building an <strong className="text-blue-700 bg-blue-50 px-2 py-1 rounded">{recommendedForm}</strong> form for you.
          </p>
          <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-left text-xs text-gray-500 font-mono overflow-auto mb-4">
            <p className="font-semibold text-gray-700 mb-2 font-sans">Compiled Payload:</p>
            <pre>{JSON.stringify(payload, null, 2)}</pre>
          </div>
          <button
            onClick={onNext}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl shadow-md transition-all active:scale-95"
          >
            Continue
          </button>
        </div>
      </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) return null;

  return (
    <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-start">
    <div className="w-full max-w-[360px] bg-gray-50 shadow-xl h-dvh relative flex flex-col overflow-hidden sm:border-x sm:border-gray-200">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm z-10 flex items-center border-b border-gray-200 shrink-0">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 transition-colors p-1 -ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-sm font-semibold text-gray-800 tracking-wide">
          Question {currentIndex + 1} of {questions.length}
        </h1>
        <div className="w-6"></div> {/* Spacer for centering */}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1.5">
        <div 
          className="bg-blue-600 h-1.5 transition-all duration-300 ease-out" 
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Scrollable Content — options sit in flow, pb clears the disclaimer bar */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-8 pb-14">
        <h2 className="text-xl font-bold text-gray-900 mb-8 leading-tight">
          {currentQuestion.text}
        </h2>
        
        <div className="flex flex-col space-y-4">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(currentQuestion.id, option.value)}
              className="w-full text-left bg-white border border-gray-200 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-4 shadow-sm hover:shadow transition-all active:scale-95 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800 group-hover:text-blue-700">
                  {option.label}
                </span>
                <span className="text-gray-300 group-hover:text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
