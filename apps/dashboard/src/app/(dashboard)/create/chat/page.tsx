'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect } from 'react';

const MODELS = [
  { id: 'gemini-flash', label: 'Gemini Flash', tier: 'free' },
  { id: 'claude-haiku', label: 'Claude Haiku', tier: 'starter' },
  { id: 'gemini-pro', label: 'Gemini Pro', tier: 'basic' },
  { id: 'claude-sonnet', label: 'Claude Sonnet', tier: 'pro' },
] as const;

type ModelId = (typeof MODELS)[number]['id'];

const PLATFORMS = ['tiktok', 'instagram', 'x', 'linkedin', 'youtube', 'facebook', 'threads', 'bluesky'] as const;
type Platform = (typeof PLATFORMS)[number];

export default function ChatModePage() {
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setInput } = useChat({
    api: '/api/ai/chat',
    body: {
      model: 'gemini-flash' as ModelId,
      platform: 'tiktok' as Platform,
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-xl font-bold dark:text-white">Chat Mode Creation</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Describe your campaign, and I&apos;ll generate the assets.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 rounded-bl-none flex gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-600 dark:text-red-400">
              Generation failed: {error.message}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3"
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Describe the content you want to create..."
          disabled={isLoading}
          className="flex-1 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
