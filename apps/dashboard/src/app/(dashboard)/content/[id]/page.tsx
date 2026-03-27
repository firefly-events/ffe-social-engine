'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ContentItem } from '@/lib/api-types';

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/content/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Content not found');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setItem(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setIsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || 'This content item does not exist.'}</p>
        <Button onClick={() => router.push('/content')}>Back to Library</Button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-amber-50 text-amber-700',
    posted: 'bg-green-50 text-green-700',
    archived: 'bg-gray-50 text-gray-500',
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button
        onClick={() => router.push('/content')}
        className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
      >
        &larr; Back to Library
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {item.text.length > 100 ? item.text.slice(0, 100) + '...' : item.text}
          </h1>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[item.status] || ''}`}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              Created {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Content body */}
      <Card className="p-6 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Content</h2>
        <p className="whitespace-pre-wrap">{item.text}</p>
      </Card>

      {/* Media */}
      {(item.imageUrl || item.videoUrl || item.audioUrl) && (
        <Card className="p-6 mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Media</h2>
          {item.videoUrl && (
            <video src={item.videoUrl} controls className="w-full max-w-lg rounded-lg" />
          )}
          {item.imageUrl && !item.videoUrl && (
            <img src={item.imageUrl} alt="Content" className="w-full max-w-lg rounded-lg" />
          )}
          {item.audioUrl && (
            <audio src={item.audioUrl} controls className="w-full" />
          )}
        </Card>
      )}

      {/* Metadata */}
      <Card className="p-6 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Platforms:</span>{' '}
            <span className="font-medium">{item.platforms.join(', ') || 'None'}</span>
          </div>
          {item.aiModel && (
            <div>
              <span className="text-muted-foreground">AI Model:</span>{' '}
              <span className="font-medium">{item.aiModel}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Created:</span>{' '}
            <span className="font-medium">{new Date(item.createdAt).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Updated:</span>{' '}
            <span className="font-medium">{new Date(item.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* Prompt */}
      {item.prompt && (
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Generation Prompt</h2>
          <p className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">{item.prompt}</p>
        </Card>
      )}
    </div>
  );
}
