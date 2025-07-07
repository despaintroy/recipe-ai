'use server';

import { GoogleGenAI, Schema as GenAISchema, Type } from '@google/genai';
import { z } from 'zod';

const zodRecipeSchema = z.object({
  title: z.string(),
  ingredients: z.array(z.string()),
  steps: z.array(
    z.object({
      heading: z.string(),
      ingredients: z.array(z.string()).optional(),
      instructions: z.string(),
    }),
  ),
  tips: z.array(z.string()),
});

export type Recipe = z.infer<typeof zodRecipeSchema>;

const responseSchema: GenAISchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
          },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
          instructions: {
            type: Type.STRING,
          },
        },
        required: ['heading', 'instructions'],
      },
    },
    tips: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ['title', 'ingredients', 'steps', 'tips'],
};

export async function summarizeRecipe(recipe: string): Promise<Recipe> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing Gemini API key');
  const genAI = new GoogleGenAI({ apiKey });
  const response = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: recipe,
    config: {
      temperature: 1,
      responseSchema,
      responseMimeType: 'application/json',
      systemInstruction:
        'Your task is to summarize the provided recipe web page into a structured format. ' +
        'Rewrite instructions as simply as possible with a very professional style as instructions to the user. Do not include any superfluous phrases or storytelling from the provided page. ' +
        'The output should be a JSON object with the following fields: title, ingredients, steps, and tips. ' +
        'The title should be a short, descriptive name for the recipe. ' +
        'Each ingredient should specify a measurement if present (e.g., "6 cups flour", "2 tbsp sugar", "Pinch of salt"). ' +
        'Abbreviate measurements (e.g., "tbsp" for tablespoon, "tsp" for teaspoon). ' +
        'Measurements should be stated only in US customary units. ' +
        'The steps should be a list of objects, each with a heading describing the step, a list of ingredients needed for that step, and instructions. ' +
        'Only list ingredients for a step if it requires adding new ingredients, not using mixtures from previous steps. ' +
        'Split up steps as needed to ensure only one type of task happens in each step (e.g. dry ingredients, wet ingredients, roll, bake). ' +
        'The tips should be a list of helpful tips related to cooking the recipe. ' +
        'The helpful tips should all relate to cooking the recipe and not useless storytelling from the author. ',
    },
  });

  if (!response || !response.text) {
    console.error('No response from Gemini API');
    throw new Error('No response from Gemini API');
  }
  try {
    const parsedJSON = JSON.parse(response.text);
    return zodRecipeSchema.parse(parsedJSON);
  } catch (error) {
    console.error('Error parsing response:', error);
    throw new Error('Failed to parse recipe response');
  }
}
