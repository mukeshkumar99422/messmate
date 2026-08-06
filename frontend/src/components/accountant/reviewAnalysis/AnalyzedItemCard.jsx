import React, { useState } from 'react';

export default function AnalyzedItemCard({ item, type }) {
  const isCompliment = type === 'compliment';
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all duration-300 cursor-pointer select-none"
    >
      <div>
        {/* Card Header Row */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-1 items-center gap-3 min-w-0">
            {/* Expansion Arrow indicator icon wrapper */}
            <div className="shrink-0 text-gray-400 text-xs transition-transform duration-200">
              <i className={`fa-solid fa-chevron-right ${isExpanded ? 'rotate-90 text-green-600' : ''}`}></i>
            </div>
            
            <div className="truncate">
              <h4 className="font-bold text-gray-800 text-sm md:text-base capitalize truncate">{item.itemName}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-orange-50 text-orange-600 border border-orange-100/50">
                  {item.meal}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-purple-50 text-purple-600 border border-purple-100/50">
                  {item.itemType}
                </span>
              </div>
            </div>
          </div>

          {/* Rating Badge display frame */}
          <div className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-extrabold shadow-xs ${
            isCompliment ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            <i className="fa-solid fa-star text-[9px]"></i>
            <span>{item.averageRating.toFixed(1)}</span>
          </div>
        </div>

        {/* Collapsible Content Area */}
        <div className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-gray-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'
        }`}>
          <div className="overflow-hidden space-y-4">
            
            {/* Sentiment Block Quote */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Student Sentiment</p>
              <span className="text-sm font-medium text-gray-600 italic">"{item.sentiment}"</span>
            </div>

            {/* Insights and actionable recommendations layout mapping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  {isCompliment ? 'What Students Appreciate' : 'What Students Disliked'}
                </span>
                <ul className="space-y-1">
                  {item.insights.map((insight, idx) => (
                    <li key={idx} className="text-xs font-semibold text-gray-600 flex items-start gap-1.5">
                      <span className={`text-[10px] ${isCompliment ? 'text-green-500' : 'text-red-400'}`}>
                        {isCompliment ? '✓' : '•'}
                      </span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Recommended Corrections</span>
                <ul className="space-y-1">
                  {item.actionableSteps.map((step, idx) => (
                    <li key={idx} className="text-xs font-medium text-gray-500 flex items-start gap-1.5">
                      <span className="text-purple-500 text-[9px] mt-0.5">➔</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}