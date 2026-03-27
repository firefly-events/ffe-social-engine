'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { updateBrandVoice } from '@/app/actions/user';
import { BrandVoice } from '@ffe/core/src/types';

const TONE_OPTIONS = [
  'Professional', 'Friendly', 'Witty', 'Educational', 'Inspirational', 
  'Authoritative', 'Empathetic', 'Casual', 'Bold', 'Minimalist'
];

const EMOJI_OPTIONS = [
  'None', 'Light (1-2 per post)', 'Regular (3-5 per post)', 'Heavy (many emojis)', 'Start/End only'
];

const HASHTAG_OPTIONS = [
  'None', 'Minimal (1-3)', 'Standard (5-10)', 'Heavy (15-30)', 'Comment only'
];

export default function BrandVoicePage() {
  const { user, isLoaded } = useUser();
  const brandVoice = (user?.publicMetadata?.brandVoice as BrandVoice) || ({} as BrandVoice);

  const [formData, setFormData] = useState<Partial<BrandVoice>>({
    name: brandVoice.name || '',
    tone: brandVoice.tone || '',
    avoid: brandVoice.avoid || '',
    examples: brandVoice.examples || '',
    targetAudience: brandVoice.targetAudience || '',
    emojiUsage: brandVoice.emojiUsage || 'Regular (3-5 per post)',
    hashtagStyle: brandVoice.hashtagStyle || 'Standard (5-10)',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!isLoaded) return <div>Loading...</div>;

  const handleToneChange = (tone: string) => {
    const currentTones = formData.tone ? formData.tone.split(', ') : [];
    let newTones: string[];
    
    if (currentTones.includes(tone)) {
      newTones = currentTones.filter(t => t !== tone);
    } else {
      newTones = [...currentTones, tone];
    }
    
    setFormData({ ...formData, tone: newTones.join(', ') });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const dataToSave: BrandVoice = {
        name: formData.name || 'Default',
        tone: formData.tone || '',
        avoid: formData.avoid || '',
        examples: formData.examples || '',
        targetAudience: formData.targetAudience || '',
        emojiUsage: formData.emojiUsage || '',
        hashtagStyle: formData.hashtagStyle || '',
        updatedAt: new Date().toISOString(),
      };

      await updateBrandVoice(dataToSave);
      setMessage({ type: 'success', text: 'Brand voice updated successfully!' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to update brand voice.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Brand Voice</h2>
        <p className="text-gray-500">Define how your brand speaks to your audience.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Tone</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {TONE_OPTIONS.map(tone => (
              <label 
                key={tone} 
                className={`flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                  formData.tone?.includes(tone) 
                    ? 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:border-purple-400 dark:text-purple-300' 
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                }`}
              >
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={formData.tone?.includes(tone)}
                  onChange={() => handleToneChange(tone)}
                />
                <span className="text-sm">{tone}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Target Audience</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              placeholder="e.g. Tech-savvy entrepreneurs 25-40"
              value={formData.targetAudience}
              onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Emoji Usage</label>
            <select 
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              value={formData.emojiUsage}
              onChange={e => setFormData({ ...formData, emojiUsage: e.target.value })}
            >
              {EMOJI_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Hashtag Style</label>
            <select 
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              value={formData.hashtagStyle}
              onChange={e => setFormData({ ...formData, hashtagStyle: e.target.value })}
            >
              {HASHTAG_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">What to avoid</label>
          <textarea 
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 min-h-[100px]"
            placeholder="Words, topics, or phrases to never use..."
            value={formData.avoid}
            onChange={e => setFormData({ ...formData, avoid: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Examples of your writing</label>
          <textarea 
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 min-h-[150px]"
            placeholder="Paste some successful posts or brand snippets here..."
            value={formData.examples}
            onChange={e => setFormData({ ...formData, examples: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          {message && (
            <div className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </div>
          )}
          <button 
            type="submit" 
            disabled={saving}
            className="ml-auto px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Brand Voice'}
          </button>
        </div>
      </form>
    </div>
  );
}
