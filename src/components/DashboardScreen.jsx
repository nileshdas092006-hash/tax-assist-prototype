import React from 'react';

export default function DashboardScreen({ onSelectFreshFiling, onSelectDefectiveReturn }) {
  return (
    <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-start">
    <div className="w-full max-w-[360px] bg-gray-50 shadow-xl h-dvh relative flex flex-col overflow-hidden font-sans sm:border-x sm:border-gray-200">

      {/* Header */}
      <div className="bg-[#113C7A] text-white px-5 pt-12 pb-8 rounded-b-3xl shadow-lg relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            TaxAssist
          </h1>
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 text-green-100 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Assessment Year 2026-27 Active
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-8 pb-16 -mt-4 relative z-0">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
          Select Service
        </h2>

        <div className="space-y-4">
          
          {/* Card 1: Fresh Filing */}
          <button
            onClick={onSelectFreshFiling}
            className="w-full text-left bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-5 shadow-[0_4px_10px_-2px_rgba(0,0,0,0.05)] transition-all active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-bl-xl z-10">
              Fast Track
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="pr-4">
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">File Fresh Return</h3>
                <p className="text-gray-500 text-xs leading-relaxed font-medium">
                  AI-guided 2-minute filing for salaried individuals.
                </p>
              </div>
            </div>
          </button>
          
          {/* Card 2: Defective Notice */}
          <button
            onClick={onSelectDefectiveReturn}
            className="w-full text-left bg-white border border-gray-200 hover:border-orange-300 rounded-2xl p-5 shadow-[0_4px_10px_-2px_rgba(0,0,0,0.05)] transition-all active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-bl-xl z-10">
              Notice Fixer
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0 border border-orange-100 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="pr-4">
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">Resolve Defective Notice</h3>
                <p className="text-gray-500 text-xs leading-relaxed font-medium">
                  Section 139(9) legal notice translation & guided fix.
                </p>
              </div>
            </div>
          </button>

        </div>
      </div>
    </div>
    </div>
  );
}
