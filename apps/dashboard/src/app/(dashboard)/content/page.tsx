'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ContentCard from '@/components/ContentCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ContentItem, ContentStatus } from '@/lib/api-types';

const STATUS_TABS: { label: string; value: ContentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Posted', value: 'posted' },
  { label: 'Archived', value: 'archived' },
];

const PLATFORMS = [
  { label: 'All Platforms', value: '' },
  { label: 'Twitter / X', value: 'twitter' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'YouTube', value: 'youtube' },
];

interface ContentResponse {
  items: ContentItem[];
  nextCursor: string | null;
  total: number;
}

export default function ContentLibraryPage() {
  const router = useRouter();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState('');
  const [search, setSearch] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchContent = useCallback(async (cursor?: string) => {
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (platformFilter) params.set('platform', platformFilter);
    if (cursor) params.set('cursor', cursor);
    params.set('limit', '20');

    const res = await fetch(`/api/content?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch content');
    return res.json() as Promise<ContentResponse>;
  }, [statusFilter, platformFilter]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchContent().then((data) => {
      if (!cancelled) {
        setItems(data.items);
        setNextCursor(data.nextCursor);
        setIsLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [fetchContent]);

  const handleLoadMore = async () => {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    try {
      const data = await fetchContent(nextCursor);
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Client-side text search filter
  const filtered = search.trim()
    ? items.filter((item) => item.text.toLowerCase().includes(search.toLowerCase()))
    : items;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const getContentType = (item: ContentItem) => {
    if (item.videoUrl) return 'Video';
    if (item.imageUrl) return 'Image';
    if (item.audioUrl) return 'Audio';
    return 'Text';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Library</h1>
          <p className="mt-1 text-muted-foreground">Browse and manage your generated content</p>
        </div>
        <Button
          onClick={() => router.push('/create')}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          + Create New
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        {/* Status tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + platform filter */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-md px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {/* Content list */}
      {!isLoading && filtered.length > 0 && (
        <div>
          {filtered.map((item) => (
            <a key={item.id} href={`/content/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <ContentCard
                title={item.text.length > 80 ? item.text.slice(0, 80) + '...' : item.text}
                type={getContentType(item)}
                status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                date={formatDate(item.createdAt)}
                thumbnail={item.imageUrl}
              />
            </a>
          ))}

          {/* Load more */}
          {nextCursor && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <Card className="p-12 text-center">
          <h3 className="text-xl font-semibold mb-2">No content yet</h3>
          <p className="text-muted-foreground mb-6">
            {search.trim()
              ? 'No content matches your search. Try a different query.'
              : 'Start creating amazing content for your social channels.'}
          </p>
          {!search.trim() && (
            <Button
              onClick={() => router.push('/create')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Create Your First Content
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
