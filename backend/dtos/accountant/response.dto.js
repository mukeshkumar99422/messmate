/**
 * PUT /menu/today response shaper.
 */
const DailyMenuUpdateResponseDTO = (dailyMenuDoc, meal) => ({
    date: dailyMenuDoc.date,
    meal,
    time: dailyMenuDoc[meal]?.time || null,
    diet: dailyMenuDoc[meal]?.diet || [],     // unpopulated Item ObjectIds
    extras: dailyMenuDoc[meal]?.extras || [], // unpopulated Item ObjectIds
    updated: dailyMenuDoc[meal]?.updated ?? true,
});

/**
 * PATCH /item/price response shaper.
 */
const ItemResponseDTO = (item) => ({
    id: item._id,
    name: item.name,
    type: item.type,
    price: item.price,
    isActive: item.isActive,
});

/**
 * GET /reviews/analyse response shaper.
 */
const ReviewAnalysisResponseDTO = (analysis) => ({
    hostelId: analysis.hostel,
    totalReviewsAnalyzed: analysis.totalReviewsAnalyzed,
    lastAnalyzedAt: analysis.lastAnalyzedAt,
    topComplimentedItems: analysis.topComplimentedItems,
    topComplainedItems: analysis.topComplainedItems,
    completelyReplaceOrRemove: analysis.completelyReplaceOrRemove,
    needsBetterManagement: analysis.needsBetterManagement,
});

module.exports = {
    DailyMenuUpdateResponseDTO,
    ItemResponseDTO,
    ReviewAnalysisResponseDTO,
};