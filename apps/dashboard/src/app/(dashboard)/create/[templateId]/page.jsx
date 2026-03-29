'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const TEMPLATES = {
  'product-launch': {
    id: 'product-launch', name: 'Product Launch', icon: '🚀',
    fields: [
      { id: 'productName', label: 'Product Name', type: 'text', placeholder: 'e.g. SuperWidget Pro', required: true },
      { id: 'keyBenefit', label: 'Key Benefit', type: 'text', placeholder: 'e.g. saves 2 hours/day', required: true },
      { id: 'price', label: 'Price', type: 'text', placeholder: 'e.g. $29/mo or Free' },
      { id: 'launchDate', label: 'Launch Date', type: 'date' },
      { id: 'callToAction', label: 'Call to Action', type: 'text', placeholder: 'e.g. Sign up today' },
    ],
    defaultPlatforms: ['instagram', 'x', 'linkedin'], tone: 'excited',
  },
  'tutorial': {
    id: 'tutorial', name: 'Tutorial', icon: '📚',
    fields: [
      { id: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. How to edit videos', required: true },
      { id: 'steps', label: 'Key Steps', type: 'textarea', placeholder: '1. Step one\n2. Step two' },
      { id: 'difficulty', label: 'Difficulty', type: 'select', options: ['beginner', 'intermediate', 'advanced'] },
      { id: 'duration', label: 'Time to Learn', type: 'text', placeholder: 'e.g. 5 minutes' },
    ],
    defaultPlatforms: ['youtube', 'tiktok', 'instagram'], tone: 'educational',
  },
  'trending': {
    id: 'trending', name: 'Trending', icon: '📈',
    fields: [
      { id: 'trend', label: 'Trend / Hashtag', type: 'text', placeholder: 'e.g. #BookTok', required: true },
      { id: 'angle', label: 'Your Angle', type: 'text', placeholder: 'e.g. how we use it', required: true },
      { id: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g. small biz owners' },
    ],
    defaultPlatforms: ['tiktok', 'instagram', 'x'], tone: 'energetic',
  },
  'behind-scenes': {
    id: 'behind-scenes', name: 'Behind the Scenes', icon: '🎬',
    fields: [
      { id: 'what', label: 'What are you showing?', type: 'text', placeholder: 'e.g. our morning shoot', required: true },
      { id: 'who', label: 'Who is involved?', type: 'text', placeholder: 'e.g. just me, or full team' },
      { id: 'mood', label: 'Mood / Vibe', type: 'select', options: ['fun', 'authentic', 'inspiring', 'educational', 'raw'] },
    ],
    defaultPlatforms: ['instagram', 'tiktok', 'youtube'], tone: 'authentic',
  },
  'promo': {
    id: 'promo', name: 'Promotion / Sale', icon: '💰',
    fields: [
      { id: 'discount', label: 'Discount / Offer', type: 'text', placeholder: 'e.g. 30% off', required: true },
      { id: 'endDate', label: 'Offer Ends', type: 'date' },
      { id: 'urgency', label: 'Urgency Message', type: 'text', placeholder: 'e.g. Only 50 spots left!' },
      { id: 'product', label: 'Product / Service', type: 'text', placeholder: 'e.g. Annual membership' },
    ],
    defaultPlatforms: ['instagram', 'facebook', 'x'], tone: 'urgent',
  },
  'event-promo': {
    id: 'event-promo', name: 'Event Promotion', icon: '📅',
    fields: [
      { id: 'eventName', label: 'Event Name', type: 'text', placeholder: 'e.g. Summer Music Fest', required: true },
      { id: 'date', label: 'Event Date', type: 'date', required: true },
      { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Austin Convention Center' },
      { id: 'ticketUrl', label: 'Ticket Link', type: 'text', placeholder: 'https://...' },
      { id: 'highlight', label: 'Key Highlight', type: 'text', placeholder: 'e.g. 20+ performers, food trucks' },
    ],
    defaultPlatforms: ['instagram', 'facebook', 'x'], tone: 'excited',
  },
  'scratch': {
    id: 'scratch', name: 'Start from Scratch', icon: '➕',
    fields: [
      { id: 'topic', label: 'What do you want to write about?', type: 'textarea', placeholder: 'Describe your content idea...', required: true },
      { id: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g. small business owners' },
      { id: 'tone', label: 'Preferred Tone', type: 'select', options: ['professional', 'casual', 'playful', 'bold', 'inspirational', 'educational'] },
    ],
    defaultPlatforms: ['instagram', 'x'], tone: 'professional',
  },
};

const ALL_PLATFORMS = ['tiktok','instagram','x','linkedin','youtube','facebook','threads','bluesky','youtube_shorts','pinterest','snapchat','reddit'];

const inputClasses = "w-full py-3 px-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";

function renderField(field, value, onChange) {
  if (field.type === 'textarea') {
    return (
      <textarea
        key={field.id}
        value={value || ''}
        onChange={e => onChange(field.id, e.target.value)}
        placeholder={field.placeholder}
        rows={4}
        className={`${inputClasses} resize-vertical`}
      />
    );
  }
  if (field.type === 'select') {
    return (
      <select key={field.id} value={value || ''} onChange={e => onChange(field.id, e.target.value)} className={inputClasses}>
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
      className={inputClasses}
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
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [jobId, setJobId] = useState(null);

  useEffect(() => {
    if (template?.defaultPlatforms?.[0]) {
      setPlatform(template.defaultPlatforms[0]);
    }
  }, [template]);

  const handleFieldChange = (id, val) => setFieldValues(prev => ({ ...prev, [id]: val }));

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
    setError('');
    setIsGenerating(true);
    setResult(null);
    setJobId(null);

    try {
      const res = await fetch('/api/generate/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          style: template?.tone || 'professional',
          templateId,
          platforms: [platform],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResult(data.variations);
      setJobId(data.jobId);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!template) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Template not found: {templateId}</h2>
        <p className="text-muted-foreground mb-6">This template doesn't exist. Choose one from the create page.</p>
        <button onClick={() => router.push('/create')} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
          Back to Create
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      <button onClick={() => router.back()} className="mb-6 bg-transparent border-none cursor-pointer text-muted-foreground text-sm hover:text-foreground transition-colors">
        &larr; Back
      </button>

      <div className="flex items-center gap-3 mb-8">
        <span className="text-4xl">{template.icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{template.name}</h1>
          <p className="text-muted-foreground text-sm">Fill in the fields below to generate tailored content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Form */}
        <div className="flex flex-col gap-5">
          <h2 className="text-base font-semibold text-foreground">Content Details</h2>
          {template.fields.map(field => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {renderField(field, fieldValues[field.id], handleFieldChange)}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)} className={inputClasses}>
              {ALL_PLATFORMS.map(p => (
                <option key={p} value={p}>
                  {p}{template.defaultPlatforms.includes(p) ? ' ★' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">AI Model</label>
            <select value={model} onChange={e => setModel(e.target.value)} className={inputClasses}>
              <option value="gemini-flash">Gemini Flash (Free)</option>
              <option value="claude-haiku">Claude Haiku (Starter+)</option>
              <option value="gemini-pro">Gemini Pro (Basic+)</option>
              <option value="claude-sonnet">Claude Sonnet (Pro+)</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="py-3 px-8 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-[0.9375rem] transition-colors disabled:opacity-60"
          >
            {isGenerating ? 'Generating...' : `Generate ${template.icon}`}
          </button>
        </div>

        {/* Right: Results */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">Generated Content</h2>
          {!result && !isGenerating && (
            <div className="p-12 bg-muted/50 rounded-xl border-2 border-dashed border-border text-center text-muted-foreground text-sm">
              Your generated content will appear here
            </div>
          )}
          {isGenerating && (
            <div className="p-12 bg-muted/50 rounded-xl text-center text-muted-foreground">
              <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
              Generating with {model}...
            </div>
          )}
          {result && (
            <div className="flex flex-col gap-4">
              <div className="p-5 bg-card rounded-xl border border-border">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-3">{result.short}</p>
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-3">{result.long}</div>
                {result.hashtags && (
                  <div className="flex flex-wrap gap-1.5">
                    {result.hashtags.split(' ').map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={handleGenerate} className="flex-1 py-3 bg-card border border-border rounded-lg cursor-pointer font-medium text-foreground hover:bg-muted transition-colors text-sm">Regenerate</button>
                <button className="flex-1 py-3 bg-card border border-border rounded-lg cursor-pointer font-medium text-foreground hover:bg-muted transition-colors text-sm">Edit</button>
                <button onClick={() => router.push(`/preview?id=${jobId}`)} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer font-medium transition-colors text-sm">Preview</button>
              </div>

              <button
                onClick={() => jobId && router.push(`/preview?id=${jobId}`)}
                disabled={!jobId}
                className="py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
              >
                Save &amp; Continue &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
