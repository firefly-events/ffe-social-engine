"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function GeneratePage() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!content || content.length < 10) {
      setError("Please enter at least 10 characters.")
      return
    }

    if (content.length > 10000) {
      setError("Content must be less than 10,000 characters.")
      return
    }

    setLoading(true)
    setError(null)
    setJobId(null)

    try {
      const response = await fetch("/api/generate/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to start generation job.")
      }

      const data = await response.json()
      setJobId(data.jobId)
    } catch (err: any) {
      setError(err.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Generate AI Content</h1>
        <p className="mt-1 text-muted-foreground">Describe what you want to create and let our AI do the rest.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!jobId ? (
            <>
              <div className="flex flex-col gap-2">
                <label htmlFor="content" className="text-sm font-medium">
                  What is your post or video about?
                </label>
                <textarea
                  id="content"
                  className="w-full min-h-[200px] p-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                  placeholder="e.g. A 30-second TikTok about the benefits of using AI for social media management. Focus on time savings and engagement."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={loading}
                />
                {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                <p className="text-xs text-muted-foreground">
                  Min 10 characters. Max 10,000 characters.
                </p>
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={loading} 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-11"
              >
                {loading ? "Processing..." : "Generate Content"}
              </Button>
            </>
          ) : (
            <div className="py-8 space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-600">Job started!</h3>
                <p className="text-muted-foreground mt-1">ID: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{jobId}</code></p>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Your content is being generated in the background. It will appear in your dashboard once ready.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Back to Dashboard
                </Button>
                <Button onClick={() => { setJobId(null); setContent(""); }} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Start Another
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
