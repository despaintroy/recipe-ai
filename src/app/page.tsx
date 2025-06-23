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
          placeholder="Enter a recipe URL..."
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
          {loading ? 'Loading...' : 'Get Recipe'}
        </button>
      </form>
      {recipe ? (
        <>
          <hr className="my-10" />
          <div>
            <h2 className="text-3xl font-bold mb-4">{recipe.title}</h2>
            <h3 className="text-xl font-semibold mt-6 mb-2">Ingredients</h3>
            <ul className="list-disc list-inside ml-4 mb-6">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>
                  {ing.measurement ? `${ing.measurement} ` : ''}
                  {ing.name}
                </li>
              ))}
            </ul>
            <h3 className="text-xl font-semibold mt-6 mb-2">Steps</h3>
            <div className="flex flex-col gap-6">
              {recipe.steps.map((step, i) => (
                <div key={i}>
                  <p className="text-lg font-bold">{step.heading}</p>
                  {step.ingredients.length ? (
                    <div className="mb-1">
                      <span className="font-medium">Ingredients:</span>
                      <ul className="list-disc list-inside ml-4">
                        {step.ingredients.map((ing, j) => (
                          <li key={j}>
                            {ing.measurement ? `${ing.measurement} ` : ''}
                            {ing.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <div className="">{step.instructions}</div>
                </div>
              ))}
            </div>
            {recipe.tips && recipe.tips.length > 0 && (
              <>
                <h3 className="text-xl font-semibold mt-6 mb-2">Tips</h3>
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
