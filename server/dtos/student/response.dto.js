const { shapeExtraItem } = require('../menu/response.dto');

// -------------------------------------------------------
// not strictly needed dtos
// as the controller already hand-builds this object field-by-field
// therefore no data leak risk
// kept for consistancy
// --------------------------------------------------------

/**
 * GET /extras response shaper.
 */
const ExtrasListResponseDTO = (extrasArray) =>
    (extrasArray || []).filter(Boolean).map(shapeExtraItem);

/**
 * GET /analyse-purchases response shaper.
 */
const AnalysePurchasesResponseDTO = ({ totalAmount, totalItems, uniqueDayCount, pie, topItems, trend }) => ({
    generalStats: {
        total: totalAmount,
        count: totalItems,
        avgPerDay: uniqueDayCount > 0 ? Math.round(totalAmount / uniqueDayCount) : 0,
        pie,
        items: topItems,
    },
    trendStats: trend.map(t => ({ date: t._id, total: t.total })),
});

// --------------------------------------------------------
// needed dtos
// --------------------------------------------------------

/**
 * POST /purchase response shaper.
 */
const PurchaseResponseDTO = (purchase) => ({
    id: purchase._id,
    date: purchase.date,
    meal: purchase.meal,
    items: purchase.items.map(i => ({
        itemId: i.item,
        name: i.name,
        price: i.price,
        qty: i.qty,
    })),
    totalAmount: purchase.totalAmount,
    createdAt: purchase.createdAt,
});

/**
 * POST /rate response shaper.
 */
const RatingResponseDTO = (rating) => ({
    id: rating._id,
    itemId: rating.item,
    itemName: rating.itemName,
    itemType: rating.itemType,
    meal: rating.meal,
    rating: rating.rating,
    tags: rating.tags,
    suggestion: rating.suggestion,
    createdAt: rating.createdAt,
});

module.exports = {
    PurchaseResponseDTO,
    RatingResponseDTO,
    ExtrasListResponseDTO,
    AnalysePurchasesResponseDTO,
};