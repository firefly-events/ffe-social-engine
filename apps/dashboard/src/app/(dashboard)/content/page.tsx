"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ContentCard from "@/components/ContentCard";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const FILTER_TABS = ["all", "text", "image", "video"] as const;

export default function ContentLibraryPage() {
  const { userId: clerkId } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "text" | "image" | "video">("all");
  const [search, setSearch] = useState("");

  const user = useQuery(api.users.getByClerkId, clerkId ? { clerkId } : "skip");
  const items = useQuery(api.content.list, user?._id ? { userId: user._id, filter: filter === "all" ? undefined : filter } : "skip");
  const deleteItem = useMutation(api.content.deleteItem);

  const handleDelete = (item: any) => {
    deleteItem({ id: item._id });  };

  const handleReUse = (item: any) => {
    const params = new URLSearchParams();
    if(item.text) params.set("text", item.text);
    if(item.imageUrl) params.set("imageUrl", item.imageUrl);
    if(item.videoUrl) params.set("videoUrl", item.videoUrl);
    if(item.content) params.set("text", item.content);
    
    router.push(`/create?${params.toString()}`);
  };

  const filtered = search
    ? items?.filter(
        (item: any) =>
          item.text?.toLowerCase().includes(search.toLowerCase()) ||
          item.title?.toLowerCase().includes(search.toLowerCase()) ||
          item.content?.toLowerCase().includes(search.toLowerCase())
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

      <input
        type="text"
        placeholder="Search content..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 border rounded-lg bg-background"
      />

      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex gap-1 border rounded-lg p-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-md text-sm capitalize transition-colors ${
                filter === tab
                  ? "bg-blue-600 text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {items === undefined ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered && filtered.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered?.map((item: any) => (
            <div key={item._id}>
              <Link href={`/content/${item._id}?tableName=${item._tableName}`}>
                <ContentCard
                  title={item.title || item.text?.slice(0, 50) || item.content?.slice(0, 50) || "Untitled"}
                  type={item.type || item._tableName}
                  status={
                    item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : 'New'
                  }
                  date={new Date(item._creationTime).toLocaleDateString()}
                  thumbnail={item.imageUrl || (item._tableName === 'mediaFiles' && item.mimeType.startsWith('image/')) ? `/api/media/${item._id}` : undefined}
                />
              </Link>
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => handleReUse(item)} className="text-xs text-gray-500 hover:text-gray-700">Re-use</button>
                <button onClick={() => handleDelete(item)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
