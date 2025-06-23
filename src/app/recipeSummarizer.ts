'use server';

import { GoogleGenAI, Schema as GenAISchema, Type } from '@google/genai';
import { z } from 'zod';

const zodRecipeSchema = z.object({
  title: z.string(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      measurement: z.string().optional(),
    }),
  ),
  steps: z.array(
    z.object({
      heading: z.string(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          measurement: z.string().optional(),
        }),
      ),
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
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
          },
          measurement: {
            type: Type.STRING,
          },
        },
        required: ['name'],
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
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                },
                measurement: {
                  type: Type.STRING,
                },
              },
              required: ['name'],
            },
          },
          instructions: {
            type: Type.STRING,
          },
        },
        required: ['heading', 'ingredients', 'instructions'],
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

export async function summarizeRecipe(recipe: string): Promise<Recipe | null> {
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
        'The output should be a JSON object with the following fields: title, ingredients, steps, and tips. ' +
        'The title should be a short, descriptive name for the recipe. ' +
        'The ingredients should be a list of objects, each with a name and an optional measurement (e.g., "6 cups", "2 tbsp"). ' +
        'If a measurement does not make sense for an ingredient (such as "syrup" for topping, or "salt" to taste), omit the measurement field for that ingredient. ' +
        'The steps should be a list of objects, each with a heading, a list of ingredients needed for that step (each with a name and optional measurement), and instructions. ' +
        'The tips should be a list of helpful tips related to cooking the recipe. ' +
        'All ingredients should be in US customary units. Never metric. ' +
        'The helpful tips should all relate to cooking the recipe and not useless storytelling from the author. ',
    },
  });

  if (!response || !response.text) {
    console.error('No response from Gemini API');
    return null;
  }
  try {
    console.log(response.text);
    const parsedJSON = JSON.parse(response.text);
    return zodRecipeSchema.parse(parsedJSON);
  } catch (error) {
    console.error('Error parsing response:', error);
    return null;
  }
}
