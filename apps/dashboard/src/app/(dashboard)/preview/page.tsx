'use client';

import { useState, Suspense } from 'react';
import { useQuery } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '../../../../convex/_generated/api';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Id } from '../../../../convex/_generated/dataModel';

function PreviewPageContent() {
  const [activeTab, setActiveTab] = useState<'twitter' | 'linkedin' | 'instagram'>('twitter');
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const generationId = searchParams.get('id');

  const generationJob = useQuery(
    api.generationJobs.getGenerationJob,
    generationId ? { id: generationId as Id<'generationJobs'> } : 'skip'
  );

  // Fallback to latest job if no ID is provided
  const latestGenerationJobs = useQuery(
    api.generationJobs.list,
    user && !generationId ? { userId: user.id } : 'skip'
  );

  const isLoading = !isLoaded || (generationId && generationJob === undefined) || (!generationId && latestGenerationJobs === undefined);

  const latestJob = generationId ? generationJob : latestGenerationJobs?.[0];

  const PREVIEW_DATA = latestJob?.result
    ? {
        text: typeof latestJob.result === 'string' ? latestJob.result : latestJob.result.text,
        image: typeof latestJob.result === 'string' ? null : latestJob.result.imageUrl,
      }
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!PREVIEW_DATA) {
    return (
      <div className="max-w-5xl mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">Nothing to Preview Yet</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Once you generate some content, you'll be able to preview it here.
        </p>
        <Link href="/create" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
          Create Content
        </Link>
      </div>
    );
  }

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
          {activeTab === 'twitter' && PREVIEW_DATA.text && (
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-md p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                <div>
                  <p className="font-bold text-sm dark:text-white">Firefly Events</p>
                  <p className="text-gray-500 text-sm">@fireflyevents</p>
                </div>
              </div>
              <p className="text-[15px] mb-3 dark:text-gray-200">{PREVIEW_DATA.text}</p>
              {PREVIEW_DATA.image && (
                <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={PREVIEW_DATA.image} alt="Preview" className="w-full h-auto" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'linkedin' && PREVIEW_DATA.text && (
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
              {PREVIEW_DATA.image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={PREVIEW_DATA.image} alt="Preview" className="w-full h-auto border-t border-gray-100" />
              )}
            </div>
          )}

          {activeTab === 'instagram' && PREVIEW_DATA.text && (
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-sm shadow-sm overflow-hidden">
              <div className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-full p-[2px]">
                  <div className="w-full h-full bg-white dark:bg-black rounded-full border border-gray-200 dark:border-gray-800"></div>
                </div>
                <p className="font-bold text-sm dark:text-white">fireflyevents</p>
              </div>
              {PREVIEW_DATA.image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={PREVIEW_DATA.image} alt="Preview" className="w-full aspect-square object-cover" />
              )}
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

      {/* Action buttons */}
      <div className="flex gap-4 mt-8 justify-center">
        <Link href="/social" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
          Post to Social
        </Link>
        <Link href="/export" className="px-6 py-3 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium border border-gray-200 dark:border-gray-700">
          Export Content
        </Link>
        <button
          onClick={() => {
            if (PREVIEW_DATA?.text) {
              navigator.clipboard.writeText(PREVIEW_DATA.text);
            }
          }}
          className="px-6 py-3 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium border border-gray-200 dark:border-gray-700"
        >
          Copy Text
        </button>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="text-2xl">Loading...</div></div>}>
      <PreviewPageContent />
    </Suspense>
  );
}
