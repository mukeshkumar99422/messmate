function CardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-pulse">
      
      <div className="p-4 md:p-8 space-y-8 md:space-y-10">
        
        {/* SECTION 1: TIMING SKELETON */}
        <div>
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0"></div>
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
          </div>
          
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="h-16 bg-gray-100 rounded-xl"></div>
            <div className="h-16 bg-gray-100 rounded-xl"></div>
          </div>
        </div>

        <div className="h-px bg-gray-100"></div>

        {/* SECTION 2: DIET SKELETON */}
        <div>
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0"></div>
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
          </div>

          {/* List Items */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2 md:gap-3 items-center">
                <div className="w-4 h-4 bg-gray-200 rounded shrink-0"></div>
                <div className="flex-1 h-12 bg-gray-100 rounded-xl"></div>
                <div className="h-11 w-11 md:h-10 md:w-10 shrink-0 bg-gray-100 rounded-xl"></div>
              </div>
            ))}
            
            {/* Add Button Placeholder */}
            <div className="w-full h-12 rounded-xl border-2 border-dashed border-gray-200 mt-2"></div>
          </div>
        </div>

        <div className="h-px bg-gray-100"></div>

        {/* SECTION 3: EXTRAS SKELETON */}
        <div>
           {/* Header */}
           <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0"></div>
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
          </div>

          {/* List Items */}
          <div className="space-y-4 md:space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-3">
                 <div className="flex-1 h-12 bg-gray-100 rounded-xl"></div>
                 <div className="flex gap-3">
                    <div className="flex-1 sm:flex-none sm:w-32 h-12 bg-gray-100 rounded-xl"></div>
                    <div className="h-12 w-12 sm:w-10 shrink-0 bg-gray-100 rounded-xl"></div>
                 </div>
              </div>
            ))}
             {/* Add Button Placeholder */}
             <div className="w-full h-12 rounded-xl border-2 border-dashed border-gray-200 mt-2"></div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS SKELETON */}
      <div className="bg-gray-50 px-6 py-4 md:px-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
         <div className="h-4 w-48 bg-gray-200 rounded"></div>
         <div className="w-full sm:w-40 h-12 bg-gray-300 rounded-xl"></div>
      </div>
    </div>
  );
}

export default CardSkeleton;