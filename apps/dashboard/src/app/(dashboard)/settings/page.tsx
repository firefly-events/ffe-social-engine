"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';

type ConfiguredKeys = {
  stripe: boolean;
  google: boolean;
  zernio: boolean;
};

export default function SettingsPage() {
  const { user: clerkUser } = useUser();
  const [configuredKeys, setConfiguredKeys] = useState<ConfiguredKeys | null>(null);

  const convexUser = useQuery(
    api.users.getCurrentUser, {}
  );

  const socialAccounts = useQuery(
    api.socialAccounts.getSocialAccounts, {}
  );

  const voiceClones = useQuery(
    api.voiceClones.get,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  useEffect(() => {
    fetch('/api/settings/keys')
      .then((res) => res.json())
      .then((data) => setConfiguredKeys(data));
  }, []);

  if (!clerkUser || !convexUser) {
    return <div className="text-foreground">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Settings</h1>

      {/* User Profile Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Profile</h2>
        <div className="flex items-center space-x-4">
          <img
            src={clerkUser.imageUrl}
            alt={clerkUser.fullName || 'User avatar'}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <p className="font-medium text-foreground">{clerkUser.fullName}</p>
            <p className="text-muted-foreground">{clerkUser.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
      </div>

      {/* Subscription Plan Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Subscription Plan</h2>
        <p className="text-foreground">Current Plan: <span className="font-semibold">{convexUser.plan}</span></p>
      </div>

      {/* Connected Social Accounts Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Connected Accounts</h2>
        {socialAccounts && socialAccounts.length > 0 ? (
          <ul>
            {socialAccounts.map((account: any) => (
              <li key={account._id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">{account.platform}</p>
                  <p className="text-sm text-muted-foreground">{account.handle}</p>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  onClick={async () => {
                    if (!window.confirm(`Disconnect ${account.platform}?`)) return;
                    try {
                      await fetch(`/api/social/disconnect/${account.platform}`, { method: 'DELETE' });
                      window.location.reload();
                    } catch (e) {
                      console.error('Disconnect failed:', e);
                    }
                  }}
                >Disconnect</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No social accounts connected.</p>
        )}
      </div>

      {/* Voice Clones Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Voice Clones</h2>
        {voiceClones && voiceClones.length > 0 ? (
          <ul>
            {voiceClones.map((clone) => (
              <li key={clone._id} className="py-2">
                <p className="font-medium text-foreground">{clone.name}</p>
                <p className="text-sm text-muted-foreground">Status: {clone.status}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No voice clones found.</p>
        )}
      </div>

      {/* API Keys Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Configured API Keys</h2>
        {configuredKeys ? (
          <ul>
            {Object.entries(configuredKeys).map(([key, value]) => (
              <li key={key} className="flex items-center justify-between py-2">
                <p className="font-medium capitalize text-foreground">{key}</p>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  value
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {value ? 'Configured' : 'Not Configured'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Loading configured keys...</p>
        )}
      </div>
    </div>
  );
}
