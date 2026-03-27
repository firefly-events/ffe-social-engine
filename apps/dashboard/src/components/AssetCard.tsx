"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";

interface AssetCardProps {
  assetType: "text" | "image" | "video";
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  prompt?: string;
  model?: string;
  generationJobId?: Id<"generationJobs">;
  onRegenerate?: () => void;
  onRetry?: () => void;
}

export function AssetCard({
  assetType,
  content,
  imageUrl,
  videoUrl,
  prompt,
  model,
  generationJobId,
  onRegenerate,
  onRetry,
}: AssetCardProps) {
  const saveVariant = useMutation(api.savedVariants.save);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveVariant({
        assetType,
        content,
        imageUrl,
        videoUrl,
        prompt,
        model,
        generationJobId,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const typeLabels: Record<string, string> = { text: "Text", image: "Image", video: "Video" };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
          {typeLabels[assetType]}
        </span>
        {model && (
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
            {model}
          </span>
        )}
      </div>

      {/* Asset Preview */}
      <div className="min-h-[80px]">
        {assetType === "text" && content && (
          <p className="text-sm text-zinc-200 whitespace-pre-wrap">{content}</p>
        )}
        {assetType === "image" && imageUrl && (
          <img src={imageUrl} alt="Generated" className="rounded-lg w-full max-h-64 object-cover" />
        )}
        {assetType === "video" && videoUrl && (
          <video src={videoUrl} controls className="rounded-lg w-full max-h-64" />
        )}
      </div>

      {prompt && (
        <p className="text-xs text-zinc-500 truncate" title={prompt}>
          Prompt: {prompt}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-1">
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Regenerate
          </button>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
          >
            Try Again
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saved || saving}
          className={`flex-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${
            saved
              ? "bg-green-900 text-green-300 cursor-default"
              : "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
          }`}
        >
          {saved ? "Saved" : saving ? "Saving..." : "Save Variant"}
        </button>
      </div>
    </div>
  );
}
