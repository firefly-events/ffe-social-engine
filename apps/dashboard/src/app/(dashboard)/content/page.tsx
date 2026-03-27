"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ContentCard from "@/components/ContentCard";

type ContentStatus = "draft" | "scheduled" | "posted" | "archived";

interface ContentItem {
  id: string;
  title?: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  platforms?: string[];
  status: ContentStatus;
  createdAt: string;
  type?: string;
}

interface ApiResponse {
  items: ContentItem[];
  nextCursor?: string | null;
  total?: number;
}

const STATUS_TABS = ["all", "draft", "scheduled", "posted", "archived"] as const;
const PLATFORMS = ["All Platforms", "Instagram", "TikTok", "Twitter", "Facebook", "LinkedIn", "YouTube"];

export default function ContentLibraryPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | ContentStatus>("all");
  const [platformFilter, setPlatformFilter] = useState("All Platforms");
  const [search, setSearch] = useState("");

  const fetchContent = useCallback(async (reset = false) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (platformFilter !== "All Platforms") params.set("platform", platformFilter.toLowerCase());
    if (!reset && cursor) params.set("cursor", cursor);

    try {
      const res = await fetch(`/api/content?${params}`);
      const data: ApiResponse = await res.json();
      if (reset) {
        setItems(data.items || []);
      } else {
        setItems(prev => [...prev, ...(data.items || [])]);
      }
      setCursor(data.nextCursor ?? undefined);
      setHasMore(!!data.nextCursor);
    } catch (err) {
      console.error("Failed to fetch content:", err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, platformFilter]);

  useEffect(() => {
    setCursor(undefined);
    fetchContent(true);
  }, [fetchContent]);

  const filtered = search
    ? items.filter(
        item =>
          item.text?.toLowerCase().includes(search.toLowerCase()) ||
          item.title?.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Content Library</h1>
        <Link
          href="/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Content
        </Link>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search content..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 border rounded-lg bg-background"
      />

      {/* Filters row */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {/* Status tabs */}
        <div className="flex gap-1 border rounded-lg p-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 rounded-md text-sm capitalize transition-colors ${
                statusFilter === tab
                  ? "bg-blue-600 text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Platform filter */}
        <select
          value={platformFilter}
          onChange={e => setPlatformFilter(e.target.value)}
          className="border rounded-lg px-3 py-1 text-sm bg-background"
        >
          {PLATFORMS.map(p => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Content grid */}
      {loading && items.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-xl font-semibold mb-2">No content yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first piece of content to get started.
          </p>
          <Link
            href="/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Create Content
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => (
              <Link key={item.id} href={`/content/${item.id}`}>
                <ContentCard
                  title={item.title || item.text?.slice(0, 50) || "Untitled"}
                  type={item.type || "text"}
                  status={
                    item.status.charAt(0).toUpperCase() + item.status.slice(1)
                  }
                  date={new Date(item.createdAt).toLocaleDateString()}
                  thumbnail={item.imageUrl}
                />
              </Link>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchContent(false)}
                disabled={loading}
                className="px-6 py-2 border rounded-lg hover:bg-muted disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
