'use client';

import { useState, useEffect } from 'react';
import { useUserPreferences } from '@/hooks/use-user-preferences';

const AI_MODELS = [
  { id: 'gemini-flash', name: 'Gemini Flash (Fast)' },
  { id: 'gemini-pro', name: 'Gemini Pro (Smart)' },
  { id: 'claude-sonnet', name: 'Claude Sonnet (Creative)' },
];

const PLATFORMS = ['LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'TikTok'];

export default function PreferencesPage() {
  const { preferences, updatePreferences, isLoaded } = useUserPreferences();
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (isLoaded) {
      setLocalPrefs(preferences);
    }
  }, [preferences, isLoaded]);

  if (!isLoaded) return <div>Loading...</div>;

  const handlePlatformToggle = (platform: string) => {
    const current = localPrefs.defaultPlatforms || [];
    let next: string[];
    if (current.includes(platform)) {
      next = current.filter(p => p !== platform);
    } else {
      next = [...current, platform];
    }
    setLocalPrefs({ ...localPrefs, defaultPlatforms: next });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updatePreferences(localPrefs);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save preferences.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">User Preferences</h2>
        <p className="text-gray-500">Customize your experience within Social Engine.</p>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium mb-3">Default AI Model</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {AI_MODELS.map(model => (
              <div 
                key={model.id}
                onClick={() => setLocalPrefs({ ...localPrefs, defaultAiModel: model.id })}
                className={`p-4 border rounded-xl cursor-pointer transition-all ${
                  localPrefs.defaultAiModel === model.id 
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200 dark:bg-purple-900/20 dark:ring-purple-900/40' 
                    : 'border-gray-200 hover:border-purple-300 dark:border-gray-700'
                }`}
              >
                <div className="font-semibold">{model.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {model.id.includes('gemini') ? 'Powered by Google' : 'Powered by Anthropic'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Default Platforms</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(platform => (
              <button 
                key={platform}
                onClick={() => handlePlatformToggle(platform)}
                className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                  localPrefs.defaultPlatforms?.includes(platform)
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-purple-400'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Content View Mode</label>
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
            <button 
              onClick={() => setLocalPrefs({ ...localPrefs, contentViewMode: 'grid' })}
              className={`px-6 py-2 rounded-md text-sm transition-all ${
                localPrefs.contentViewMode === 'grid' || !localPrefs.contentViewMode
                  ? 'bg-white dark:bg-gray-700 shadow-sm font-bold'
                  : 'text-gray-500'
              }`}
            >
              Grid View
            </button>
            <button 
              onClick={() => setLocalPrefs({ ...localPrefs, contentViewMode: 'list' })}
              className={`px-6 py-2 rounded-md text-sm transition-all ${
                localPrefs.contentViewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 shadow-sm font-bold'
                  : 'text-gray-500'
              }`}
            >
              List View
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-top">
          {message && (
            <div className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="ml-auto px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
