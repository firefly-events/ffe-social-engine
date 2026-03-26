import TierBadge from './TierBadge';
import UsageMeter from './UsageMeter';

export default function Sidebar({ userTier = 'FREE', usage = {} }: any) {
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊', minTier: 'FREE' },
    { label: 'Create', href: '/create', icon: '✨', minTier: 'FREE' },
    { label: 'Content Library', href: '/library', icon: '📁', minTier: 'FREE' },
    { label: 'Schedule', href: '/schedule', icon: '📅', minTier: 'BASIC' },
    { label: 'Analytics', href: '/analytics', icon: '📈', minTier: 'PRO' },
    { label: 'Automations', href: '/automations', icon: '🤖', minTier: 'PRO' },
    { label: 'Voice Studio', href: '/voices', icon: '🎙️', minTier: 'PRO' },
    { label: 'Settings', href: '/settings', icon: '⚙️', minTier: 'FREE' }
  ];

  const tiers = ['FREE', 'STARTER', 'BASIC', 'PRO', 'BUSINESS', 'AGENCY'];
  const userTierIndex = tiers.indexOf(userTier);

  return (
    <div className="w-60 h-screen bg-slate-900 border-r border-white/[0.07] text-slate-100 p-6 flex flex-col fixed left-0 top-0">
      <div className="text-xl font-bold mb-10 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-base shadow-[0_0_16px_rgba(139,92,246,0.5)]">
          S
        </div>
        <span className="text-slate-100 tracking-tight">SocialEngine</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(item => {
          const isLocked = tiers.indexOf(item.minTier) > userTierIndex;
          return (
            <a
              key={item.label}
              href={isLocked ? '#' : item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm no-underline transition-colors ${
                isLocked
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 cursor-pointer'
              }`}
            >
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {isLocked && <TierBadge tier={item.minTier} />}
            </a>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/[0.07]">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Usage</h4>
        <UsageMeter label="AI Captions" used={usage.captions || 0} limit={usage.captionLimit || 5} />
        <UsageMeter label="Video Gen" used={usage.videos || 0} limit={usage.videoLimit || 1} />

        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/[0.07] text-center">
          {userTier === 'FREE' ? (
            <>
              <p className="text-xs text-slate-400 mb-3">Upgrade for more features</p>
              <a
                href="/pricing"
                className="block py-2 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 transition-opacity no-underline shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                Upgrade Now
              </a>
            </>
          ) : (
            <div className="text-sm text-slate-400">
              Plan: <strong className="text-slate-100">{userTier}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
