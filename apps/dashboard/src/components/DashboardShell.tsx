'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { UserButton } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/ThemeToggle';
import Sidebar from '@/components/Sidebar';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const dbUser = useQuery(api.users.getUser, user ? { clerkId: user.id } : 'skip');

  const userTier = (dbUser?.plan ?? 'free').toUpperCase();

  const usage = {
    captions: 3,
    captionLimit: 5,
    videos: 0,
    videoLimit: 1,
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar userTier={userTier} usage={usage} />

      <div className="flex-1 ml-60">
        <header className="h-16 bg-background border-b border-border flex items-center px-8 sticky top-0 z-50">
          <div className="flex-1 font-bold text-xl">Dashboard</div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground">
              {userTier} PLAN
            </span>
            <ThemeToggle />
            <UserButton />
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
