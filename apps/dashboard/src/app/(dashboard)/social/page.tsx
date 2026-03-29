"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

const platforms = [
  "TikTok",
  "Instagram",
  "X",
  "LinkedIn",
  "YouTube",
  "Facebook",
  "Threads",
  "Bluesky",
];

export default function SocialPage() {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isPosting, setIsPosting] =useState(false);

  const accounts = useQuery(api.socialAccounts.getSocialAccounts);
  const posts = useQuery(api.posts.getRecentPosts); // Assuming you have a `getRecentPosts` query

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handlePost = async () => {
    if (!content || selectedPlatforms.length === 0 || !user) return;
    setIsPosting(true);
    try {
      const response = await fetch("/api/social/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          platforms: selectedPlatforms,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to post to social media");
      }
      setContent("");
      setSelectedPlatforms([]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-background text-foreground">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Compose Post</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded bg-input text-foreground"
              rows={6}
              placeholder="What do you want to share?"
            />
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Select Platforms</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {platforms.map((platform) => (
                  <label
                    key={platform}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(platform)}
                      onChange={() => handlePlatformToggle(platform)}
                      className="form-checkbox h-5 w-5 text-primary rounded"
                    />
                    <span>{platform}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handlePost}
                disabled={isPosting || !content || selectedPlatforms.length === 0}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg disabled:bg-muted disabled:text-muted-foreground"
              >
                {isPosting ? "Posting..." : "Post Now"}
              </button>
            </div>
          </div>
          <div className="mt-8 bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
            <div className="space-y-4">
              {posts?.map((post) => (
                <div key={post._id} className="border p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm">
                    {new Date(post._creationTime).toLocaleString()}
                  </p>
                  <p className="mt-2">{post.content}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="bg-muted px-2 py-1 rounded-full text-xs"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {posts?.length === 0 && (
                <p className="text-muted-foreground">No recent posts found.</p>
              )}
              {!posts && <p>Loading recent posts...</p>}
            </div>
          </div>
        </div>
        <div>
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Connected Accounts</h2>
            <div className="space-y-4">
              {accounts?.map((account) => (
                <div
                  key={account._id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{account.handle}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {account.platform}
                    </p>
                  </div>
                </div>
              ))}
              {accounts?.length === 0 && (
                <p className="text-muted-foreground">
                  No social accounts connected.
                </p>
              )}
              {!accounts && <p>Loading accounts...</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
