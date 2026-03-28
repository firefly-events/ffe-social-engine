"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

// TODO: Replace with actual Player component
const Player = ({ src }: { src: string }) => (
  <audio controls src={src} className="w-full" />
);

export default function VoicePage() {
  const { user } = useUser();
  const [text, setText] = useState("");
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneName, setCloneName] = useState("");

  const voiceClones = useQuery(api.voiceClones.get, user ? { userId: user.id } : "skip");

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });

  const cloneVoice = async (file: File) => {
    if (!cloneName.trim()) {
      alert("Please enter a name for the voice clone.");
      return;
    }
    setIsCloning(true);
    try {
      const audioData = await toBase64(file);
      const response = await fetch("/api/voice/clone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cloneName,
          audioData,
          mimeType: file.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Voice cloning failed");
      }
      
      alert("Voice cloning successful!");
      setCloneName("");
      // Convex will automatically refetch the query
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      alert(`Error starting voice cloning: ${errorMessage}`);
    } finally {
      setIsCloning(false);
    }
  };

  const handleGenerate = async () => {
    if (!text || !voiceClones?.[0]) return;

    setIsGenerating(true);
    setGeneratedAudio(null);

    try {
      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: voiceClones[0].externalId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'TTS Generation failed');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      setGeneratedAudio(audioUrl);

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        alert(`Error generating audio: ${errorMessage}`);
    } finally {
        setIsGenerating(false);
    }
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      cloneVoice(files[0]);
    }
  };

  if (process.env.NEXT_PUBLIC_VOICE_GEN_URL === undefined) {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center">
                <h3 className="text-lg font-semibold">Voice Generation Service Offline</h3>
                <p className="text-sm text-gray-500">The voice generation service is not configured. Please contact support.</p>
            </div>
        </div>
    );
  }


  return (
    <div className="dark:bg-gray-900 text-white min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Voice Generation</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Voice Cloning Section */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Clone a Voice</h2>
            <p className="text-gray-400 mb-4">
              Upload an audio sample of a voice to create a clone for TTS.
            </p>
            <input
              type="text"
              placeholder="Voice Name"
              className="w-full p-2 bg-gray-700 rounded mb-4"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
            />
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">WAV, MP3 (MAX. 10MB)</p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isCloning || !cloneName}
                  accept="audio/wav,audio/mpeg"
                />
              </label>
            </div>
            {isCloning && <p className="text-center mt-4">Cloning voice...</p>}

            <h3 className="text-xl font-semibold mt-8 mb-4">Your Voice Clones</h3>
            <div className="space-y-4">
              {voiceClones === undefined && <div>Loading voices...</div>}
              {voiceClones?.map((clone) => (
                <div key={clone._id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                  <span>{clone.name || 'Untitled Clone'}</span>
                  <span className="text-sm text-gray-400">{new Date(clone._creationTime).toLocaleDateString()}</span>
                </div>
              ))}
              {voiceClones?.length === 0 && <p className="text-gray-500">No voice clones found.</p>}
            </div>
          </div>

          {/* Text-to-Speech Section */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Generate Speech</h2>
            <p className="text-gray-400 mb-4">
              Select a cloned voice and enter text to generate audio.
            </p>
            <div className="space-y-4">
              <select className="w-full p-2 bg-gray-700 rounded" disabled={!voiceClones || voiceClones.length === 0}>
                {voiceClones?.map((clone) => (
                  <option key={clone._id} value={clone.externalId}>{clone.name || 'Untitled Clone'}</option>
                ))}
                {voiceClones?.length === 0 && <option>No voices available</option>}
              </select>
              <textarea
                className="w-full p-2 bg-gray-700 rounded h-40"
                placeholder="Enter text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
                onClick={handleGenerate}
                disabled={isGenerating || !text || !voiceClones || voiceClones.length === 0}
              >
                {isGenerating ? "Generating..." : "Generate Audio"}
              </button>
              {generatedAudio && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Generated Audio</h3>
                    <Player src={generatedAudio} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
