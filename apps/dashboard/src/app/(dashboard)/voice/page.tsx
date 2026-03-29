"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Upload, Mic, Settings, PlayCircle, Loader2 } from "lucide-react";

// TODO: Replace with actual Player component
const Player = ({ src }: { src: string }) => (
  <audio controls src={src} className="w-full" />
);

const defaultVoices = [
  { _id: "default-1", name: "Alloy", externalId: "alloy" },
  { _id: "default-2", name: "Echo", externalId: "echo" },
  { _id: "default-3", name: "Fable", externalId: "fable" },
  { _id: "default-4", name: "Onyx", externalId: "onyx" },
  { _id: "default-5", name: "Nova", externalId: "nova" },
  { _id: "default-6", name: "Shimmer", externalId: "shimmer" },
];

export default function VoicePage() {
  const { user } = useUser();
  const [text, setText] = useState("");
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneName, setCloneName] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string>(defaultVoices[0].externalId);

  const voiceClones = useQuery(api.voiceClones.get, user ? { userId: user.id } : "skip");

  const allVoices = [...defaultVoices, ...(voiceClones || [])];

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (error) => reject(error);
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
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      alert(`Error starting voice cloning: ${errorMessage}`);
    } finally {
      setIsCloning(false);
    }
  };

  const handleGenerate = async () => {
    if (!text || !selectedVoice) return;

    setIsGenerating(true);
    setGeneratedAudio(null);

    try {
      const response = await fetch("/api/voice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId: selectedVoice }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "TTS Generation failed");
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      setGeneratedAudio(audioUrl);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
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
          <h3 className="text-lg font-semibold">
            Voice Generation Service Offline
          </h3>
          <p className="text-sm text-gray-500">
            The voice generation service is not configured. Please contact
            support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-gray-900 text-white min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Voice Studio</h1>
          <p className="text-gray-400 mt-2">
            Create, clone, and generate speech with AI-powered voices.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main TTS Section */}
          <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <PlayCircle className="mr-3 text-blue-400" />
              Text to Speech
            </h2>
            <div className="space-y-4">
              <textarea
                className="w-full p-3 bg-gray-700/60 rounded-lg h-48 focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Enter the text you want to convert to speech..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select a Voice
                </label>
                <select
                  className="w-full p-3 bg-gray-700/60 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  disabled={voiceClones === undefined}
                >
                  <optgroup label="Default Voices">
                    {defaultVoices.map((voice) => (
                      <option key={voice._id} value={voice.externalId}>
                        {voice.name}
                      </option>
                    ))}
                  </optgroup>
                  {voiceClones && voiceClones.length > 0 && (
                    <optgroup label="Your Cloned Voices">
                      {voiceClones.map((clone) => (
                        <option key={clone._id} value={clone.externalId}>
                          {clone.name || "Untitled Clone"}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {voiceClones === undefined && <div className="text-sm text-gray-500 mt-2">Loading your voices...</div>}
              </div>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300"
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim() || !selectedVoice}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Audio"
                )}
              </button>
              {generatedAudio && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Your Audio</h3>
                  <Player src={generatedAudio} />
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Clone Voice Section */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Mic className="mr-3 text-green-400" />
                Clone Your Voice
              </h2>
              <p className="text-gray-400 mb-4 text-sm">
                Upload a clear audio sample (WAV/MP3, &lt;10MB) to create a new voice clone.
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter Voice Name"
                  className="w-full p-3 bg-gray-700/60 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                />
                <div>
                  <label
                    htmlFor="dropzone-file"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer ${
                      cloneName ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-700/50 cursor-not-allowed'
                    } transition`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-1 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span>
                      </p>
                      <p className="text-xs text-gray-500">WAV, MP3 (MAX. 10MB)</p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isCloning || !cloneName.trim()}
                      accept="audio/wav,audio/mpeg"
                    />
                  </label>
                </div>
                {isCloning && (
                  <p className="text-center text-sm mt-2 flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cloning in progress...
                  </p>
                )}
              </div>
            </div>

            {/* Voice Management Section */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Settings className="mr-3 text-purple-400" />
                Manage Voices
              </h2>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {voiceClones === undefined && <p className="text-gray-400 text-sm">Loading voices...</p>}
                {voiceClones?.length === 0 && <p className="text-gray-400 text-sm">You haven't cloned any voices yet.</p>}
                {voiceClones?.map((clone) => (
                  <div key={clone._id} className="bg-gray-700/60 p-3 rounded-lg flex justify-between items-center text-sm">
                    <span>{clone.name || "Untitled Clone"}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(clone._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
