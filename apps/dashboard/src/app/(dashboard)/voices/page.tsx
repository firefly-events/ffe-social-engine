"use client";

import React, { useState, useEffect, useRef } from "react";
import { GuidedUnlockWizard } from "../../../components/GuidedUnlockWizard";

interface VoiceClone {
  id: string;
  userId: string;
  name: string;
  sampleUrl: string;
  status: "processing" | "ready" | "failed";
  durationSeconds?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<VoiceClone["status"], string> = {
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
};

const STATUS_COLORS: Record<VoiceClone["status"], string> = {
  processing: "bg-yellow-100 text-yellow-800",
  ready: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function VoicesPage() {
  const [clones, setClones] = useState<VoiceClone[]>([]);
  const [selectedClone, setSelectedClone] = useState<VoiceClone | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [cloneName, setCloneName] = useState("");
  const [loadingClones, setLoadingClones] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClones();
  }, []);

  async function fetchClones() {
    setLoadingClones(true);
    try {
      const res = await fetch("/api/voice");
      if (res.ok) {
        const data = await res.json();
        setClones(data.items ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch clones:", err);
    } finally {
      setLoadingClones(false);
    }
  }

  async function handleCloneVoice() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert("Please select an audio file.");
      return;
    }
    if (!cloneName.trim()) {
      alert("Please enter a name for your voice clone.");
      return;
    }

    setCloning(true);
    try {
      const audioData = await readFileAsBase64(file);
      const res = await fetch("/api/voice/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cloneName.trim(),
          audioData,
          mimeType: file.type || "audio/wav",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Failed to clone voice");
      }

      const newClone: VoiceClone = await res.json();
      setClones((prev) => [newClone, ...prev]);
      setCloneName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Voice clone error:", err);
      alert(err instanceof Error ? err.message : "Failed to clone voice.");
    } finally {
      setCloning(false);
    }
  }

  async function handleGenerate() {
    if (!selectedClone) return;
    if (!text.trim()) {
      alert("Please enter some text to generate speech.");
      return;
    }

    setGenerating(true);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/voice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloneId: selectedClone.id,
          text: text.trim(),
          speed: 1.0,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Failed to generate speech");
      }

      const data = await res.json();
      setAudioUrl(data.audioUrl);
    } catch (err) {
      console.error("Generate error:", err);
      alert(err instanceof Error ? err.message : "Failed to generate speech.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(clone: VoiceClone) {
    if (!confirm(`Delete voice clone "${clone.name}"?`)) return;
    try {
      const res = await fetch(`/api/voice/${clone.id}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setClones((prev) => prev.filter((c) => c.id !== clone.id));
        if (selectedClone?.id === clone.id) {
          setSelectedClone(null);
          setAudioUrl(null);
        }
      } else {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        alert(err.error || "Failed to delete voice clone.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete voice clone.");
    }
  }

  // Trial handler uploads the first clone for the free trial
  async function handleRunTrial() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      throw new Error("Please select an audio file to clone.");
    }
    if (!cloneName.trim()) {
      throw new Error("Please enter a name for your voice clone.");
    }
    await handleCloneVoice();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Voice Studio</h1>
      <p className="text-gray-600 mb-8">
        Clone your voice using XTTSv2 and generate natural-sounding speech.
      </p>

      {/* Clone creation form */}
      <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Create Voice Clone</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="clone-name" className="block text-sm font-medium text-gray-700 mb-1">
              Voice Name
            </label>
            <input
              id="clone-name"
              type="text"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              placeholder="My Voice"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="audio-file" className="block text-sm font-medium text-gray-700 mb-1">
              Audio Sample (WAV/MP3, up to 10 MB)
            </label>
            <input
              id="audio-file"
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            onClick={handleCloneVoice}
            disabled={cloning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {cloning ? "Cloning..." : "Clone Voice"}
          </button>
        </div>
      </div>

      {/* Voice clones list */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Your Voice Clones</h2>
        {loadingClones ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : clones.length === 0 ? (
          <p className="text-gray-500 text-sm">No voice clones yet. Create one above.</p>
        ) : (
          <div className="space-y-3">
            {clones.map((clone) => (
              <div
                key={clone.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedClone?.id === clone.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                onClick={() => {
                  if (clone.status === "ready") {
                    setSelectedClone(clone);
                    setAudioUrl(null);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{clone.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[clone.status]}`}
                    >
                      {STATUS_LABELS[clone.status]}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(clone);
                    }}
                    disabled={clone.status === "processing"}
                    className="text-sm text-red-600 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
                {clone.errorMessage && (
                  <p className="mt-1 text-xs text-red-600">{clone.errorMessage}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Created {new Date(clone.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Speech generation panel */}
      {selectedClone && selectedClone.status === "ready" && (
        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Generate Speech
            <span className="ml-2 text-sm font-normal text-gray-500">
              using {selectedClone.name}
            </span>
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="speech-text" className="block text-sm font-medium text-gray-700 mb-1">
                Text to Speak
              </label>
              <textarea
                id="speech-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to convert to speech..."
                rows={4}
                maxLength={5000}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{text.length}/5000 characters</p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || !text.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {generating ? "Generating..." : "Generate Speech"}
            </button>
          </div>

          {audioUrl && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Generated Audio:</p>
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      )}

      {/* Free trial gate */}
      <GuidedUnlockWizard
        featureId="voice_cloning"
        featureName="Voice Cloning"
        description="Create your personalized AI voice clone in minutes. Upload a 30-second audio sample and let our AI do the rest."
        onRunTrial={handleRunTrial}
        trialOutputComponent={
          audioUrl ? (
            <div className="flex flex-col items-center">
              <p className="mb-4 text-sm font-medium text-gray-700">Your generated audio sample:</p>
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : null
        }
      />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is "data:<mime>;base64,<data>" — strip the prefix
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Failed to extract base64 from file"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
