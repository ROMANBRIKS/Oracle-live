import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface StreamItem {
  id: string;
  title: string;
  user: string;
  category: string;
  viewers: number;
  description?: string;
}

export const getAIRecommendations = async (userInterests: string[], availableStreams: StreamItem[]) => {
  try {
    const prompt = `
      User likes: ${userInterests.join(", ")}.
      Available streams: ${JSON.stringify(availableStreams)}.
      
      Rank the streams from most to least relevant to the user. 
      Return the ranked streams as a JSON array of objects.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              ai_reason: { type: Type.STRING, description: "One sentence why this stream is recommended." }
            },
            required: ["id", "ai_reason"]
          }
        }
      }
    });

    const rankedInfo = JSON.parse(response.text);
    
    // Merge the AI reason back into the stream objects
    return rankedInfo.map((info: any) => {
      const stream = availableStreams.find(s => s.id === info.id);
      return { ...stream, ai_reason: info.ai_reason };
    }).filter((s: any) => s.id);

  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return availableStreams; // Fallback
  }
};
