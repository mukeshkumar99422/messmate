const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// generate json content from generative ai
const generateJSONContent = async (contents) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
  })

  let jsonString = response.text.trim();
  if (jsonString.startsWith('```json')) jsonString = jsonString.slice(7);
  if (jsonString.startsWith('```')) jsonString = jsonString.slice(3);
  if (jsonString.endsWith('```')) jsonString = jsonString.slice(0, -3);

  return JSON.parse(jsonString.trim());
}

module.exports = {
  generateJSONContent
}