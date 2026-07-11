const { Type } = require('@google/genai');

// fetch menu from image
const MealDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        time: {
            type: Type.OBJECT,
            properties: {
                start: { type: Type.STRING },
                end: { type: Type.STRING }
            },
            required: ['start', 'end']
        },
        diet: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING }
                },
                required: ['name']
            }
        },
        extras: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    price: { type: Type.NUMBER }
                },
                required: ['name', 'price']
            }
        }
    },
    required: ['time', 'diet', 'extras']
};

const DayMenuSchema = {
    type: Type.OBJECT,
    properties: {
        breakfast: MealDetailsSchema,
        lunch: MealDetailsSchema,
        dinner: MealDetailsSchema
    },
    required: ['breakfast', 'lunch', 'dinner']
};

const WeeklyMenuExtractionSchema = {
    type: Type.OBJECT,
    properties: {
        monday: DayMenuSchema,
        tuesday: DayMenuSchema,
        wednesday: DayMenuSchema,
        thursday: DayMenuSchema,
        friday: DayMenuSchema,
        saturday: DayMenuSchema,
        sunday: DayMenuSchema
    },
    required: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
};


// analyse rating
const AnalyzedItemSchema = {
    type: Type.OBJECT,
    properties: {
        itemName: { type: Type.STRING, description: "Exact string name of the food menu component." },
        meal: { type: Type.STRING, enum: ['breakfast', 'lunch', 'dinner'] },
        itemType: { type: Type.STRING, enum: ['diet', 'extra'] },
        averageRating: { type: Type.NUMBER, description: "Mathematical mean calculated or inferred from ratings (1.0 to 5.0)." },
        sentiment: { type: Type.STRING, description: "Brief operational summary status tag of student feelings." },
        insights: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Concrete items students explicitly liked for complimented, or explicitly disliked/complained about for complained."
        },
        actionableSteps: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Actionable operational culinary steps or corrections for kitchen management."
        }
    },
    required: ['itemName', 'meal', 'itemType', 'averageRating', 'sentiment', 'insights', 'actionableSteps']
};

const ReviewAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        topComplimentedItems: {
            type: Type.ARRAY,
            items: AnalyzedItemSchema,
            description: "List of highly-praised food options ordered strictly from highest average rating to lowest."
        },
        topComplainedItems: {
            type: Type.ARRAY,
            items: AnalyzedItemSchema,
            description: "List of poorly-received food options ordered strictly from lowest average rating to highest."
        },
        completelyReplaceOrRemove: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Items that perform horribly and require absolute removal or replacement to avoid waste."
        },
        needsBetterManagement: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Items that taste fine but suffer from poor execution like being cold, too oily, short supply, or unhygienic presentation."
        }
    },
    required: ['topComplimentedItems', 'topComplainedItems', 'completelyReplaceOrRemove', 'needsBetterManagement']
};
module.exports = { 
  WeeklyMenuExtractionSchema,
  ReviewAnalysisSchema
 };