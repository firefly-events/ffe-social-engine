"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ContentDetailPage() {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/content/${id}`)
      .then(res => res.json())
      .then(data => { setContent(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!content) return <div className="p-6">Content not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{content.title || "Content Detail"}</h1>
      {content.text && <p className="mb-4 text-foreground">{content.text}</p>}
      {content.imageUrl && <img src={content.imageUrl} alt="" className="rounded-lg mb-4 max-w-full" />}
      {content.videoUrl && <video src={content.videoUrl} controls className="rounded-lg mb-4 max-w-full" />}
      <div className="flex gap-2">
        <span className="px-3 py-1 rounded-full text-sm bg-muted capitalize">{content.status}</span>
        {content.platforms?.map(p => (
          <span key={p} className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">{p}</span>
        ))}
      </div>
    </div>
  );
}
