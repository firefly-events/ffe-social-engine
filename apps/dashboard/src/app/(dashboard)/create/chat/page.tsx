'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';

const MODELS = [
  { id: 'gemini-flash', label: 'Gemini Flash', description: 'Fast, free tier' },
  { id: 'gemini-pro', label: 'Gemini Pro', description: 'Higher quality' },
  { id: 'claude-haiku', label: 'Claude Haiku', description: 'Fast, concise' },
  { id: 'claude-sonnet', label: 'Claude Sonnet', description: 'Premium quality' },
];

export default function ChatModePage() {
  const [model, setModel] = useState('gemini-flash');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/ai/chat',
    body: { model },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hi! I\'m the FFE Social Engine. Tell me what kind of content you\'d like to create — I can generate social posts, captions, threads, hashtags, and more.',
      },
    ],
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold dark:text-white">Chat Mode Creation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Describe your campaign, and I&apos;ll generate the assets.</p>
        </div>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {MODELS.map(m => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
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
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-bl-none border border-red-200 dark:border-red-800">
              <p className="font-medium text-sm">Generation failed</p>
              <p className="text-sm mt-1">{error.message || 'Something went wrong. Try again or switch models.'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="E.g., 'Create 3 tweets about our upcoming Summer Festival...'"
            className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generating...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
