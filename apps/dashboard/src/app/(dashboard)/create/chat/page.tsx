'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';

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
  const bottomRef = useRef(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/ai/chat',
    body: { model, platform, template },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSave = (content) => {
    setSavedItems(prev => [...prev, { content, savedAt: new Date().toISOString() }]);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: 'calc(100vh - 64px)', gap: 0 }}>
      {/* Chat panel */}
      <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e7eb' }}>
        {/* Controls */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', background: '#f9fafb' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Model</label>
            <select value={model} onChange={e => setModel(e.target.value)} style={{ padding: '0.375rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem' }}>
              {MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ padding: '0.375rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem' }}>
              {PLATFORMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Template (optional)</label>
            <input
              type="text"
              value={template}
              onChange={e => setTemplate(e.target.value)}
              placeholder="e.g. product-launch"
              style={{ padding: '0.375rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', width: '160px' }}
            />
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '4rem' }}>
              <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>AI Content Chat</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Ask me to write captions, hashtags, scripts, or brainstorm ideas.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%',
                padding: '0.75rem 1rem',
                borderRadius: msg.role === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                background: msg.role === 'user' ? '#6366f1' : '#f3f4f6',
                color: msg.role === 'user' ? 'white' : '#111827',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleSave(msg.content)}
                    style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.75rem', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    + Save to session
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '0.75rem 1rem', borderRadius: '1rem', background: '#f3f4f6', color: '#6b7280', fontSize: '0.875rem' }}>
                Generating...
              </div>
            </div>
          )}
          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' }}>
              Error: {error.message}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '0.75rem' }}>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask for a caption, hashtags, or ideas..."
            disabled={isLoading}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none' }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, opacity: (isLoading || !input.trim()) ? 0.6 : 1 }}
          >
            Send
          </button>
        </form>
      </div>

      {/* Saved panel */}
      <div style={{ padding: '1rem', overflowY: 'auto', background: '#f9fafb' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>Saved Content</h3>
        {savedItems.length === 0 ? (
          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Click "Save to session" on any AI response to collect content here.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {savedItems.map((item, i) => (
              <div key={i} style={{ padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.75rem', color: '#374151', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {item.content.slice(0, 200)}{item.content.length > 200 ? '...' : ''}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
