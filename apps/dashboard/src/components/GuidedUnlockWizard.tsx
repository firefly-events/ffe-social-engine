"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";

interface GuidedUnlockWizardProps {
  featureId: string;
  featureName: string;
  description: string;
  onRunTrial: () => Promise<void>;
  trialOutputComponent?: React.ReactNode;
}

export function GuidedUnlockWizard({
  featureId,
  featureName,
  description,
  onRunTrial,
  trialOutputComponent,
}: GuidedUnlockWizardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const dbUser = useQuery(api.users.getUser, user ? { clerkId: user.id } : "skip");
  const markTrialUsed = useMutation(api.users.markFreeTrialUsed);

  const [step, setStep] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // If loading user data, show nothing
  if (!isLoaded || (user && dbUser === undefined)) return <div>Loading...</div>;

  // Determine if feature is unlocked via Clerk publicMetadata (source of truth)
  const clerkPlan = user?.publicMetadata?.plan as string | undefined;
  const isPro = clerkPlan !== undefined && clerkPlan !== "free";

  // Trial tracking is still stored in Convex
  const hasUsedTrial = dbUser?.usedFreeTrials?.includes(featureId);

  const canUseTrial = !isPro && !hasUsedTrial;
  const isLocked = !isPro && hasUsedTrial;

  if (isPro) {
    return <div>Feature is unlocked. You have pro access to {featureName}!</div>;
  }

  const handleStartTrial = () => {
    setStep(1);
  };

  const handleRunFeature = async () => {
    setIsProcessing(true);
    try {
      await onRunTrial();
      if (user) {
        await markTrialUsed({ clerkId: user.id, feature: featureId });
      }
      setStep(2);
    } catch (e) {
      console.error(e);
      alert("Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="border border-gray-200 p-6 rounded-lg bg-white shadow-sm max-w-2xl mx-auto mt-8">
      {isLocked && step === 0 && (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Upgrade to Unlock {featureName}</h2>
          <p className="text-gray-600 mb-6">
            You have already used your free trial for this feature. Upgrade to Pro to unlock unlimited access.
          </p>
          <button 
            onClick={() => router.push("/pricing")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            View Pricing
          </button>
        </div>
      )}

      {canUseTrial && step === 0 && (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-2">{featureName}</h2>
          <p className="text-gray-600 mb-6">{description}</p>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 inline-block">
            <span className="font-semibold">Try it free!</span> Use your 1 free generation.
          </div>
          <br/>
          <button 
            onClick={handleStartTrial}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Start Free Trial
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="py-4">
          <h3 className="text-xl font-bold mb-4">Step 1: Configure & Generate</h3>
          <p className="text-gray-600 mb-6">Provide the input to generate your free {featureName} sample.</p>
          
          <button 
            onClick={handleRunFeature}
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Generate Magic!"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="py-4">
          <h3 className="text-xl font-bold text-green-600 mb-4">✨ Wow! Here is your result.</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-8 border border-gray-200">
            {trialOutputComponent}
          </div>

          <div className="text-center bg-blue-50 p-6 rounded-lg">
            <h4 className="text-lg font-bold mb-2">Want to create more?</h4>
            <p className="text-gray-600 mb-4">Upgrade to our Pro plan to unlock unlimited {featureName}s.</p>
            <button 
              onClick={() => router.push("/pricing")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
