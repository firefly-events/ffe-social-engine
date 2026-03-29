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
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* User Profile Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <div className="flex items-center space-x-4">
          <img
            src={clerkUser.imageUrl}
            alt={clerkUser.fullName || 'User avatar'}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <p className="font-medium">{clerkUser.fullName}</p>
            <p className="text-gray-500">{clerkUser.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
      </div>

      {/* Subscription Plan Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Subscription Plan</h2>
        <p>Current Plan: <span className="font-semibold">{convexUser.plan}</span></p>
      </div>

      {/* Connected Social Accounts Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
        {socialAccounts && socialAccounts.length > 0 ? (
          <ul>
            {socialAccounts.map((account: any) => (
              <li key={account._id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{account.platform}</p>
                  <p className="text-sm text-gray-500">{account.handle}</p>
                </div>
                <button className="text-red-500">Disconnect</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No social accounts connected.</p>
        )}
      </div>

      {/* Voice Clones Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Voice Clones</h2>
        {voiceClones && voiceClones.length > 0 ? (
          <ul>
            {voiceClones.map((clone) => (
              <li key={clone._id} className="py-2">
                <p className="font-medium">{clone.name}</p>
                <p className="text-sm text-gray-500">Status: {clone.status}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No voice clones found.</p>
        )}
      </div>

      {/* API Keys Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Configured API Keys</h2>
        {configuredKeys ? (
          <ul>
            {Object.entries(configuredKeys).map(([key, value]) => (
              <li key={key} className="flex items-center justify-between py-2">
                <p className="font-medium capitalize">{key}</p>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {value ? 'Configured' : 'Not Configured'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading configured keys...</p>
        )}
      </div>
    </div>
  );
}
