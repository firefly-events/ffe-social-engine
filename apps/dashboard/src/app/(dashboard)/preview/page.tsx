'use client';

import { useState } from 'react';

const PREVIEW_DATA = {
  text: "We just announced our keynote speaker for SummerFest 2026. You don't want to miss this! 🌟 #FireflyEvents #SummerFest",
  image: "https://via.placeholder.com/600x400?text=SummerFest+Keynote",
};

export default function PreviewPage() {
  const [activeTab, setActiveTab] = useState<'twitter' | 'linkedin' | 'instagram'>('twitter');

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2 dark:text-white">Multi-Platform Preview</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        See how your generated content will look across different social networks.
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/4">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('twitter')}
              className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'twitter' 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              Twitter / X
            </button>
            <button
              onClick={() => setActiveTab('linkedin')}
              className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'linkedin' 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              LinkedIn
            </button>
            <button
              onClick={() => setActiveTab('instagram')}
              className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'instagram' 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              Instagram
            </button>
          </div>
        </div>

        <div className="w-full lg:w-3/4 flex justify-center bg-gray-50 dark:bg-gray-900 rounded-xl p-8 border border-gray-100 dark:border-gray-700 min-h-[500px]">
          {activeTab === 'twitter' && (
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-md p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                <div>
                  <p className="font-bold text-sm dark:text-white">Firefly Events</p>
                  <p className="text-gray-500 text-sm">@fireflyevents</p>
                </div>
              </div>
              <p className="text-[15px] mb-3 dark:text-gray-200">{PREVIEW_DATA.text}</p>
              <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PREVIEW_DATA.image} alt="Preview" className="w-full h-auto" />
              </div>
            </div>
          )}

          {activeTab === 'linkedin' && (
            <div className="bg-white dark:bg-white border border-gray-200 rounded-xl w-full max-w-md shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Firefly Events</p>
                    <p className="text-gray-500 text-xs">Event Management Platform</p>
                  </div>
                </div>
                <p className="text-[14px] text-gray-800 mb-3">{PREVIEW_DATA.text}</p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={PREVIEW_DATA.image} alt="Preview" className="w-full h-auto border-t border-gray-100" />
            </div>
          )}

          {activeTab === 'instagram' && (
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-sm shadow-sm overflow-hidden">
              <div className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-full p-[2px]">
                  <div className="w-full h-full bg-white dark:bg-black rounded-full border border-gray-200 dark:border-gray-800"></div>
                </div>
                <p className="font-bold text-sm dark:text-white">fireflyevents</p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={PREVIEW_DATA.image} alt="Preview" className="w-full aspect-square object-cover" />
              <div className="p-4">
                <div className="flex gap-4 mb-3">
                  <div className="w-6 h-6 border-2 border-black dark:border-white rounded-full"></div>
                  <div className="w-6 h-6 border-2 border-black dark:border-white rounded-full"></div>
                </div>
                <p className="text-sm dark:text-gray-200">
                  <span className="font-bold mr-2">fireflyevents</span>
                  {PREVIEW_DATA.text}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
