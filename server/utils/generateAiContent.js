const { GoogleGenAI } = require('@google/genai');
const { WeeklyMenuExtractionSchema, ReviewAnalysisSchema } = require('./aiSchemas');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

class GeminiService {
  async extractMenuFromImage(buffer, mimeType) {
      const base64Image = buffer.toString('base64');

      const systemInstruction = `
          You are a strict data-extraction parser. Map the unstructured campus mess schedule image precisely into the provided JSON schema definitions.
          Default fallbacks: if pricing for extras is not mentioned, set it to 1.0;
          if no timinig is mentioned give default timings as breakfast: 07:30-09:30, lunch: 12:30-14:30, dinner: 19:30-21:30;
          Important notes: map missing items to empty arrays; translate regional names to English; 
          if items are optional ie this or that, include all items in the diet array. Do not skip any.
      `;

      const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: [
              {
                  inlineData: {
                      mimeType: mimeType,
                      data: base64Image
                  }
              },
              { text: "Extract the menu layout details structured precisely to the configuration constraints." }
          ],
          config: {
              systemInstruction: systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: WeeklyMenuExtractionSchema,
              temperature: 0.1
          }
      });

      if (!response.text) {
          throw new Error("Generative models engine returned empty structural block data.");
      }

      return JSON.parse(response.text.trim());
  }

  async analyzeReviewsPayload(rawReviewsText) {
    const systemInstruction = `
      You are a senior campus food safety inspector and hospitality operations auditor.
      Carefully analyze the raw data dump consisting of student food ratings, quick contextual tags, and open-text suggestions from the past 7 days.
      Group the entries accurately by food items.
      Rank praised items from highest rating to lowest rating.
      Rank criticized items from lowest rating to highest rating.
      Provide pragmatic, direct advice to hostel accountant.
      Your output must comply strictly with the keys, structure, and constraints specified in the JSON schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { text: `Raw Student Ratings JSON Stream: ${JSON.stringify(rawReviewsText)}` }
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: ReviewAnalysisSchema,
        temperature: 0.1
      }
    });

    if (!response.text) {
      throw new Error("Generative core response context returned blank structural data.");
    }

    return JSON.parse(response.text.trim());
  }
}

module.exports = new GeminiService();