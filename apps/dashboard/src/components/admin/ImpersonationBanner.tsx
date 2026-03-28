'use client';

import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function ImpersonationBanner() {
  const impersonation = useQuery(api.admin.getImpersonation);
  const endImpersonation = useMutation(api.admin.endImpersonation);
  const router = useRouter();

  if (!impersonation) {
    return null;
  }

  const handleEndImpersonation = async () => {
    await endImpersonation();
    router.refresh(); // Refresh to update context
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white px-4 py-2 flex justify-between items-center text-sm font-medium shadow-lg border-b border-red-700">
      <div className="flex items-center gap-2">
        <span className="animate-pulse">●</span>
        <span>
          Viewing as <strong className="font-bold">{impersonation.userName}</strong> 
          <span className="mx-2 opacity-75">|</span>
          Plan: <span className="uppercase">{impersonation.userTier}</span>
        </span>
      </div>
      <button
        onClick={handleEndImpersonation}
        className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors border border-white/20"
      >
        <XCircle size={14} />
        Exit Impersonation
      </button>
    </div>
  );
}
