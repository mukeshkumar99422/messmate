export default function HostelCardSkeleton() {
  return (
    <div className="bg-white rounded-4xl shadow-xl shadow-gray-100/50 border border-gray-200 flex flex-col overflow-hidden animate-pulse">
      
      {/* Card Header Area */}
      <div className="p-6 pb-4">
        {/* Hostel Name Skeleton */}
        <div className="h-7 w-3/4 bg-gray-200 rounded-lg mb-2"></div>
        
        {/* Hostel ID Skeleton */}
        <div className="h-4 w-1/3 bg-gray-100 rounded-md mb-6"></div>

        {/* Side-by-Side Tags Skeleton */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Gender Tag Skeleton */}
          <div className="h-10 w-24 bg-gray-200 rounded-xl"></div>
          
          {/* Student Count Tag Skeleton */}
          <div className="h-10 w-32 bg-gray-100 rounded-xl"></div>
        </div>
      </div>

      {/* Footer Link Skeleton */}
      <div className="mt-auto px-6 pb-6">
        {/* Horizontal Line */}
        <div className="h-px bg-gray-100 w-full mb-4"></div>
        
        {/* Center Link Text Skeleton */}
        <div className="flex justify-center">
          <div className="h-4 w-32 bg-gray-100 rounded"></div>
        </div>
      </div>
      
    </div>
  );
}