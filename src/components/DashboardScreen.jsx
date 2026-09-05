import React from 'react';

export default function DashboardScreen({ onSelectFreshFiling, onSelectDefectiveReturn }) {
  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-[360px] mx-auto relative overflow-hidden font-sans shadow-xl sm:border-x sm:border-gray-200">
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center tracking-tight">
          Tax Assist
        </h1>
        <p className="text-gray-500 text-center mb-8 px-4">
          How can we help you with your taxes today?
        </p>

        <div className="w-full space-y-4">
          <button
            onClick={onSelectFreshFiling}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-between group"
          >
            <span className="flex items-center gap-3">
              <span className="bg-white/20 p-2 rounded-lg">✨</span>
              Start Fresh Filing
            </span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
          
          <button
            onClick={onSelectDefectiveReturn}
            className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-4 px-6 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-between group"
          >
            <span className="flex items-center gap-3">
              <span className="bg-gray-100 p-2 rounded-lg">⚠️</span>
              Fix Defective Return
            </span>
            <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
