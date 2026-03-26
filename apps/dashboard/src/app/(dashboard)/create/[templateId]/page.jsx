'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CaptionEditor from '@/components/CaptionEditor';
import HashtagChips from '@/components/HashtagChips';
import PhonePreview from '@/components/PhonePreview';

export default function CustomizePage() {
  const { templateId } = useParams();
  const router = useRouter();

  const [topic, setTopic] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [platform, setPlatform] = useState('tiktok');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');

  const handleGenerate = async () => {
    if (!topic) {
      alert('Please enter a topic first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, template: templateId, platform }),
      });

      const data = await response.json();
      if (data.caption) {
        setCaption(data.caption);
        setHashtags(data.hashtags);
      } else {
        alert(data.error || 'Failed to generate caption');
      }
    } catch (error) {
      console.error('AI error:', error);
      alert('Failed to connect to AI service');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    // Stub for saving to DB
    alert('Draft saved successfully!');
    router.push('/dashboard');
  };

  return (
    <div className="max-w-[1200px] mx-auto p-8">
      <button
        onClick={() => router.back()}
        className="mb-8 bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to Templates
      </button>

      <div className="grid grid-cols-[1fr_350px] gap-12">
        <div className="flex flex-col gap-8">
          <section>
            <h2>What&apos;s your post about?</h2>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., A quick product demo for our new feature..."
              className="w-full p-4 rounded-lg border border-input bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </section>

          <section>
            <CaptionEditor
              caption={caption}
              onChange={setCaption}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </section>

          <section>
            <HashtagChips
              hashtags={hashtags}
              onAdd={(tag) => setHashtags([...hashtags, tag.replace('#', '')])}
              onRemove={(tag) => setHashtags(hashtags.filter(t => t !== tag))}
            />
          </section>

          <section>
            <h2>Select Platform</h2>
            <div className="flex gap-4">
              {['tiktok', 'instagram', 'x'].map(p => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-4 py-2 rounded-md border border-input cursor-pointer capitalize transition-colors ${
                    platform === p
                      ? 'bg-foreground text-background'
                      : 'bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </section>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSave}
              className="px-8 py-4 rounded-lg border border-border cursor-pointer font-bold bg-background text-foreground hover:bg-muted transition-colors"
            >
              Save as Draft
            </button>
            <button
              className="flex-1 px-8 py-4 rounded-lg border-none bg-purple-600 text-white cursor-pointer font-bold hover:bg-purple-700 transition-colors"
            >
              Export / Publish
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <h3 className="m-0">Preview</h3>
          <PhonePreview platform={platform} caption={caption} hashtags={hashtags} mediaUrl={mediaUrl} />
        </div>
      </div>
    </div>
  );
}
