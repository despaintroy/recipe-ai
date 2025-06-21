'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing Gemini API key');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction:
      'You are a helpful assistant. Respond in plain text. No markdown.',
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
