import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    // We don't throw an error here to prevent module load failures in production
    // instead we will handle the null instance when calling methods.
    aiInstance = new GoogleGenAI({ apiKey: apiKey || "missing-key" });
  }
  return aiInstance;
}

export async function analyzeProjectRequirement(description: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features will be limited.");
      return null;
    }

    const ai = getAI();
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return "Industrial";

    const ai = getAI();
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
