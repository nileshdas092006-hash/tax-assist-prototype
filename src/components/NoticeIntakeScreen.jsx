import React, { useState, useEffect } from 'react';
import mockData from '../data/mockNotice.json';
import { fetchNoticeTranslation } from '../utils/translateNotice';

const NoticeIntakeScreen = ({ onNext, aiAnalysis, setAiAnalysis }) => {
  const [showOfficial, setShowOfficial] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (aiAnalysis !== null) return;

    let cancelled = false;

    const runTranslation = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const result = await fetchNoticeTranslation(mockData.official_legal_text);
        if (cancelled) return;
        if (result) {
          setAiAnalysis(result);
        } else {
          setApiError('The AI translation returned an empty response. Please try again.');
        }
      } catch (err) {
        if (!cancelled) {
          setApiError('Failed to connect to the AI service. Please check your connection.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    runTranslation();
    return () => { cancelled = true; };
  }, [aiAnalysis, setAiAnalysis]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start">
      {/* Mobile Constraint Wrapper */}
      <div className="w-full max-w-[360px] bg-white shadow-xl min-h-screen relative flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="bg-[#113C7A] text-white p-5 rounded-b-2xl shadow-md z-10">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-200 opacity-90 mb-1">Notice Type</p>
              <h1 className="text-lg font-extrabold leading-tight">{mockData.section}</h1>
            </div>
            <div className="bg-[#E74C3C] text-white text-xs font-black px-3 py-1.5 rounded-full shadow-sm flex-shrink-0 animate-pulse">
              {mockData.deadline_days_left} Days Remaining
            </div>
          </div>
          <div className="mt-1 pt-3 border-t border-blue-800 text-xs text-blue-100 font-medium">
             Ref: <span className="font-mono">{mockData.notice_id}</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="p-5 flex-grow flex flex-col space-y-6 overflow-y-auto pb-24">
          
          <div>
            <h2 className="text-[22px] font-black text-gray-900 leading-tight">
              Action Required
            </h2>
            <p className="text-gray-500 text-sm mt-1">Please review the details below.</p>
          </div>

          {/* Plain English Summary Card — Dynamic */}
          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-xl p-4 shadow-sm">
            <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-2 flex items-center">
              <span className="mr-2">💡</span> Plain English Summary
            </h3>

            {isLoading && (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-blue-200 rounded w-full"></div>
                <div className="h-4 bg-blue-200 rounded w-5/6"></div>
                <div className="h-4 bg-blue-200 rounded w-4/6"></div>
                <p className="text-blue-600 text-xs font-bold mt-2">✨ AI is analyzing this notice...</p>
              </div>
            )}

            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm font-medium">{apiError}</p>
                <button
                  onClick={() => { setAiAnalysis(null); }}
                  className="mt-2 text-xs font-bold text-red-600 underline"
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !apiError && aiAnalysis && (
              <div>
                <p className="text-gray-800 text-[15px] font-medium leading-relaxed">
                  {aiAnalysis.plain_summary}
                </p>
                <div className="mt-3 bg-blue-100/60 rounded-lg p-3">
                  <p className="text-blue-900 text-sm font-bold flex items-start">
                    <span className="mr-2 flex-shrink-0">👉</span>
                    {aiAnalysis.what_they_need_to_do}
                  </p>
                </div>
              </div>
            )}

            {!isLoading && !apiError && !aiAnalysis && (
              <p className="text-gray-800 text-[15px] font-medium leading-relaxed">
                Your bank deducted tax on your FD interest, but your tax form reported ₹0 income. The tax office just wants you to declare the interest earned.
              </p>
            )}
          </div>

          {/* Official Text Accordion */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <button 
              onClick={() => setShowOfficial(!showOfficial)}
              className="w-full flex justify-between items-center p-4 min-h-[56px] hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
              aria-expanded={showOfficial}
            >
              <span className="font-bold text-gray-700 text-sm flex items-center">
                <span className="mr-2">📄</span> View Official Notice Text
              </span>
              <span className="text-gray-400 font-bold text-lg">
                {showOfficial ? '−' : '+'}
              </span>
            </button>
            
            {showOfficial && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 font-mono leading-relaxed">
                  {mockData.official_legal_text}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer CTA */}
        <div className="p-4 bg-white border-t border-gray-100 absolute bottom-0 left-0 right-0 z-20 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
          <button 
            onClick={onNext}
            disabled={isLoading}
            className={`w-full min-h-[56px] text-white font-extrabold text-[17px] rounded-xl shadow-lg transition-transform active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-green-200 flex justify-center items-center ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#27AE60] hover:bg-[#219653] active:bg-[#1E8449]'}`}
          >
            Fix This in 2 Minutes &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};

export default NoticeIntakeScreen;

