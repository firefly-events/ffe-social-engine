"use client";

import React, { useState } from "react";
import { GuidedUnlockWizard } from "../../../components/GuidedUnlockWizard";

export default function VoicesPage() {
  const [output, setOutput] = useState<string | null>(null);

  const handleRunVoiceClone = async () => {
    try {
      const response = await fetch("/api/voice/clone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test Voice",
          audioData: "dGVzdA==", // base64 encoded "test"
          mimeType: "audio/mp3",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to clone voice");
      }

      const data = await response.json();
      if (data.sampleUrl) {
        setOutput(data.sampleUrl);
      } else {
        throw new Error("No URL returned from voice clone API");
      }
    } catch (error) {
      console.error("Voice clone error:", error);
      alert("Failed to clone voice.");
      throw error;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Voice Cloning</h1>
      <p className="text-gray-600 mb-8">
        Create a custom AI voice clone and generate speech that sounds just like you.
      </p>

      <GuidedUnlockWizard
        featureId="voice_cloning"
        featureName="Voice Cloning"
        description="Create your personalized AI voice clone in minutes. Upload a 30-second audio sample and let our AI do the rest."
        onRunTrial={handleRunVoiceClone}
        trialOutputComponent={
          output ? (
            <div className="flex flex-col items-center">
              <p className="mb-4 text-sm font-medium text-gray-700">Your generated audio sample:</p>
              <audio controls className="w-full">
                <source src={output} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : null
        }
      />
    </div>
  );
}
