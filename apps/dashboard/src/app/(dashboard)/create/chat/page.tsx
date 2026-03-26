'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

type ModelId = 'gemini-flash' | 'claude-sonnet';

const MODELS: { id: ModelId; label: string }[] = [
  { id: 'gemini-flash', label: 'Gemini 1.5 Flash' },
  { id: 'claude-sonnet', label: 'Claude Sonnet' },
];

export default function ChatModePage() {
  const [model, setModel] = useState<ModelId>('gemini-flash');

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hi! I am the FFE Social Engine. What kind of content would you like to generate today?',
      },
    ],
    body: { model },
  });

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold dark:text-white">Chat Mode Creation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Describe your campaign, and I will generate the assets.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="model-picker" className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Model:
          </label>
          <select
            id="model-picker"
            value={model}
            onChange={(e) => setModel(e.target.value as ModelId)}
            disabled={isLoading}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
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
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
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
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
