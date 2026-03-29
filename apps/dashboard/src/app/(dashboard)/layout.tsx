import React from 'react';
import Sidebar from '../../components/Sidebar';
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { ThemeToggle } from '@/components/ThemeToggle';
import PageTitle from '@/components/PageTitle';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const VALID_TIERS = ['FREE', 'STARTER', 'BASIC', 'PRO', 'BUSINESS', 'AGENCY'] as const;
  type UserTier = typeof VALID_TIERS[number];
  const rawPlan = ((user?.publicMetadata?.plan as string) || 'free').toUpperCase();
  const plan: UserTier = (VALID_TIERS as readonly string[]).includes(rawPlan)
    ? (rawPlan as UserTier)
    : 'FREE';

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
          <div className="flex-1 font-bold text-xl"><PageTitle /></div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground">
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
