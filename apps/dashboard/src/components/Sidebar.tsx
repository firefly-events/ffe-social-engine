import UsageMeter from './UsageMeter';
import Link from 'next/link';

interface SidebarProps {
  userTier?: string;
  usage?: Record<string, number>;
}

export default function Sidebar({ userTier = 'FREE', usage = {} }: SidebarProps) {
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊', minTier: 'FREE' },
    { label: 'Create', href: '/create', icon: '✨', minTier: 'FREE' },
    { label: 'Compose', href: '/compose', icon: '🎬', minTier: 'FREE' },
    { label: 'Content Library', href: '/content', icon: '📁', minTier: 'FREE' },
    { label: 'Schedule', href: '/schedule', icon: '📅', minTier: 'BASIC' },
    { label: 'Analytics', href: '/analytics', icon: '📈', minTier: 'PRO' },
    { label: 'Automations', href: '/automations', icon: '🤖', minTier: 'PRO' },
    { label: 'Voice Studio', href: '/voices', icon: '🎙️', minTier: 'PRO' },
    { label: 'Settings', href: '/settings', icon: '⚙️', minTier: 'FREE' }
  ];

  const tiers = ['FREE', 'STARTER', 'BASIC', 'PRO', 'BUSINESS', 'AGENCY'];
  const userTierIndex = tiers.indexOf(userTier);

  return (
    <div className="w-60 h-screen bg-card text-card-foreground flex flex-col p-6 fixed left-0 top-0 border-r border-border">
      <div className="text-2xl font-bold mb-10 flex items-center gap-2">
        🚀 SocialEngine
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(item => {
          const isLocked = tiers.indexOf(item.minTier) > userTierIndex;
          return isLocked ? (
              <span
                key={item.label}
                aria-disabled="true"
                tabIndex={-1}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm no-underline transition-colors text-muted-foreground cursor-not-allowed"
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {item.minTier}
                </span>
              </span>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm no-underline transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
              </Link>
            );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Usage</h4>
        <UsageMeter label="AI Captions" used={usage.captions || 0} limit={usage.captionLimit || 5} />
        <UsageMeter label="Video Gen" used={usage.videos || 0} limit={usage.videoLimit || 1} />

        <div className="mt-6 p-4 bg-muted rounded-lg text-center">
          {userTier === 'FREE' ? (
            <>
              <p className="text-xs text-muted-foreground mb-3">Upgrade for more features</p>
              <Link
                href="/pricing"
                className="block py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-bold no-underline transition-colors"
              >
                Upgrade Now
              </Link>
            </>
          ) : (
            <div className="text-sm">
              <span className="text-muted-foreground">Plan:</span>{' '}
              <strong className="text-foreground">{userTier}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
