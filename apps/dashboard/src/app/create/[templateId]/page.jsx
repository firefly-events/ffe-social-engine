'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CaptionEditor from '../../../../components/CaptionEditor';
import HashtagChips from '../../../../components/HashtagChips';
import PhonePreview from '../../../../components/PhonePreview';

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <button 
        onClick={() => router.back()}
        style={{ marginBottom: '2rem', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
      >
        ← Back to Templates
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <h2>What's your post about?</h2>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., A quick product demo for our new feature..."
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
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
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['tiktok', 'instagram', 'x'].map(p => (
                <button 
                  key={p}
                  onClick={() => setPlatform(p)}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '6px', 
                    border: '1px solid #ccc',
                    backgroundColor: platform === p ? '#333' : 'white',
                    color: platform === p ? 'white' : '#333',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </section>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              onClick={handleSave}
              style={{ padding: '1rem 2rem', borderRadius: '8px', border: '1px solid #333', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Save as Draft
            </button>
            <button 
              style={{ padding: '1rem 2rem', borderRadius: '8px', border: 'none', backgroundColor: '#8e44ad', color: 'white', cursor: 'pointer', fontWeight: 'bold', flexGrow: 1 }}
            >
              Export / Publish
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Preview</h3>
          <PhonePreview platform={platform} caption={caption} hashtags={hashtags} mediaUrl={mediaUrl} />
        </div>
      </div>
    </div>
  );
}
