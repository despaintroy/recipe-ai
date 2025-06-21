'use server';

import { GoogleGenAI } from '@google/genai';

export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing Gemini API key');
  const genAI = new GoogleGenAI({ apiKey });
  const response = await genAI.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: prompt,
    config: {
      systemInstruction:
        'You are a helpful assistant that responds to one question at a time. ' +
        'Do not ask follow-up questions. ' +
        'Respond in plain text without any markdown formatting. ',
    },
  });
  return response.text ?? 'No response';
}
