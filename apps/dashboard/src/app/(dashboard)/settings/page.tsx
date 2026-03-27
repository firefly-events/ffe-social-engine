'use client';

import { useUser, UserProfile } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useState, useCallback } from 'react';

export default function SettingsPage() {
  const { user } = useUser();
  const socialAccounts = useQuery(api.socialAccounts.getSocialAccounts);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const plan = (user?.publicMetadata?.plan as string) ?? 'free';

  const handleDisconnect = useCallback(async (platform: string) => {
    setDisconnecting(platform);
    try {
      const res = await fetch(`/api/auth/${platform}/disconnect`, { method: 'POST' });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Disconnect failed (${res.status})`);
      }
      setBanner({ type: 'success', message: `${platform} disconnected successfully.` });
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Disconnect failed';
      setBanner({ type: 'error', message });
    } finally {
      setDisconnecting(null);
    }
  }, []);

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '2rem' }}>Settings</h1>

      {banner && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: banner.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: banner.type === 'success' ? '#166534' : '#991b1b',
          }}
        >
          <span>{banner.message}</span>
          <button
            onClick={() => setBanner(null)}
            style={{ marginLeft: '1rem', opacity: 0.6, cursor: 'pointer', background: 'none', border: 'none', fontSize: '1rem' }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Section 1: Profile */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Profile</h2>
        <UserProfile />
      </section>

      {/* Section 2: Billing */}
      <section
        style={{
          marginBottom: '2.5rem',
          background: '#1a1a2e',
          borderRadius: '0.75rem',
          padding: '1.5rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#f1f5f9' }}>
          Billing
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Current plan</p>
            <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f1f5f9', textTransform: 'capitalize' }}>
              {plan}
            </p>
          </div>
          <a
            href="/pricing"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1.25rem',
              background: '#7c3aed',
              color: '#fff',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            Manage Subscription
          </a>
        </div>
      </section>

      {/* Section 3: Connected Accounts */}
      <section
        style={{
          background: '#1a1a2e',
          borderRadius: '0.75rem',
          padding: '1.5rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#f1f5f9' }}>
          Connected Accounts
        </h2>

        {socialAccounts === undefined && (
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading accounts…</p>
        )}

        {socialAccounts !== undefined && socialAccounts.length === 0 && (
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            No social accounts connected.{' '}
            <a href="/connect" style={{ color: '#818cf8', textDecoration: 'underline' }}>
              Connect one now
            </a>
            .
          </p>
        )}

        {socialAccounts !== undefined && socialAccounts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {socialAccounts.map((account) => {
              const isDisconnecting = disconnecting === account.platform;
              const connectedDate = new Date(account.connectedAt).toLocaleDateString();
              return (
                <div
                  key={account._id}
                  style={{
                    background: '#16213e',
                    borderRadius: '0.5rem',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontWeight: 600,
                        color: '#f1f5f9',
                        fontSize: '0.9375rem',
                        textTransform: 'capitalize',
                        marginBottom: '0.125rem',
                      }}
                    >
                      {account.platform}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                      {account.handle} &middot; Connected {connectedDate}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDisconnect(account.platform)}
                    disabled={isDisconnecting}
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: isDisconnecting ? 'not-allowed' : 'pointer',
                      opacity: isDisconnecting ? 0.5 : 1,
                      background: 'transparent',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                    }}
                  >
                    {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
