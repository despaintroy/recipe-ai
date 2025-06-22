'use client';

import { FormEvent, useState } from 'react';
import clsx from 'clsx';
import { fetchRecipeContent } from '@/app/recipeFetcher';
import { summarizeRecipe } from '@/app/recipeSummarizer';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [output, setOutput] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOutput('');
    try {
      const text = await fetchRecipeContent(url);
      if (!text) {
        setOutput('Failed to fetch recipe content.');
        return;
      }
      const summary = await summarizeRecipe(text);
      setOutput(summary || 'Failed to summarize the recipe.');
    } catch (e) {
      console.error(e);
      setOutput('An error occurred while fetching the recipe content.');
    } finally {
      setLoading(false);
    }
  }

  const readyToSubmit = !loading && url.trim().length > 0;

  return (
    <div className="my-10 max-w-2xl mx-auto">
      <h1 className="text-6xl text-center font-bold mb-5">Gemini Demo</h1>
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
      {output ? (
        <>
          <hr className="my-10" />
          <div
            className="styled-html"
            dangerouslySetInnerHTML={{ __html: output }}
          />
        </>
      ) : null}
    </div>
  );
}
