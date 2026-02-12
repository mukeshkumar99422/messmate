function MealSkeleton() {
  return (
    <div className="bg-gray-50/40 rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-100 rounded"></div>
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-2">
            <div className="h-2 w-2 bg-gray-200 rounded-full mt-1.5"></div>
            <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MealSkeleton;