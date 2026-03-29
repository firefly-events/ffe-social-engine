'use client';

import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/create': 'Create Content',
  '/create/chat': 'AI Chat',
  '/content': 'Content Library',
  '/sessions': 'Sessions',
  '/preview': 'Preview',
  '/export': 'Export Assets',
  '/social': 'Social Posting',
  '/connect': 'Connect Accounts',
  '/workflows': 'Workflows',
  '/voice': 'Voice Studio',
  '/voices': 'Voice Clones',
  '/compose': 'Compose Video',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/onboard': 'Get Started',
  '/templates': 'Templates',
};

export default function PageTitle() {
  const pathname = usePathname();

  // Match exact path first, then try parent paths
  const title = PAGE_TITLES[pathname ?? '']
    || PAGE_TITLES[pathname?.split('/').slice(0, 2).join('/') ?? '']
    || PAGE_TITLES[pathname?.split('/').slice(0, 3).join('/') ?? '']
    || 'Dashboard';

  return <span>{title}</span>;
}
