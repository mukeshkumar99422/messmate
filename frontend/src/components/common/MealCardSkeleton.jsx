function MealCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 h-95 animate-pulse flex flex-col">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
           <div className="space-y-2">
             <div className="h-4 w-24 bg-gray-200 rounded"></div>
             <div className="h-3 w-16 bg-gray-100 rounded"></div>
           </div>
        </div>
        <div className="h-6 w-16 bg-gray-100 rounded-lg"></div>
      </div>
      
      {/* List Items Skeleton */}
      <div className="space-y-4 mb-8 flex-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
            <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>

      {/* Extras Skeleton */}
      <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="h-3 w-20 bg-gray-200 rounded mb-3"></div>
          <div className="h-10 w-full bg-gray-50 rounded-xl mb-2"></div>
          <div className="h-10 w-full bg-gray-50 rounded-xl"></div>
      </div>
    </div>
  );
}

export default MealCardSkeleton;