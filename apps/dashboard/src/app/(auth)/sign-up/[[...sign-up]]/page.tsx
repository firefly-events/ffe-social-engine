import { SignUp } from '@clerk/nextjs'
import { Check } from 'lucide-react'

export default function Page() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Panel: Marketing */}
      <div className="relative hidden lg:flex flex-col justify-between bg-zinc-950 p-12 text-white overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        
        <div className="relative flex items-center gap-2 text-xl font-bold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <span className="text-white text-xs">F</span>
          </div>
          Firefly Social
        </div>

        <div className="relative space-y-8 max-w-lg">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight xl:text-5xl leading-tight">
              Turn any content into social posts in seconds
            </h1>
            <p className="text-lg text-zinc-400">
              The all-in-one AI platform for content creators and brands to automate their social presence.
            </p>
          </div>

          <ul className="space-y-5">
            {[
              "AI-powered captions and hashtags optimized for reach",
              "Direct posting and scheduling to all major platforms",
              "Professional AI voice cloning and video composition",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-zinc-300">
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-violet-400 border border-violet-600/30">
                  <Check className="h-3 w-3" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-sm text-zinc-500">
          © {new Date().getFullYear()} Firefly Events Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Auth */}
      <div className="flex items-center justify-center p-8 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-600/20">
                <span className="text-white text-xl font-bold">F</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Firefly Social</h2>
          </div>
          <div className="flex justify-center">
            <SignUp />
          </div>
        </div>
      </div>
    </div>
  )
}
