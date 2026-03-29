'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@convex/_generated/api';
import type { OAuthProvider } from '../../../lib/oauth/providers';
<<<<<<< HEAD
import { track } from '@/lib/posthog';
import { SE_EVENTS } from '@/lib/posthog-events';
=======
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics';
>>>>>>> 6ba5dca (feat(FIR-1224): instrument all CTAs and key actions with PostHog tracking)

interface PlatformMeta {
  id: OAuthProvider;
  name: string;
  color: string;
}

const PLATFORMS: PlatformMeta[] = [
  { id: 'twitter',   name: 'Twitter / X', color: 'bg-black text-white' },
  { id: 'linkedin',  name: 'LinkedIn',    color: 'bg-blue-600 text-white' },
  { id: 'instagram', name: 'Instagram',   color: 'bg-pink-600 text-white' },
  { id: 'tiktok',    name: 'TikTok',      color: 'bg-gray-900 text-white' },
  { id: 'youtube',   name: 'YouTube',     color: 'bg-red-600 text-white' },
];

export default function ConnectPage() {
  return (
    <Suspense fallback={null}>
      <ConnectPageInner />
    </Suspense>
  );
}

function ConnectPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();

  // ── Real data from Convex ────────────────────────────────────────────────
  const socialAccounts = useQuery(api.socialAccounts.getSocialAccounts);
  const isLoading = socialAccounts === undefined;

  // Map platform → account record for quick O(1) lookup
  const accountsByPlatform = (socialAccounts ?? []).reduce<
    Record<string, (typeof socialAccounts)[number]>
  >((acc, account) => {
    acc[account.platform] = account;
    return acc;
  }, {});

  // ── Success / error banner ───────────────────────────────────────────────
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected) {
      const platformName =
        PLATFORMS.find((p) => p.id === connected)?.name ?? connected;
      setBanner({ type: 'success', message: `${platformName} connected successfully!` });
<<<<<<< HEAD

      if (user?.id) {
        track(SE_EVENTS.PLATFORM_CONNECTED, {
          user_id: user.id,
          platform: connected,
        });
      }

=======
      trackEvent(ANALYTICS_EVENTS.SOCIAL_CONNECTED, {
        platform_id: connected,
        source: 'oauth_callback',
      })
>>>>>>> 6ba5dca (feat(FIR-1224): instrument all CTAs and key actions with PostHog tracking)
      router.replace('/connect');
    } else if (error) {
      setBanner({ type: 'error', message: error });
      router.replace('/connect');
    }
  }, [searchParams, router, user?.id]);

  // ── Connect (redirect to OAuth initiation) ───────────────────────────────
  const handleConnect = useCallback((platformId: OAuthProvider) => {
    trackEvent(ANALYTICS_EVENTS.CONNECT_ACCOUNT_CLICK, {
      platform_id: platformId,
      source: 'connect_page',
    })
    window.location.href = `/api/auth/${platformId}`;
  }, []);

  // ── Disconnect ───────────────────────────────────────────────────────────
  const [disconnecting, setDisconnecting] = useState<OAuthProvider | null>(null);

  const handleDisconnect = useCallback(
    async (platformId: OAuthProvider) => {
      setDisconnecting(platformId);
      try {
        const res = await fetch(`/api/auth/${platformId}/disconnect`, {
          method: 'POST',
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? `Disconnect failed (${res.status})`);
        }

        setBanner({ type: 'success', message: `Disconnected successfully.` });
<<<<<<< HEAD

        if (user?.id) {
          track(SE_EVENTS.PLATFORM_DISCONNECTED, {
            user_id: user.id,
            platform: platformId,
          });
        }
=======
        trackEvent(ANALYTICS_EVENTS.SOCIAL_DISCONNECTED, {
          platform_id: platformId,
          source: 'connect_page',
        })
>>>>>>> 6ba5dca (feat(FIR-1224): instrument all CTAs and key actions with PostHog tracking)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Disconnect failed';
        setBanner({ type: 'error', message });
      } finally {
        setDisconnecting(null);
      }
    },
    [user?.id]
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Social Connections</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Connect your social accounts to enable one-click publishing.
        Connections are securely encrypted and stored in our Token Vault.
      </p>

      {/* Banner */}
      {banner && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between ${
            banner.type === 'success'
              ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
              : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
          }`}
        >
          <span>{banner.message}</span>
          <button
            onClick={() => setBanner(null)}
            className="ml-4 text-current opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((platform) => (
            <div
              key={platform.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-pulse"
            >
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2" />
              <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-1/2 mx-auto mb-4" />
              <div className="h-9 bg-gray-100 dark:bg-gray-600 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Platform cards */}
      {!isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((platform) => {
            const account = accountsByPlatform[platform.id];
            const isConnected = Boolean(account);
            const isDisconnecting = disconnecting === platform.id;

            return (
              <div
                key={platform.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center text-center transition-all hover:shadow-md"
              >
                {/* Platform icon (first letter) */}
                <div
                  className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center text-2xl font-bold ${platform.color}`}
                >
                  {platform.name.charAt(0)}
                </div>

                <h2 className="text-xl font-semibold mb-1 dark:text-white">
                  {platform.name}
                </h2>

                {/* Handle or status badge */}
                {isConnected && account?.handle ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {account.handle}
                  </p>
                ) : null}

                <div
                  className={`text-xs px-3 py-1 rounded-full mb-4 ${
                    isConnected
                      ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                      : 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {isConnected ? 'Connected' : 'Not Connected'}
                </div>

                {/* Action button */}
                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(platform.id)}
                    disabled={isDisconnecting}
                    className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/30 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id)}
                    className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Connect Account
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
