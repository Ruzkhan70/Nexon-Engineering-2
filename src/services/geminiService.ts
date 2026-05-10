import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export async function generateServiceDescription(serviceTitle: string): Promise<string> {
  try {
    if (!serviceTitle) return "";
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a professional, concise (maximum 2 sentences) description for an industrial engineering service titled: "${serviceTitle}". The tone should be technical, reliable, and corporate. Do not use buzzwords like "cutting-edge" or "revolutionary". Focus on reliability and engineering excellence.`,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "";
  }
}

export async function suggestIcon(title: string): Promise<string> {
  const commonIcons = [
    'Settings', 'Activity', 'Shield', 'Zap', 'Cpu', 'Boxes', 'Wrench', 'Factory', 'Sun', 'Video', 
    'Wind', 'Hammer', 'HardHat', 'UtilityPole', 'Component', 'Drill', 'Anvil', 'Tool', 'PlugZap', 'Bolt'
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Given the industrial service title: "${title}", choose the most appropriate icon from this list: [${commonIcons.join(', ')}]. Return only the name of the icon.`,
    });
    const suggested = response.text?.trim() || 'Settings';
    return commonIcons.includes(suggested) ? suggested : 'Settings';
  } catch (error) {
    return 'Settings';
  }
}

export async function generateProjectCaseStudy(title: string, client: string, category: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Draft a professional, detailed industrial case study (approx 150-200 words) for a project titled "${title}" executed for client "${client}" in the "${category}" sector. Use a technical, sophisticated tone. Focus on engineering methodologies, technical implementation, and successful deployment results. Use industrial terminology.`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("AI Project Generation Error:", error);
    return "";
  }
}

export async function generateProjectChallenges(title: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Describe standard technical and environmental challenges (2-3 sentences) likely faced during an engineering project titled "${title}". Focus on logistics, technical compliance, material constraints, or site conditions.`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    return "";
  }
}

export async function generateProjectSolutions(challenges: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Given these engineering challenges: "${challenges}", provide a concise, technical solution (2-3 sentences) detailing the engineered approach, custom fabrication, or strategic implementation used to overcome them.`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    return "";
  }
}
