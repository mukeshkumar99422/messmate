import MealSkeleton from "./MealSkeleton";

function DaySkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MealSkeleton />
        <MealSkeleton />
        <MealSkeleton />
      </div>
    </div>
  );
}

export default DaySkeleton;