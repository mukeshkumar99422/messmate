import { MEALS } from "../../assets/assets";

function MealSelector({ activeMeal, onClickHandler, meals = MEALS }) {
  return (
    <div className="max-w-7xl mx-auto mb-6 md:mb-8 flex justify-center px-2">
      <div className="grid grid-cols-3 sm:inline-flex w-full sm:w-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-1 sm:p-1.5 gap-1">
        {meals.map((meal) => (
          <button
            key={meal}
            onClick={() => onClickHandler(meal)}
            className={`min-w-0 sm:flex-none px-2 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-xl font-bold capitalize text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 outline-none focus:outline-none
            ${
              activeMeal === meal
                ? "bg-green-600 text-white shadow-md shadow-green-200"
                : "text-gray-500 hover:bg-green-50 hover:text-green-600"
            }`}
          >
            <span className="truncate">{meal}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MealSelector;