const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },

    itemName: { type: String, required: true },
    itemType: { type: String, enum: ['diet', 'extra'], required: true },
    meal: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
    
    rating: { type: Number, required: true, min: 1, max: 5 },
    tags: [{ type: String }],
    suggestion: { type: String }
}, { timestamps: true });

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;