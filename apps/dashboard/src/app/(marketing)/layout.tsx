'use client'

import { useState } from 'react'
import { useAuth, useUser, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSignedIn } = useAuth()

  return (
    <div className="dark min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 flex items-center gap-8 px-8 h-16 bg-slate-950/85 border-b border-white/[0.07] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 no-underline">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-base shadow-[0_0_16px_rgba(139,92,246,0.5)]">
            S
          </div>
          <span className="text-[1.05rem] font-bold text-slate-100 tracking-tight">
            Social Engine
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          <Link href="/#features" className="px-3.5 py-2 rounded-lg text-[0.9rem] font-medium text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors no-underline">
            Features
          </Link>
          <Link href="/#modes" className="px-3.5 py-2 rounded-lg text-[0.9rem] font-medium text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors no-underline">
            How It Works
          </Link>
          <Link href="/pricing" className="px-3.5 py-2 rounded-lg text-[0.9rem] font-medium text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors no-underline">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-white/6 transition-colors bg-transparent border-none cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(139,92,246,0.3)] no-underline inline-flex items-center gap-1.5"
              >
                Get Started Free
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-white/6 transition-colors no-underline">
                Dashboard
              </Link>
              <UserButton signInUrl="/sign-in" />
            </>
          )}
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.07] px-8 py-10 flex flex-col items-center gap-4">
        <div className="flex gap-8 flex-wrap justify-center">
          {[
            { label: 'Privacy', href: '#' },
            { label: 'Terms', href: '#' },
            { label: 'Security', href: '#' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Contact', href: 'mailto:hello@socialengine.ai' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-slate-600 hover:text-slate-400 transition-colors no-underline"
            >
              {link.label}
            </a>
          ))}
        </div>
        <p className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Social Engine. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
