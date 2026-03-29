'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useAuth } from '@clerk/nextjs';

export default function ContentInputPage() {
  const { userId: clerkId } = useAuth();
  const router = useRouter();

  const user = useQuery(api.users.getByClerkId, clerkId ? { clerkId } : 'skip');
  const createContent = useMutation(api.content.create);

  // Form state
  const [contentText, setContentText] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok']);
  const [selectedModel, setSelectedModel] = useState('gemini-flash');
  const [contentStyle, setContentStyle] = useState('professional');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const ALL_PLATFORMS = ['tiktok', 'instagram', 'x', 'linkedin', 'youtube', 'facebook', 'threads', 'bluesky', 'youtube_shorts', 'pinterest', 'snapchat', 'reddit'];
  const STYLE_OPTIONS = ['professional', 'casual', 'excited', 'educational', 'authentic', 'urgent', 'energetic'];

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleGenerate = async () => {
    if (!contentText.trim()) {
      setError('Please enter some content');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    setError('');
    setIsGenerating(true);
    setResult(null);
    setJobId(null);

    try {
      const res = await fetch('/api/generate/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: contentText,
          style: contentStyle,
          templateId: 'freeform',
          platforms: selectedPlatforms,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setResult(data.variations);
      setJobId(data.jobId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveContent = async () => {
    if (!result || !user?._id) return;

    try {
      const contentId = await createContent({
        userId: user._id,
        text: result.short,
        status: 'draft',
        platforms: selectedPlatforms,
        prompt: contentTitle || contentText,
        aiModel: selectedModel,
      });

      router.push(`/content/${contentId}`);
    } catch (err: any) {
      setError(`Save failed: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
      <button
        onClick={() => router.back()}
        style={{
          marginBottom: '1.5rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#6b7280',
          fontSize: '0.875rem',
        }}
      >
        ← Back
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
          Create Content
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
          Write your content and let AI adapt it for any platform
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Left: Input Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
            Content Details
          </h2>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
              Title (optional)
            </label>
            <input
              type="text"
              value={contentTitle}
              onChange={e => setContentTitle(e.target.value)}
              placeholder="e.g. My Product Launch"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
              Content <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={contentText}
              onChange={e => setContentText(e.target.value)}
              placeholder="Write your content here. Be as detailed as you'd like..."
              rows={8}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              Tone / Style
            </label>
            <select
              value={contentStyle}
              onChange={e => setContentStyle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
              }}
            >
              {STYLE_OPTIONS.map(style => (
                <option key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              AI Model
            </label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
              }}
            >
              <option value="gemini-flash">Gemini Flash (Free)</option>
              <option value="claude-haiku">Claude Haiku (Starter+)</option>
              <option value="gemini-pro">Gemini Pro (Basic+)</option>
              <option value="claude-sonnet">Claude Sonnet (Pro+)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.75rem' }}>
              Platforms <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {ALL_PLATFORMS.map(platform => (
                <label
                  key={platform}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: selectedPlatforms.includes(platform)
                      ? '1px solid #6366f1'
                      : '1px solid #e5e7eb',
                    backgroundColor: selectedPlatforms.includes(platform)
                      ? '#eef2ff'
                      : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>
                    {platform.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{
              padding: '0.875rem 2rem',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: 600,
              opacity: isGenerating ? 0.7 : 1,
            }}
          >
            {isGenerating ? 'Generating...' : 'Generate Variations'}
          </button>
        </div>

        {/* Right: Results */}
        <div>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
            Generated Variations
          </h2>

          {!result && !isGenerating && (
            <div
              style={{
                padding: '3rem',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '2px dashed #e5e7eb',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '0.875rem',
              }}
            >
              Your generated content will appear here
            </div>
          )}

          {isGenerating && (
            <div
              style={{
                padding: '3rem',
                background: '#f9fafb',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#6b7280',
              }}
            >
              Generating with {selectedModel}...
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  padding: '1.25rem',
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <p
                  style={{
                    margin: '0 0 0.75rem',
                    fontSize: '0.875rem',
                    color: '#374151',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {result.short}
                </p>
                {result.long && (
                  <div
                    style={{
                      margin: '0 0 0.75rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {result.long}
                  </div>
                )}
                {result.hashtags && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {result.hashtags.split(' ').map((tag: string) => (
                      <span
                        key={tag}
                        style={{
                          padding: '0.25rem 0.625rem',
                          background: '#eff6ff',
                          color: '#3b82f6',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleGenerate}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Regenerate
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => router.push(`/preview?id=${jobId}`)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Preview
                </button>
              </div>

              <button
                onClick={handleSaveContent}
                disabled={!jobId}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  opacity: !jobId ? 0.5 : 1,
                }}
              >
                Save Content →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
