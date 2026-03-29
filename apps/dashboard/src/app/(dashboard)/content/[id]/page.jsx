"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams, useSearchParams } from "next/navigation";


export default function ContentDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const tableName = searchParams.get("tableName");

  const content = useQuery(api.content.get, tableName ? { _id: id, tableName } : "skip");


  if (content === undefined) return <div className="animate-pulse space-y-4 p-6"><div className="h-7 bg-muted rounded w-1/3" /><div className="h-4 bg-muted rounded w-full" /><div className="h-4 bg-muted rounded w-2/3" /></div>;
  if (content === null) return <div className="p-6">Content not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{content.title || content.text?.slice(0,50) || content.content?.slice(0,50) || "Content Detail"}</h1>
      {content.text && <p className="mb-4 text-foreground">{content.text}</p>}
      {content.content && <p className="mb-4 text-foreground">{content.content}</p>}
      {content.imageUrl && <img src={content.imageUrl} alt="" className="rounded-lg mb-4 max-w-full" />}
      {tableName === 'mediaFiles' && content.mimeType.startsWith('image/') && <img src={`/api/media/${content._id}`} alt="" className="rounded-lg mb-4 max-w-full" />}
      {content.videoUrl && <video src={content.videoUrl} controls className="rounded-lg mb-4 max-w-full" />}
      {tableName === 'mediaFiles' && content.mimeType.startsWith('video/') && <video src={`/api/media/${content._id}`} controls className="rounded-lg mb-4 max-w-full" />}
      <div className="flex gap-2">
        {content.status && <span className="px-3 py-1 rounded-full text-sm bg-muted capitalize">{content.status}</span>}
        {content.platforms?.map((p) => (
          <span key={p} className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{p}</span>
        ))}
      </div>
    </div>
  );
}
