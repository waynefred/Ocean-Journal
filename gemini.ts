import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (ai) return ai;
  
  // Directly access the environment variable as per SDK guidelines
  // Vite replaces 'process.env.API_KEY' with the actual string value during build.
  // We avoid logging 'process.env' directly to prevent "process is not defined" errors in browser.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }

  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("AI Client Initialization failed:", e);
    return null;
  }
  return ai;
};

export const generateExcerpt = async (content: string): Promise<string> => {
  const client = getAiClient();
  if (!client) {
    // Fail silently or return empty string if client isn't ready
    return "";
  }
  
  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a concise, engaging 2-sentence excerpt for a blog post with the following content. Do not use quotes. \n\nContent: ${content.substring(0, 1000)}`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error generating excerpt:", error);
    return "";
  }
};

export const improveWriting = async (text: string): Promise<string> => {
  const client = getAiClient();
  if (!client) {
    return text;
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Improve the following text to be more engaging and concise while maintaining the original meaning. Do not use quotes. \n\nText: ${text}`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Error improving writing:", error);
    return text;
  }
};