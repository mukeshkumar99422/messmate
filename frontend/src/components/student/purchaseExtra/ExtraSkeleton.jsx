function ExtraSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse flex justify-between items-center h-22">
      <div className="space-y-2.5 w-full">
        <div className="h-5 bg-gray-200 rounded-md w-1/2"></div>
        <div className="h-6 bg-gray-100 rounded-md w-12"></div>
      </div>
      <div className="flex gap-2 bg-gray-50 p-1 rounded-full border border-gray-100">
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        <div className="h-8 w-8 bg-transparent"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
}

export default ExtraSkeleton;