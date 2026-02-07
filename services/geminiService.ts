import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; 
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateCongratulatoryMessage = async (score: number, coinsEarned: number): Promise<string> => {
  if (!ai) {
    return `Amazing job! You scored ${score} points and earned ${coinsEarned} FLR!`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, very enthusiastic congratulatory message for a senior user who won a game of Words with Friends. 
      Score: ${score}. Reward: ${coinsEarned} FLR (Flare).
      Mention that they can withdraw this crypto. Max 2 sentences. Warm tone.`,
    });
    return response.text || "Congratulations on your win!";
  } catch (error) {
    console.error("Error generating message:", error);
    return "Great game! Your FLR rewards are ready.";
  }
};

export const generateGameTip = async (): Promise<string> => {
  if (!ai) return "Try using 'Q' on a triple letter score!";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Give a one-sentence strategy tip for a senior playing Scrabble. Simple and helpful.",
    });
    return response.text || "Look for triple word score opportunities!";
  } catch (error) {
    return "Always check for parallel words to score double points.";
  }
};

export const validateWordWithAI = async (word: string): Promise<boolean> => {
  if (!ai) return true; // Fallback for demo
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Answer only 'YES' or 'NO'. Is "${word}" a valid English word in Scrabble dictionary?`,
    });
    const text = response.text?.trim().toUpperCase();
    return text?.includes('YES') || false;
  } catch (e) {
    return true; // Fail open for demo
  }
};