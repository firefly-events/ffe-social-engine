'use client';

import { useState } from 'react';

const MOCK_ASSETS = [
  { id: '1', type: 'video', name: 'Summer Festival Teaser', status: 'ready', url: '#' },
  { id: '2', type: 'image', name: 'Speaker Announcement', status: 'ready', url: '#' },
];

export default function ExportPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("Get ready for the biggest event of the summer! Tickets drop this Friday. 🔥 #FireflyEvents #SummerFest");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (id: string) => {
    // In a real app, trigger actual download
    alert(`Starting download for asset ${id}`);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2 dark:text-white">Export Assets</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Review your generated content, download media, and copy captions for manual posting.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Generated Captions</h2>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4 text-gray-800 dark:text-gray-200">
            Get ready for the biggest event of the summer! Tickets drop this Friday. 🔥 #FireflyEvents #SummerFest
          </div>
          <button 
            onClick={handleCopy}
            className="w-full py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Media Assets</h2>
          <div className="space-y-4">
            {MOCK_ASSETS.map(asset => (
              <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded flex items-center justify-center text-white ${
                    asset.type === 'video' ? 'bg-purple-500' : 'bg-green-500'
                  }`}>
                    {asset.type === 'video' ? '🎬' : '📸'}
                  </div>
                  <div>
                    <p className="font-medium dark:text-white">{asset.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{asset.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(asset.id)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
