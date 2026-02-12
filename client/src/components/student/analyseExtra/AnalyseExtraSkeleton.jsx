function AnalyseExtraSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
       <div className="flex items-center gap-2 mb-6">
         <div className="h-8 w-8 bg-gray-100 rounded-lg animate-pulse"></div>
         <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse"></div>
       </div>
       <div className="h-62.5 bg-gray-50 rounded-xl animate-pulse w-full"></div>
    </div>
  );
}

export default AnalyseExtraSkeleton;