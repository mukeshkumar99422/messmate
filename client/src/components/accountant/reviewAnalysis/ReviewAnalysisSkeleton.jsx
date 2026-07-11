export default function ReviewAnalysisSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* KPI Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl h-24 border border-gray-100 p-4"></div>
        ))}
      </div>

      {/* Main Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 h-96"></div>
        <div className="bg-white rounded-3xl p-6 border border-gray-100 h-96"></div>
      </div>
    </div>
  );
}