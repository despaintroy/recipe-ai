'use client';

import { FormEvent, useState } from 'react';
import { callGemini } from '@/app/gemini-server';
import clsx from 'clsx';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    try {
      const data = await callGemini(question);
      setResponse(data);
    } catch (e) {
      setResponse(
        'Error: ' + (e instanceof Error ? e.message : 'Unknown error'),
      );
    } finally {
      setLoading(false);
    }
  }

  const readyToSubmit = !loading && question.trim().length > 0;

  return (
    <div className="my-10">
      <h1 className="text-6xl text-center font-bold mb-5">Gemini Demo</h1>
      <form
        onSubmit={onSubmit}
        className="flex flex-col items-center gap-4 max-w-xl mx-auto"
      >
        <input
          type="text"
          className="w-full px-4 py-2 border rounded"
          placeholder="Ask Gemini a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
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
          {loading ? 'Loading...' : 'Ask Gemini'}
        </button>
      </form>
      {response && (
        <div className="mt-8 max-w-xl mx-auto p-4 bg-stone-900 rounded">
          <h2 className="font-semibold mb-2">Gemini says:</h2>
          <div className="whitespace-pre-line">{response}</div>
        </div>
      )}
    </div>
  );
}
