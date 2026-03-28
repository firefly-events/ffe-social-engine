"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function SocialPage() {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const accounts = useQuery(api.socialAccounts.getSocialAccounts);
  const currentUser = useQuery(api.users.getCurrentUser);

  const hasConnectedZernio = !!currentUser?.zernioProfileId;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/social/connect', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to connect Zernio account');
      }
      // The API route now fetches accounts and returns them.
      // We could use this to optimistically update the UI, but for now
      // we'll rely on the `useQuery` to eventually reflect the new state.
      console.log('Zernio account connected successfully.');
    } catch (error) {
      console.error(error);
      // Here you would show an error to the user
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreatePost = async () => {
    if (selectedPlatforms.length === 0 || !content) {
      return;
    }
    setIsPosting(true);
    try {
      const response = await fetch('/api/social/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platforms: selectedPlatforms }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }
      setContent("");
      setSelectedPlatforms([]);
      // Show success message
    } catch (error) {
      console.error(error);
      // Show error message
    } finally {
      setIsPosting(false);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Social Posting</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Connect Your Accounts</h2>
        <button
          onClick={handleConnect}
          disabled={hasConnectedZernio || isConnecting}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
        >
          {isConnecting ? 'Connecting...' : hasConnectedZernio ? 'Zernio Connected' : 'Connect Zernio Account'}
        </button>
        {hasConnectedZernio && <p className="text-green-600 mt-2">Your Zernio profile is connected.</p>}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Connected Accounts</h2>
        {!accounts ? (
          <p>Loading...</p>
        ) : accounts.length === 0 ? (
          <p>No social accounts connected via Zernio yet.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <li key={account._id} className="p-4 border rounded-lg shadow-sm">
                <p className="font-semibold">{account.handle}</p>
                <p className="text-sm text-gray-500 capitalize">{account.platform}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Create a Post</h2>
        <div className="flex flex-col space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="p-2 border rounded w-full"
            rows={5}
            placeholder="What's on your mind?"
          />
          <div className="flex flex-wrap gap-2">
            {accounts?.map((account) => (
              <button
                key={account._id}
                onClick={() => handlePlatformToggle(account.platform)}
                className={`py-2 px-4 rounded-full text-sm font-medium ${
                  selectedPlatforms.includes(account.platform)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {account.handle} ({account.platform})
              </button>
            ))}
          </div>
          <button
            onClick={handleCreatePost}
            disabled={selectedPlatforms.length === 0 || !content || isPosting}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded self-start disabled:bg-gray-400"
          >
            {isPosting ? 'Posting...' : 'Post to Selected Accounts'}
          </button>
        </div>
      </div>
    </div>
  );
}
