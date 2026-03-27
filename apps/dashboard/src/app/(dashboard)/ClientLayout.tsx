'use client'

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { UserButton } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = useQuery(api.users.getCurrentUser);
  const plan = (user?.plan || "FREE").toUpperCase();

  // We should ideally fetch the real usage here, but for now we'll pass stubs
  const usage = {
    captions: 3,
    captionLimit: 5,
    videos: 0,
    videoLimit: 1
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar userTier={plan} usage={usage} />

      <div className="flex-1 ml-60">
        <header className="h-16 bg-background border-b border-border flex items-center px-8 sticky top-0 z-50">
          <div className="flex-1 font-bold text-xl">Dashboard</div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground uppercase">
              {plan} PLAN
            </span>
            <ThemeToggle />
            <UserButton />
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
