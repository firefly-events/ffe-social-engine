"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { useState } from "react";

export default function SavedVariantsPage() {
  const { user } = useUser();
  const [filter, setFilter] = useState<"text" | "image" | "video" | undefined>(undefined);

  const variants = useQuery(
    api.savedVariants.list,
    user?.id ? { userId: user.id, assetType: filter, limit: 50 } : "skip"
  );
  const removeVariant = useMutation(api.savedVariants.remove);

  if (!user) return null;

  const typeLabels: Record<string, string> = { text: "Text", image: "Image", video: "Video" };
  const filters = [
    { label: "All", value: undefined },
    { label: "Text", value: "text" as const },
    { label: "Images", value: "image" as const },
    { label: "Videos", value: "video" as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Saved Variants</h1>
        <p className="text-zinc-400 text-sm mt-1">Browse your saved generation variants</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === f.value
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Variants grid */}
      {variants === undefined ? (
        <div className="text-zinc-500 text-sm">Loading...</div>
      ) : variants.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-lg">No saved variants yet</p>
          <p className="text-sm mt-1">Save variants from your generations to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {variants.map((variant) => (
            <div key={variant._id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400">
                  {typeLabels[variant.assetType]}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(variant.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="min-h-[60px]">
                {variant.assetType === "text" && variant.content && (
                  <p className="text-sm text-zinc-200 whitespace-pre-wrap line-clamp-4">{variant.content}</p>
                )}
                {variant.assetType === "image" && variant.imageUrl && (
                  <img src={variant.imageUrl} alt="Saved" className="rounded-lg w-full max-h-48 object-cover" />
                )}
                {variant.assetType === "video" && variant.videoUrl && (
                  <video src={variant.videoUrl} controls className="rounded-lg w-full max-h-48" />
                )}
              </div>

              {variant.prompt && (
                <p className="text-xs text-zinc-500 truncate" title={variant.prompt}>
                  Prompt: {variant.prompt}
                </p>
              )}

              <button
                onClick={() => removeVariant({ id: variant._id })}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
