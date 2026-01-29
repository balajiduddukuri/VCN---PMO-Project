
import { GoogleGenAI } from "@google/genai";

export const analyzePilotPerformance = async (metrics: any, artifacts: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    As a Lead VCN Network Architect, analyze the following production ecosystem data:
    Metrics: ${JSON.stringify(metrics)}
    Recent Network Activity: ${JSON.stringify(artifacts.slice(0, 5))}
    
    The network is currently in a hyper-expansion phase.
    Provide a concise (2-3 sentences) strategic summary of network stability and 2 high-level protocol recommendations to maximize global collaboration density.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("VCN Intelligence Error:", error);
    return "Protocol analysis unavailable. System integrity check recommended.";
  }
};
