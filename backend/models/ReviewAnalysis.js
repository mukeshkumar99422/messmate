const mongoose = require('mongoose');

const itemReportSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    meal: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
    itemType: { type: String, enum: ['diet', 'extra'], required: true },
    averageRating: { type: Number, required: true },
    sentiment: { type: String, required: true },
    insights: [{ type: String }], // What students liked / disliked
    actionableSteps: [{ type: String }]
}, { _id: false });

const reviewAnalysisSchema = new mongoose.Schema({
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, unique: true },
    totalReviewsAnalyzed: { type: Number, required: true },
    lastAnalyzedAt: { type: Date, default: Date.now },
    
    topComplimentedItems: [itemReportSchema],
    topComplainedItems: [itemReportSchema],
    
    completelyReplaceOrRemove: [{ type: String }],
    needsBetterManagement: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('ReviewAnalysis', reviewAnalysisSchema);