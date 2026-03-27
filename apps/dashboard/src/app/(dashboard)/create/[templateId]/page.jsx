'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Inline template registry (mirrors packages/core for client-side use without bundling issues)
const TEMPLATES = {
  'product-launch': {
    id: 'product-launch',
    name: 'Product Launch',
    icon: '🚀',
    fields: [
      { id: 'productName',  label: 'Product Name',   type: 'text',     placeholder: 'e.g. SuperWidget Pro', required: true },
      { id: 'keyBenefit',   label: 'Key Benefit',    type: 'text',     placeholder: 'e.g. saves 2 hours/day', required: true },
      { id: 'price',        label: 'Price',          type: 'text',     placeholder: 'e.g. $29/mo or Free' },
      { id: 'launchDate',   label: 'Launch Date',    type: 'date' },
      { id: 'callToAction', label: 'Call to Action', type: 'text',     placeholder: 'e.g. Sign up today' },
    ],
    defaultPlatforms: ['instagram', 'x', 'linkedin'],
    tone: 'excited',
  },
  'tutorial': {
    id: 'tutorial',
    name: 'Tutorial',
    icon: '📚',
    fields: [
      { id: 'topic',      label: 'Topic',         type: 'text',     placeholder: 'e.g. How to edit videos', required: true },
      { id: 'steps',      label: 'Key Steps',     type: 'textarea', placeholder: '1. Step one\n2. Step two' },
      { id: 'difficulty', label: 'Difficulty',    type: 'select',   options: ['beginner', 'intermediate', 'advanced'] },
      { id: 'duration',   label: 'Time to Learn', type: 'text',     placeholder: 'e.g. 5 minutes' },
    ],
    defaultPlatforms: ['youtube', 'tiktok', 'instagram'],
    tone: 'educational',
  },
  'trending': {
    id: 'trending',
    name: 'Trending',
    icon: '📈',
    fields: [
      { id: 'trend',    label: 'Trend / Hashtag',  type: 'text', placeholder: 'e.g. #BookTok', required: true },
      { id: 'angle',    label: 'Your Angle',        type: 'text', placeholder: 'e.g. how we use it', required: true },
      { id: 'audience', label: 'Target Audience',   type: 'text', placeholder: 'e.g. small biz owners' },
    ],
    defaultPlatforms: ['tiktok', 'instagram', 'x'],
    tone: 'energetic',
  },
  'behind-scenes': {
    id: 'behind-scenes',
    name: 'Behind the Scenes',
    icon: '🎬',
    fields: [
      { id: 'what', label: 'What are you showing?', type: 'text',    placeholder: 'e.g. our morning shoot', required: true },
      { id: 'who',  label: 'Who is involved?',      type: 'text',    placeholder: 'e.g. just me, or full team' },
      { id: 'mood', label: 'Mood / Vibe',            type: 'select', options: ['fun', 'authentic', 'inspiring', 'educational', 'raw'] },
    ],
    defaultPlatforms: ['instagram', 'tiktok', 'youtube'],
    tone: 'authentic',
  },
  'event-promo': {
    id: 'event-promo',
    name: 'Event Promo',
    icon: '💰',
    fields: [
      { id: 'eventName',  label: 'Event Name',       type: 'text', placeholder: 'e.g. Summer Festival', required: true },
      { id: 'eventDate',  label: 'Event Date',       type: 'date' },
      { id: 'venue',      label: 'Venue',            type: 'text', placeholder: 'e.g. Central Park' },
      { id: 'ticketLink', label: 'Ticket Link',      type: 'text', placeholder: 'e.g. link in bio' },
      { id: 'urgency',    label: 'Urgency Message',  type: 'text', placeholder: 'e.g. Almost sold out!' },
    ],
    defaultPlatforms: ['instagram', 'facebook', 'x'],
    tone: 'urgent',
  },
  'scratch': {
    id: 'scratch',
    name: 'Start from Scratch',
    icon: '➕',
    fields: [
      { id: 'topic',      label: 'What are we writing about?', type: 'textarea', required: true },
      { id: 'tone',       label: 'Tone',                       type: 'select',   options: ['professional', 'casual', 'excited', 'urgent', 'educational'] },
      { id: 'platform',   label: 'Target Platform',            type: 'select',   options: ['x', 'instagram', 'linkedin', 'tiktok', 'facebook', 'youtube'] },
    ],
    defaultPlatforms: ['x'],
    tone: 'casual',
  },
};

const ALL_PLATFORMS = ['tiktok','instagram','x','linkedin','youtube','facebook','threads','bluesky','youtube_shorts','pinterest','snapchat','reddit'];

function renderField(field, value, onChange) {
  const baseStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.875rem' };
  if (field.type === 'textarea') {
    return (
      <textarea
        key={field.id}
        value={value || ''}
        onChange={e => onChange(field.id, e.target.value)}
        placeholder={field.placeholder}
        rows={4}
        required={field.required}
        style={{ ...baseStyle, resize: 'vertical' }}
      />
    );
  }
  if (field.type === 'select') {
    return (
      <select key={field.id} value={value || ''} onChange={e => onChange(field.id, e.target.value)} required={field.required} style={baseStyle}>
        <option value="">Select...</option>
        {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }
  return (
    <input
      key={field.id}
      type={field.type || 'text'}
      value={value || ''}
      onChange={e => onChange(field.id, e.target.value)}
      placeholder={field.placeholder}
      required={field.required}
      style={baseStyle}
    />
  );
}

export default function TemplatePage() {
  const { templateId } = useParams();
  const router = useRouter();
  const template = TEMPLATES[templateId];

  const [fieldValues, setFieldValues] = useState({});
  const [platform, setPlatform] = useState('tiktok');
  const [model, setModel] = useState('gemini-flash');
  const [generationType, setGenerationType] = useState('single');
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (template?.defaultPlatforms?.[0]) {
      setPlatform(template.defaultPlatforms[0]);
    }
  }, [template]);

  const handleFieldChange = (id, val) => setFieldValues(prev => ({ ...prev, [id]: val }));

  // Build topic string from all filled fields
  const buildTopic = () => {
    if (!template) return '';
    return template.fields
      .filter(f => fieldValues[f.id])
      .map(f => `${f.label}: ${fieldValues[f.id]}`)
      .join(', ');
  };

  const handleGenerate = async () => {
    const topic = buildTopic();
    if (!topic) { setError('Please fill in at least one field'); return; }
    // Validate required fields before submitting
    const missing = template.fields.filter(f => f.required && !fieldValues[f.id]);
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.map(f => f.label).join(', ')}`);
      return;
    }
    setError('');
    setIsGenerating(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          template: templateId,
          platform,
          model,
          type: generationType,
          tone: template?.tone,
          count: 5,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!template) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <h2>Template not found: {templateId}</h2>
        <button onClick={() => router.push('/dashboard')} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
      <button onClick={() => router.back()} style={{ marginBottom: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '0.875rem' }}>
        ← Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <span style={{ fontSize: '2rem' }}>{template.icon}</span>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{template.name}</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Fill in the fields below to generate tailored content</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Left: Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#374151' }}>Content Details</h2>
          {template.fields.map(field => (
            <div key={field.id}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
              </label>
              {renderField(field, fieldValues[field.id], handleFieldChange)}
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.875rem' }}>
              {ALL_PLATFORMS.map(p => (
                <option key={p} value={p} style={{ fontWeight: template.defaultPlatforms.includes(p) ? 700 : 400 }}>
                  {p}{template.defaultPlatforms.includes(p) ? ' ★' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>Generation Type</label>
            <select value={generationType} onChange={e => setGenerationType(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.875rem' }}>
              <option value="single">Single caption</option>
              <option value="batch">5 variations</option>
              <option value="hashtags">Hashtags only</option>
              <option value="thread">Thread</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>AI Model</label>
            <select value={model} onChange={e => setModel(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.875rem' }}>
              <option value="gemini-flash">Gemini Flash (Free)</option>
              <option value="claude-haiku">Claude Haiku (Starter+)</option>
              <option value="gemini-pro">Gemini Pro (Basic+)</option>
              <option value="claude-sonnet">Claude Sonnet (Pro+)</option>
            </select>
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ padding: '0.875rem 2rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9375rem', fontWeight: 600, opacity: isGenerating ? 0.7 : 1 }}
          >
            {isGenerating ? 'Generating...' : `Generate ${template.icon}`}
          </button>
        </div>

        {/* Right: Results */}
        <div>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: '#374151' }}>Generated Content</h2>
          {!result && !isGenerating && (
            <div style={{ padding: '3rem', background: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
              Your generated content will appear here
            </div>
          )}
          {isGenerating && (
            <div style={{ padding: '3rem', background: '#f9fafb', borderRadius: '12px', textAlign: 'center', color: '#6b7280' }}>
              Generating with {model}...
            </div>
          )}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Single caption */}
              {result.caption && (
                <div style={{ padding: '1.25rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{result.caption}</p>
                  {result.hashtags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {result.hashtags.map(tag => (
                        <span key={tag} style={{ padding: '0.25rem 0.625rem', background: '#eff6ff', color: '#3b82f6', borderRadius: '999px', fontSize: '0.75rem' }}>#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Batch variations */}
              {result.variations?.map((v, i) => (
                <div key={i} style={{ padding: '1.25rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Variation {i + 1} · {v.tone || ''}</div>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>{v.caption}</p>
                  {v.hashtags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {v.hashtags.map(tag => (
                        <span key={tag} style={{ padding: '0.25rem 0.625rem', background: '#eff6ff', color: '#3b82f6', borderRadius: '999px', fontSize: '0.75rem' }}>#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {/* Thread posts */}
              {result.posts?.map((post, i) => (
                <div key={i} style={{ padding: '1.25rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Post {post.position || i + 1}</div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>{post.post}</p>
                </div>
              ))}
              {/* Hashtags only */}
              {result.hashtags && !result.caption && !result.variations && (
                <div style={{ padding: '1.25rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {result.hashtags.map(tag => (
                    <span key={tag} style={{ padding: '0.375rem 0.75rem', background: '#eff6ff', color: '#3b82f6', borderRadius: '999px', fontSize: '0.875rem' }}>#{tag}</span>
                  ))}
                </div>
              )}
              <button
                onClick={() => router.push('/dashboard')}
                style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
              >
                Save Draft →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
