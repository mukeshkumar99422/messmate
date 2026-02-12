import { DAYS } from "../../assets/assets"
function DaySelector({activeDay, onClickHandler, days=DAYS}) {
  return (
    <div className="max-w-7xl mx-auto mb-6 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex md:justify-center min-w-max gap-3 px-2">
            {days.map((day) => (
            <button
                key={day}
                onClick={() => onClickHandler(day)}
                className={`px-6 py-2.5 rounded-full font-bold capitalize text-sm transition-all duration-200 border outline-none focus:outline-none
                ${activeDay === day
                    ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-200" 
                    : "bg-white text-gray-500 border-gray-100 hover:border-green-200 hover:bg-green-50 hover:text-green-600 shadow-sm"
                }`}
            >
                {day}
            </button>
            ))}
        </div>
    </div>
  )
}

export default DaySelector