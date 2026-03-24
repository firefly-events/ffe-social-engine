'use client';

import { useState } from 'react';

const PLATFORMS = [
  { id: 'twitter', name: 'Twitter / X', color: 'bg-black text-white' },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-600 text-white' },
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-600 text-white' },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-800 text-white' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-black text-white' },
];

export default function ConnectPage() {
  const [connected, setConnected] = useState<Record<string, boolean>>({
    twitter: false,
    linkedin: true, // mock initial state
  });

  const handleConnect = (id: string) => {
    // In a real app, this would redirect to OAuth flow via bundle.social or custom vault
    setConnected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Social Connections</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Connect your social accounts to enable one-click publishing.
        Connections are securely stored in our Token Vault.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map(platform => {
          const isConnected = connected[platform.id];
          
          return (
            <div 
              key={platform.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center text-center transition-all hover:shadow-md"
            >
              <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center text-2xl font-bold ${platform.color}`}>
                {platform.name.charAt(0)}
              </div>
              <h2 className="text-xl font-semibold mb-2 dark:text-white">{platform.name}</h2>
              
              {isConnected ? (
                <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-3 py-1 rounded-full mb-4">
                  Connected
                </div>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-3 py-1 rounded-full mb-4">
                  Not Connected
                </div>
              )}

              <button
                onClick={() => handleConnect(platform.id)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  isConnected 
                    ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/30 dark:hover:text-red-400' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isConnected ? 'Disconnect' : 'Connect Account'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
