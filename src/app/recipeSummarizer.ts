'use server';

import { GoogleGenAI } from '@google/genai';

export async function summarizeRecipe(recipe: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing Gemini API key');
  const genAI = new GoogleGenAI({ apiKey });
  const response = await genAI.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: recipe,
    config: {
      systemInstruction:
        'You will be provided the text content of a recipe web page. ' +
        'Your task if to provide (1) a title, (2) a list of ingredients, (3) a list of steps, and (4) a summary of other helpful tips from the page. ' +
        'All ingredients should be in US customary units. Never metric. ' +
        'Each step should have a heading, list of ingredients for that step including measurements, and the step instructions. ' +
        'The helpful tips should all relate to cooking the recipe and not useless storytelling from the author. ' +
        'The output should be HTML ready to be directly inserted into the body tag. You may use the following tags: <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <b>. ' +
        'Return only HTML body content. Do not include "```html" wrapper, or the tags <html>, <head>, or <body>. ',
    },
  });
  return response.text || null;
}
