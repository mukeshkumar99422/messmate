export default function ReviewAnalysisSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      
      {/* Control Bar Skeleton (matches the "Total Reviews Processed" bar) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-2 w-full sm:w-auto">
          <div className="h-3 w-40 bg-gray-200 rounded mx-auto sm:mx-0"></div>
          <div className="h-4 w-56 bg-gray-100 rounded mx-auto sm:mx-0"></div>
        </div>
        <div className="h-11 w-full sm:w-44 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Tab Card Skeleton */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
        
        {/* Tab Bar */}
        <div className="flex border-b border-b-gray-200 bg-gray-50/50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 py-4 flex justify-center">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Tab Body: mimics AnalyzedItemCard list */}
        <div className="p-4 md:p-6 space-y-4">
          <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>

          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4">
              <div className="flex justify-between items-center gap-4">
                <div className="flex flex-1 items-center gap-3 min-w-0">
                  <div className="h-3 w-3 bg-gray-200 rounded-full shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-4 w-16 bg-gray-100 rounded-md"></div>
                      <div className="h-4 w-16 bg-gray-100 rounded-md"></div>
                    </div>
                  </div>
                </div>
                <div className="h-6 w-14 bg-gray-200 rounded-lg shrink-0"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}