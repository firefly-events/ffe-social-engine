'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import UsageMeter from './UsageMeter';

const navSections = [
  {
    title: 'Create',
    items: [
      { label: 'Chat Mode', href: '/create/chat', icon: '💬' },
      { label: 'Walkthrough', href: '/create', icon: '✨' },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Library', href: '/content', icon: '📁' },
      { label: 'Sessions', href: '/sessions', icon: '📋' },
      { label: 'Preview', href: '/preview', icon: '👁️' },
      { label: 'Export', href: '/export', icon: '📤' },
    ],
  },
  {
    title: 'Distribute',
    items: [
      { label: 'Social Posting', href: '/social', icon: '📱' },
      { label: 'Workflows', href: '/workflows', icon: '🔄' },
    ],
  },
  {
    title: 'Studio',
    items: [
      { label: 'Voice Studio', href: '/voice', icon: '🎙️' },
      { label: 'Compose Video', href: '/compose', icon: '🎬' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Analytics', href: '/analytics', icon: '📈' },
      { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    ],
  },
];

export default function Sidebar({ userTier = 'FREE', usage = {} }: any) {
  const pathname = usePathname();

  return (
    <div className="w-60 h-screen bg-slate-900 border-r border-white/[0.07] text-slate-100 p-4 flex flex-col fixed left-0 top-0 z-40">
      <div className="px-2 mb-6">
        <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2 no-underline text-slate-100 hover:opacity-90">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-base shadow-[0_0_16px_rgba(139,92,246,0.5)]">
            S
          </div>
          <span className="tracking-tight">SocialEngine</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="mb-3">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/create' && pathname?.startsWith(item.href + '/'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
                    isActive
                      ? 'bg-indigo-600/80 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/[0.07]">
        <div className="mb-3">
          <UsageMeter label="AI Captions" used={usage.captions || 0} limit={usage.captionLimit || 5} />
          <UsageMeter label="Video Gen" used={usage.videos || 0} limit={usage.videoLimit || 1} />
        </div>

        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
            pathname === '/settings'
              ? 'bg-indigo-600/80 text-white'
              : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
          }`}
        >
          <span>⚙️</span>
          <span>Settings</span>
        </Link>

        <div className="mt-2 p-3 bg-white/5 rounded-xl border border-white/[0.07] text-center">
          {userTier === 'FREE' ? (
            <>
              <p className="text-xs text-slate-400 mb-2">Upgrade for more features</p>
              <Link
                href="/pricing"
                className="block py-2 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 transition-opacity no-underline shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                Upgrade Now
              </Link>
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
