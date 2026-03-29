"use client";

import React, { useState, useEffect, useRef } from "react";
import PhonePreview from "../../../components/PhonePreview";
import type { ComposeFormat } from "@/lib/api-types";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";

type PlatformOption = { id: string; label: string; format: ComposeFormat; previewPlatform: string };

const PLATFORMS: PlatformOption[] = [
  { id: "tiktok", label: "TikTok", format: "9:16", previewPlatform: "tiktok" },
  { id: "instagram_reels", label: "Instagram Reels", format: "9:16", previewPlatform: "instagram" },
  { id: "instagram_square", label: "Instagram (Square)", format: "1:1", previewPlatform: "instagram" },
  { id: "twitter", label: "Twitter / X", format: "16:9", previewPlatform: "x" },
];

const FORMAT_LABELS: Record<ComposeFormat, string> = {
  "9:16": "9:16 • Vertical",
  "1:1": "1:1 • Square",
  "16:9": "16:9 • Landscape",
};

type JobStatus = "idle" | "processing" | "ready" | "error";

export default function ComposePage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformOption>(PLATFORMS[0]);
  const [textOverlay, setTextOverlay] = useState("");
  const [jobStatus, setJobStatus] = useState<JobStatus>("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  const startPolling = (id: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/compose/${id}`);
        if (!res.ok) { stopPolling(); setJobStatus("error"); setErrorMessage("Failed to poll job status"); return; }
        const data = await res.json();
        if (data.status === "completed" || data.status === "ready") {
          stopPolling(); setJobStatus("ready"); setResultUrl(data.resultUrl ?? data.result_url ?? null);
        } else if (data.status === "failed" || data.status === "error") {
          stopPolling(); setJobStatus("error"); setErrorMessage(data.error ?? "Composition failed");
        }
      } catch { stopPolling(); setJobStatus("error"); setErrorMessage("Network error while polling"); }
    }, 2000);
  };

  const handleCompose = async () => {
    if (!videoUrl.trim()) return;
    trackEvent(ANALYTICS_EVENTS.VIDEO_COMPOSED, {
      platform_id: selectedPlatform.id,
      format: selectedPlatform.format,
      has_text_overlay: !!textOverlay.trim(),
      source: 'compose_page',
    })
    setJobStatus("processing"); setJobId(null); setResultUrl(null); setErrorMessage(null); stopPolling();
    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: videoUrl.trim(), platform: selectedPlatform.id, format: selectedPlatform.format, textOverlay: textOverlay.trim() || undefined }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); setJobStatus("error"); setErrorMessage(err.error ?? "Failed to start composition"); return; }
      const data = await res.json();
      setJobId(data.id);
      startPolling(data.id);
    } catch { setJobStatus("error"); setErrorMessage("Network error — could not reach compose API"); }
  };

  const previewMediaUrl = resultUrl ?? (videoUrl.trim() || undefined);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-1">Video Composer</h1>
        <p className="text-muted-foreground mb-8">Compose your video for any platform — pick a format, add a caption, and preview before publishing.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">Video URL</label>
              <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://example.com/my-video.mp4"
                className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">Platform</label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => (
<<<<<<< HEAD
                  <button key={p.id} onClick={() => setSelectedPlatform(p)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${selectedPlatform.id === p.id ? "bg-indigo-600 border-indigo-500 text-white" : "bg-card border-border text-foreground/80 hover:bg-muted"}`}>
=======
                  <button key={p.id} onClick={() => {
                    setSelectedPlatform(p)
                    trackEvent(ANALYTICS_EVENTS.COMPOSE_PLATFORM_SELECTED, {
                      platform_id: p.id,
                      format: p.format,
                      source: 'compose_page',
                    })
                  }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${selectedPlatform.id === p.id ? "bg-indigo-600 border-indigo-500 text-white" : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"}`}>
>>>>>>> 6ba5dca (feat(FIR-1224): instrument all CTAs and key actions with PostHog tracking)
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Format: <span className="text-indigo-400 font-mono">{FORMAT_LABELS[selectedPlatform.format]}</span></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">Text Overlay <span className="text-muted-foreground font-normal">(optional)</span></label>
              <textarea value={textOverlay} onChange={(e) => setTextOverlay(e.target.value)} rows={3} placeholder="Add a caption or text overlay…"
                className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <button onClick={handleCompose} disabled={!videoUrl.trim() || jobStatus === "processing"}
              className="w-full py-3 px-6 rounded-lg font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {jobStatus === "processing" ? "Composing…" : "Compose Video"}
            </button>
            {jobStatus === "processing" && (
              <div className="flex items-center gap-3 text-sm text-indigo-400">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing…{jobId && <span className="text-muted-foreground font-mono text-xs">({jobId})</span>}
              </div>
            )}
            {jobStatus === "ready" && resultUrl && (
              <div className="rounded-lg bg-green-900/30 border border-green-700 p-4 text-sm space-y-2">
                <p className="text-green-400 font-medium">Composition complete!</p>
                <a href={resultUrl} download className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">Download video</a>
              </div>
            )}
            {jobStatus === "error" && (
              <div className="rounded-lg bg-red-900/30 border border-red-700 p-4 text-sm">
                <p className="text-red-400 font-medium">Error</p>
                <p className="text-red-300 mt-1">{errorMessage}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm text-muted-foreground">Preview — <span className="font-mono text-indigo-400">{FORMAT_LABELS[selectedPlatform.format]}</span></div>
            <PhonePreview platform={selectedPlatform.previewPlatform} caption={textOverlay || undefined} hashtags={[]} mediaUrl={previewMediaUrl} videoUrl={previewMediaUrl} />
            <p className="text-xs text-gray-600 text-center max-w-xs">Preview shows source video. Updates to composed result when ready.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
