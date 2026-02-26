const mongoose = require('mongoose');

//helper
const mealSchema = new mongoose.Schema({
    time: { // 24hr format "HH:mm"
        start: {type: String},
        end: {type: String}
    },
    diet: [{name: String}],
    extras: [{name: String, price: Number}]
}, {_id: false});

//helper
const daySchema = new mongoose.Schema({
    breakfast: mealSchema,
    lunch: mealSchema,
    dinner: mealSchema,
}, {_id: false});

//main schema
const WeeklyMenuSchema = new mongoose.Schema({
    hostel: {
        type: String,
        ref: 'Hostel',
        required: true,
        unique: true
    },
    updatedOn: {
        type: Date,
        default: Date.now
    },
    menu: {
        monday: daySchema,
        tuesday: daySchema,
        wednesday: daySchema,
        thursday: daySchema,
        friday: daySchema,
        saturday: daySchema,
        sunday: daySchema
    }
}, { timestamps: true });

const WeeklyMenu = mongoose.model('WeeklyMenu', WeeklyMenuSchema);
module.exports = WeeklyMenu;