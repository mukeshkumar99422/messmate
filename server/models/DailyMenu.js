const mongoose = require('mongoose');

const mealOverrideSchema = new mongoose.Schema({
    time: {
        start: String,
        end: String
    },
    diet: [{name: String}],
    extras: [{name: String, price: Number}],
    updated: {type: Boolean, default: true}
}, {_id: false});

const dailyMenuSchema = new mongoose.Schema({
  hostel: { type: String, ref: 'Hostel', required: true },
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  breakfast: mealOverrideSchema,
  lunch: mealOverrideSchema,
  dinner: mealOverrideSchema
}, { timestamps: true });

//ensure one menu per hostel per day
dailyMenuSchema.index({ hostel: 1, date: 1 }, { unique: true });

const DailyMenu = mongoose.model('DailyMenu', dailyMenuSchema);
module.exports = DailyMenu;