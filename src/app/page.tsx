'use client';

import { FormEvent, useEffect, useReducer } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchRecipeContent } from '@/app/recipeFetcher';
import { Recipe, summarizeRecipe } from '@/app/recipeSummarizer';

export default function Home() {
  const [state, dispatch] = useReducer(recipeReducer, { status: 'idle' });
  const router = useRouter();
  const searchParams = useSearchParams();

  async function fetchAndSummarize(url: string) {
    dispatch({ type: 'startSummarizing' });
    try {
      const recipeText = await fetchRecipeContent(url);
      const recipe = await summarizeRecipe(recipeText);
      dispatch({ type: 'summarizeSuccess', recipe });
    } catch {
      dispatch({
        type: 'summarizeError',
        error: 'Failed to summarize the recipe from the provided URL',
      });
    }
  }

  useEffect(() => {
    const recipeUrl = searchParams.get('recipe');
    if (recipeUrl) {
      // Remove the ?recipe= param from the URL
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.delete('recipe');
      router.replace('?' + params.toString(), { scroll: false });
      // Trigger submit logic
      fetchAndSummarize(recipeUrl);
    }
  }, [searchParams, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const url = formData.get('url') as string;
    if (!url) {
      dispatch({
        type: 'summarizeError',
        error: 'Please provide a valid URL',
      });
      return;
    }
    fetchAndSummarize(url);
  }

  if (state.status === 'idle') {
    return (
      <form onSubmit={onSubmit} className="flex flex-col items-center gap-4">
        <input
          type="text"
          className="w-full px-4 py-2 border rounded"
          placeholder="Enter link to recipe..."
          name="url"
          required
        />
        <button
          type="submit"
          className="px-6 py-2 bg-stone-800 text-stone-300 rounded cursor-pointer hover:bg-stone-700"
        >
          Summarize Recipe &rarr;
        </button>
      </form>
    );
  }

  if (state.status === 'summarizing') {
    return <p className="text-center">Summarizing recipe...</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="text-red-300 text-center">
        <p className="mb-4">{state.error}</p>
        <button
          onClick={() => dispatch({ type: 'reset' })}
          className="px-6 py-2 bg-stone-800 text-stone-300 rounded cursor-pointer hover:bg-stone-700"
        >
          Try a Different URL
        </button>
      </div>
    );
  }

  const { title, ingredients, steps, tips } = state.recipe;

  return (
    <>
      <div>
        <button
          onClick={() => dispatch({ type: 'reset' })}
          className="mb-4 px-4 py-1 bg-stone-800 text-stone-300 rounded cursor-pointer hover:bg-stone-700"
        >
          &larr; Try Another Recipe
        </button>
        <h1 className="text-3xl font-bold mb-4">{title}</h1>

        <h2 className="text-xl font-semibold mt-6 mb-2">Ingredients:</h2>
        <ul className="list-disc list-inside ml-4 mb-6">
          {ingredients.map((ingredient, i) => (
            <li key={i}>{ingredient}</li>
          ))}
        </ul>

        {steps.map((step, stepIndex) => (
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

        {!!tips.length && (
          <>
            <hr className="my-8" />
            <h2 className="text-xl font-semibold mt-6 mb-2">Tips</h2>
            <ul className="list-disc list-inside">
              {tips.map((tip: string, i: number) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}

type RecipeState =
  | { status: 'idle' }
  | { status: 'summarizing' }
  | { status: 'success'; recipe: Recipe }
  | { status: 'error'; error: string };

type RecipeAction =
  | { type: 'startSummarizing' }
  | { type: 'summarizeSuccess'; recipe: Recipe }
  | { type: 'summarizeError'; error: string }
  | { type: 'reset' };

function recipeReducer(state: RecipeState, action: RecipeAction): RecipeState {
  switch (action.type) {
    case 'startSummarizing':
      return { status: 'summarizing' };
    case 'summarizeSuccess':
      return { status: 'success', recipe: action.recipe };
    case 'summarizeError':
      return { status: 'error', error: action.error };
    case 'reset':
      return { status: 'idle' };
    default:
      return state;
  }
}
