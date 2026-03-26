'use client'

import { PricingTable } from '@clerk/nextjs'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-zinc-400">
            Choose the plan that fits your workflow. Upgrade or downgrade at any time.
          </p>
        </div>
        <PricingTable />
      </div>
    </div>
  )
}
