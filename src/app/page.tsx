'use client';

import { FormEvent, useState } from 'react';
import clsx from 'clsx';
import { fetchRecipeContent } from '@/app/recipeFetcher';
import { Recipe, summarizeRecipe } from '@/app/recipeSummarizer';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setRecipe(null);
    try {
      const recipeText = await fetchRecipeContent(url);
      if (!recipeText) {
        setRecipe(null);
        return;
      }
      const recipe = await summarizeRecipe(recipeText);
      console.log({ recipe });
      setRecipe(recipe);
    } catch (e) {
      console.error(e);
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }

  const readyToSubmit = !loading && url.trim().length > 0;

  return (
    <div className="my-10 max-w-2xl mx-auto px-4">
      <form onSubmit={onSubmit} className="flex flex-col items-center gap-4">
        <input
          type="text"
          className="w-full px-4 py-2 border rounded"
          placeholder="Enter link to recipe..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          required
        />
        <button
          type="submit"
          className={clsx(
            'px-6 py-2 bg-blue-900 text-white rounded disabled:opacity-50',
            readyToSubmit && 'hover:bg-blue-800 cursor-pointer',
          )}
          disabled={!readyToSubmit}
        >
          {loading ? 'Loading...' : 'Summarize Recipe'}
        </button>
      </form>
      {recipe ? (
        <>
          <hr className="my-10" />
          <div>
            <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>

            <h2 className="text-xl font-semibold mt-6 mb-2">Ingredients:</h2>
            <ul className="list-disc list-inside ml-4 mb-6">
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i}>{ingredient}</li>
              ))}
            </ul>

            {recipe.steps.map((step, stepIndex) => (
              <div key={stepIndex}>
                <h2 className="text-xl font-semibold mt-6 mb-2">
                  {stepIndex + 1}. {step.heading}
                </h2>
                {step.ingredients?.length ? (
                  <ul className="list-disc list-inside ml-4 mb-2">
                    {step.ingredients.map((ingredient, ingredientIndex) => (
                      <li key={ingredientIndex}>{ingredient}</li>
                    ))}
                  </ul>
                ) : null}
                <p>{step.instructions}</p>
              </div>
            ))}

            {!!recipe.tips.length && (
              <>
                <hr className="my-8" />
                <h2 className="text-xl font-semibold mt-6 mb-2">Tips</h2>
                <ul className="list-disc list-inside">
                  {recipe.tips.map((tip: string, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
