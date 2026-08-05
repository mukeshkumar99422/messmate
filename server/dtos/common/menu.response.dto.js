//---------------------------------------------------------------------
// Shared menu response shaper.
// Used by BOTH:
// - controllers/studentController.js  (fetchTodayMenu, fetchMenuByDay)
// - controllers/accountantController.js (fetchTodayMenu, menu/weekly)
//----------------------------------------------------------------------

const shapeDietItem = (item) => (item ? { _id: item._id, name: item.name } : null);

const shapeExtraItem = (item) => (item ? { _id: item._id, name: item.name, price: item.price } : null);

const MEALS = ['breakfast', 'lunch', 'dinner'];
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * Shapes a single meal slot (breakfast/lunch/dinner data).
 */
const shapeMeal = (mealData) => {
    if (!mealData) {
        return { time: null, diet: [], extras: [], updated: false };
    }
    return {
        time: mealData.time ?? null,
        // .filter(Boolean): removes all "falsy"(null, undefined, 0, false, "", NaN) values from the array
        diet: (mealData.diet || []).filter(Boolean).map(shapeDietItem),
        extras: (mealData.extras || []).filter(Boolean).map(shapeExtraItem),
        updated: !!mealData.updated,
    };
};

/**
 * Shapes a full day's menu: { breakfast, lunch, dinner }
 * Used for GET /menu/today (student + accountant)
 */
const MenuResponseDTO = (menuByMeal) => {
    const shaped = {};
    MEALS.forEach(meal => {
        shaped[meal] = shapeMeal(menuByMeal[meal]);
    });
    return shaped;
};

/**
 * Same as MenuResponseDTO but prefixed with the day name.
 * Used for GET /menu/day/:day (student)
 */
const DayMenuResponseDTO = (day, menuByMeal) => ({
    day,
    ...MenuResponseDTO(menuByMeal),
});

/**
 * used for GET /menu/weekly and POST /menu/weekly (accountant).
 */
const WeeklyMenuResponseDTO = (weeklyMenuDoc) => {
    const menu = {};
    DAYS.forEach(day => {
        menu[day] = MenuResponseDTO(weeklyMenuDoc.menu[day] || {});
    });
    return {
        updatedOn: weeklyMenuDoc.updatedOn,
        menu,
    };
};


module.exports = {shapeDietItem, shapeExtraItem, shapeMeal, MenuResponseDTO, DayMenuResponseDTO, WeeklyMenuResponseDTO };