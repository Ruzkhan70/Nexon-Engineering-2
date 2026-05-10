import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeProjectRequirement(description: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As an industrial engineering expert from Nexon Engineering, analyze the following client requirement and provide:
1. Short analysis of the problem.
2. Recommended service from our portfolio (e.g., Automation, Electrical, Mechanical, Maintenance).
3. Urgency level (Low, Medium, High).
4. Three technical bullet points for initial inspection.

Requirement: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            recommendedService: { type: Type.STRING },
            urgency: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            steps: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["analysis", "recommendedService", "urgency", "steps"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
}

export async function suggestProjectCategory(title: string, description: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest a single-word or short-phrase category for this industrial engineering project.
Title: ${title}
Description: ${description}`,
      config: {
        systemInstruction: "Only return the category name, nothing else."
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini categorization failed:", error);
    return "Industrial";
  }
}
