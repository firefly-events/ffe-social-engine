'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import Link from 'next/link';

const MODELS = [
  { id: 'gemini-flash', label: 'Gemini Flash', tier: 'free' },
  { id: 'claude-haiku', label: 'Claude Haiku', tier: 'starter' },
  { id: 'gemini-pro',   label: 'Gemini Pro',   tier: 'basic' },
  { id: 'claude-sonnet',label: 'Claude Sonnet', tier: 'pro' },
];

const PLATFORMS = ['tiktok','instagram','x','linkedin','youtube','facebook','threads','bluesky'];

export default function ChatPage() {
  const [model, setModel] = useState('gemini-flash');
  const [platform, setPlatform] = useState('tiktok');
  const [template, setTemplate] = useState('');
  const [savedItems, setSavedItems] = useState([]);
  const [lastSavedId, setLastSavedId] = useState(null);
  const bottomRef = useRef(null);
  const saveGeneration = useMutation(api.content.saveGeneration);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/ai/chat',
    body: { model, platform, template },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSave = async (content) => {
    setSavedItems(prev => [...prev, { content, savedAt: new Date().toISOString() }]);
    try {
      const generationId = await saveGeneration({
        type: 'single',
        topic: input,
        platform,
        template,
        model,
        result: content,
      });
      setLastSavedId(generationId);
    } catch (error) {
      console.error("Failed to save generation:", error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <div className="grid grid-cols-[1fr_320px] h-[calc(100vh-64px)]">
      {/* Chat panel */}
      <div className="flex flex-col border-r border-border">
        {/* Controls */}
        <div className="p-4 border-b border-border flex gap-4 flex-wrap items-center bg-muted">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Model</label>
            <select value={model} onChange={e => setModel(e.target.value)} className="bg-background py-1.5 px-3 rounded-md border border-input text-sm">
              {MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)} className="bg-background py-1.5 px-3 rounded-md border border-input text-sm">
              {PLATFORMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Template (optional)</label>
            <input
              type="text"
              value={template}
              onChange={e => setTemplate(e.target.value)}
              placeholder="e.g. product-launch"
              className="bg-background py-1.5 px-3 rounded-md border border-input text-sm w-40"
            />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground mt-16">
              <p className="text-lg font-medium">AI Content Chat</p>
              <p className="text-sm mt-2">Ask me to write captions, hashtags, scripts, or brainstorm ideas.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] py-3 px-4 text-sm leading-relaxed whitespace-pre-wrap rounded-xl ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}>
                {msg.content}
                {msg.role === 'assistant' && (
                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => handleSave(msg.content)}
                      className="text-xs text-indigo-400 bg-transparent border-none cursor-pointer p-0 hover:underline"
                    >
                      + Save to session
                    </button>
                    {lastSavedId && (
                      <Link href={`/preview?id=${lastSavedId}`} className="text-xs text-green-500 no-underline hover:underline">
                        Go to Preview →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="py-3 px-4 rounded-xl bg-muted text-muted-foreground text-sm">
                Generating...
              </div>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-sm text-center">
              Error: {error.message}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border flex gap-3 bg-background">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask for a caption, hashtags, or ideas..."
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-lg border border-input text-sm outline-none bg-background focus:ring-1 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="py-3 px-6 rounded-lg bg-indigo-600 text-white border-none cursor-pointer text-sm font-medium disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>

      {/* Saved panel */}
      <div className="p-4 overflow-y-auto bg-muted/50">
        <h3 className="text-sm font-semibold text-foreground mb-4">Saved Content</h3>
        {savedItems.length === 0 ? (
          <p className="text-xs text-muted-foreground">Click "+ Save to session" on any AI response to collect content here.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {savedItems.map((item, i) => (
              <div key={i} className="p-3 bg-card rounded-lg border border-border text-xs text-foreground leading-normal whitespace-pre-wrap">
                {item.content.slice(0, 200)}{item.content.length > 200 ? '...' : ''}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
