import Link from 'next/link'

// ── ICON COMPONENTS ──────────────────────────────────────────────────────────

function IconChat() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function IconWizard() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

function IconPipeline() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="5" rx="1"/>
      <rect x="16" y="3" width="5" height="5" rx="1"/>
      <rect x="9.5" y="16" width="5" height="5" rx="1"/>
      <path d="M5.5 8v3a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V8"/>
      <path d="M12 12v4"/>
    </svg>
  )
}

function IconText() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
    </svg>
  )
}

function IconImage() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}

function IconVideo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  )
}

function IconGlobe() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}

function IconBarChart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  )
}

function IconZap() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}

// ── SHARED BUTTON CLASSES ─────────────────────────────────────────────────────

const btnPrimary =
  'inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white ' +
  'bg-gradient-to-br from-purple-500 to-cyan-500 border-none cursor-pointer no-underline ' +
  'shadow-[0_0_28px_rgba(139,92,246,0.35)] hover:opacity-90 hover:-translate-y-0.5 ' +
  'hover:shadow-[0_4px_40px_rgba(139,92,246,0.5)] transition-all'

const btnSecondary =
  'inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-slate-100 ' +
  'bg-white/[0.06] border border-white/10 cursor-pointer no-underline ' +
  'hover:bg-white/10 hover:border-white/[0.18] hover:-translate-y-0.5 transition-all'

const sectionLabel =
  'inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-widest uppercase ' +
  'border border-purple-500/35 bg-purple-500/10 text-purple-300 mb-5'

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-8 pt-28 pb-20 text-center">
        {/* Background blob */}
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15)_0%,rgba(6,182,212,0.08)_50%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center gap-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-purple-500/40 bg-purple-500/12 text-purple-300">
            <span>✦</span> AI-Powered Content Creation
          </div>

          <h1 className="text-5xl md:text-[4.2rem] font-extrabold tracking-tight leading-[1.1] text-slate-100">
            Your social media,<br />
            <span className="bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">
              on autopilot.
            </span>
            <br />
            <span className="text-slate-400 text-[0.85em] font-semibold">Powered by your voice.</span>
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
            Generate scroll-stopping content, clone your voice for videos, schedule to 14+ platforms,
            and watch your analytics soar — all from one AI-native workspace.
          </p>

          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="/sign-up" className={btnPrimary}>
              Get Started Free <IconArrowRight />
            </Link>
            <Link href="/pricing" className={btnSecondary}>
              See Pricing
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="flex">
              {[
                'bg-gradient-to-br from-purple-500 to-cyan-500',
                'bg-gradient-to-br from-amber-400 to-red-500',
                'bg-gradient-to-br from-emerald-400 to-cyan-500',
                'bg-gradient-to-br from-pink-500 to-purple-500',
              ].map((bg, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full border-2 border-slate-950 ${bg} flex items-center justify-center text-[10px] font-bold text-white ${i > 0 ? '-ml-2' : ''}`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            Joined by 12,000+ creators &nbsp;·&nbsp; No credit card required
          </div>

          {/* Demo Window */}
          <div className="w-full max-w-[760px] rounded-2xl bg-[#0f1221] border border-white/[0.07] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 px-4 py-3 bg-black/30 border-b border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-slate-500 font-medium">Social Engine — Chat Mode</span>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {/* User message */}
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-[13px] flex-shrink-0">Y</div>
                <div className="px-4 py-2.5 rounded-xl text-sm leading-relaxed max-w-[80%] bg-white/5 text-slate-300">
                  Write me 5 Instagram captions for our new coffee blend launch. Tone: warm and energetic. Include relevant hashtags.
                </div>
              </div>
              {/* AI response */}
              <div className="flex gap-3 items-start flex-row-reverse">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0">AI</div>
                <div className="px-4 py-2.5 rounded-xl text-sm leading-relaxed max-w-[80%] bg-purple-500/12 border border-purple-500/20 text-slate-300">
                  <div className="mb-3 font-semibold text-purple-300 text-xs">✦ Generated 5 captions</div>
                  <div>
                    <span className="text-slate-500 text-xs">Caption 1</span><br />
                    Morning just got an upgrade ☕✨ Introducing our new{' '}
                    <strong className="text-purple-300">Sunrise Blend</strong> — notes of vanilla, toasted oak,
                    and pure joy in every sip. Your ritual, reimagined.{' '}
                    <span className="text-sky-400">#MorningCoffee #NewBlend #CoffeeLovers</span>
                  </div>
                </div>
              </div>
              {/* User follow-up */}
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-[13px] flex-shrink-0">Y</div>
                <div className="px-4 py-2.5 rounded-xl text-sm leading-relaxed max-w-[80%] bg-white/5 text-slate-300">
                  Post caption 1 to Instagram and schedule caption 3 for tomorrow 9am.
                </div>
              </div>
              {/* AI typing */}
              <div className="flex gap-3 items-start flex-row-reverse">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0">AI</div>
                <div className="px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-4 pb-16 text-center">
        <div className="flex gap-12 flex-wrap justify-center">
          {[
            { number: '14+', label: 'Platforms Supported' },
            { number: '10M+', label: 'Posts Scheduled' },
            { number: '12K+', label: 'Active Creators' },
            { number: '4.9★', label: 'Average Rating' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">
                {s.number}
              </span>
              <span className="text-xs text-slate-500 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent max-w-5xl mx-auto" />

      {/* ── 3 UX MODES ── */}
      <section id="modes" className="py-20 px-8 max-w-6xl mx-auto">
        <div className={sectionLabel}>Three ways to create</div>
        <h2 className="text-4xl md:text-[2.8rem] font-bold tracking-tight leading-tight text-slate-100">
          Work the way{' '}
          <span className="bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">
            you think
          </span>
        </h2>
        <p className="mt-3 text-lg text-slate-400 leading-relaxed max-w-lg">
          Whether you prefer natural conversation, structured guidance, or visual automation — Social Engine adapts to your workflow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            {
              icon: <IconChat />,
              iconColor: 'text-purple-300',
              iconBg: 'bg-purple-500/15',
              title: 'Chat Mode',
              desc: 'Just describe what you want. "Write 3 TikTok hooks for my fitness coaching brand, then post the best one." AI handles everything else — writing, formatting, even publishing.',
              tag: 'Natural Language',
              tagColor: 'text-purple-300 bg-purple-500/12 border-purple-500/25',
            },
            {
              icon: <IconWizard />,
              iconColor: 'text-sky-300',
              iconBg: 'bg-cyan-500/15',
              title: 'Wizard Mode',
              desc: 'Step-by-step guided creation. Pick your platform, choose your goal, select your tone, and watch AI generate on-brand content with platform-optimized formatting.',
              tag: 'Guided Flow',
              tagColor: 'text-sky-300 bg-cyan-500/10 border-cyan-500/25',
            },
            {
              icon: <IconPipeline />,
              iconColor: 'text-violet-300',
              iconBg: 'bg-violet-500/15',
              title: 'Pipeline Mode',
              desc: 'Build visual automation DAGs. Define triggers, content nodes, approval gates, and distribution targets. Set it once — run it forever across all your channels.',
              tag: 'Visual DAG Builder',
              tagColor: 'text-violet-300 bg-violet-500/10 border-violet-500/25',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="relative p-8 rounded-2xl bg-[#0f1221] border border-white/[0.07] hover:border-purple-500/30 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all overflow-hidden group"
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.06),transparent_60%)]" />
              <div className={`w-13 h-13 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-5 relative`}>
                {card.icon}
              </div>
              <div className="text-lg font-bold text-slate-100 mb-2 relative">{card.title}</div>
              <div className="text-sm text-slate-400 leading-relaxed mb-4 relative">{card.desc}</div>
              <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase border ${card.tagColor}`}>
                {card.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent max-w-5xl mx-auto" />

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-8 max-w-6xl mx-auto">
        <div className={sectionLabel}>Everything you need</div>
        <h2 className="text-4xl md:text-[2.8rem] font-bold tracking-tight leading-tight text-slate-100">
          One platform,<br />
          <span className="bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">
            infinite content
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {[
            {
              icon: <IconText />,
              iconColor: 'text-purple-400',
              iconBg: 'bg-purple-500/12',
              title: 'AI Text Generation',
              desc: "GPT-4-powered captions, threads, scripts, and ad copy. Trained to match your brand voice and write for each platform's unique culture.",
            },
            {
              icon: <IconImage />,
              iconColor: 'text-cyan-400',
              iconBg: 'bg-cyan-500/12',
              title: 'AI Image Generation',
              desc: 'Generate scroll-stopping visuals from text prompts. Auto-sized for Stories, Reels, feed posts, LinkedIn banners, and more.',
            },
            {
              icon: <IconVideo />,
              iconColor: 'text-violet-400',
              iconBg: 'bg-violet-500/12',
              title: 'AI Video + Voice Cloning',
              desc: 'Turn scripts into polished videos with your cloned voice. No camera required. ElevenLabs-quality audio natively integrated.',
            },
            {
              icon: <IconGlobe />,
              iconColor: 'text-emerald-400',
              iconBg: 'bg-emerald-500/12',
              title: 'Multi-Platform Posting',
              desc: 'Publish to 14+ platforms simultaneously — Instagram, TikTok, YouTube, X, LinkedIn, Facebook, Pinterest, and more.',
            },
            {
              icon: <IconBarChart />,
              iconColor: 'text-amber-400',
              iconBg: 'bg-amber-500/12',
              title: 'Analytics Dashboard',
              desc: 'Unified cross-platform metrics. Engagement rates, follower growth, best posting times, and AI-powered content recommendations.',
            },
            {
              icon: <IconZap />,
              iconColor: 'text-red-400',
              iconBg: 'bg-red-500/12',
              title: 'Automation Workflows',
              desc: 'Set triggers and let content flow. Republish top performers, auto-respond to comments, drip campaigns, and evergreen scheduling.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-7 rounded-[14px] bg-[#0f1221] border border-white/[0.06] hover:border-purple-500/25 hover:bg-[#141828] hover:-translate-y-0.5 transition-all"
            >
              <div className={`w-11 h-11 rounded-[10px] ${f.iconBg} ${f.iconColor} flex items-center justify-center mb-4`}>
                {f.icon}
              </div>
              <div className="text-base font-bold text-slate-100 mb-1.5">{f.title}</div>
              <div className="text-sm text-slate-400 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent max-w-5xl mx-auto" />

      {/* ── PLATFORMS ── */}
      <section className="py-20 px-8 max-w-6xl mx-auto text-center">
        <div className={`${sectionLabel} mx-auto`}>14+ Platforms</div>
        <h2 className="text-4xl md:text-[2.8rem] font-bold tracking-tight text-slate-100">
          Post everywhere,{' '}
          <span className="bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">
            from one place
          </span>
        </h2>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          {[
            'Instagram', 'TikTok', 'YouTube Shorts', 'X / Twitter', 'LinkedIn',
            'Facebook', 'Pinterest', 'Threads', 'Snapchat', 'Reddit',
            'Mastodon', 'Bluesky', 'Tumblr', 'Telegram Channels',
          ].map((p) => (
            <span key={p} className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-slate-400 font-medium">
              {p}
            </span>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent max-w-5xl mx-auto" />

      {/* ── MARKET COMPARISON ── */}
      <section className="py-20 px-8 max-w-6xl mx-auto">
        <div className="flex justify-center">
          <div className="w-full rounded-3xl border border-white/[0.07] bg-gradient-to-br from-purple-500/[0.06] to-cyan-500/[0.04] px-12 py-16 flex flex-col items-center text-center gap-10">
            <div className={sectionLabel}>Replace your stack</div>
            <h2 className="text-4xl md:text-[2.8rem] font-bold tracking-tight text-slate-100">
              Stop paying{' '}
              <span className="bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">
                $229/mo
              </span>{' '}
              for five tools
            </h2>
            <p className="text-lg text-slate-400 max-w-lg">
              Social Engine replaces your entire content creation and distribution stack.
            </p>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              {[
                { name: 'Jasper AI', price: '$49/mo' },
                { name: 'Opus Clip', price: '$49/mo' },
                { name: 'ElevenLabs', price: '$22/mo' },
                { name: 'Buffer', price: '$18/mo' },
                { name: 'Zapier', price: '$91/mo' },
              ].map((tool, i, arr) => (
                <span key={tool.name} className="flex items-center gap-2">
                  <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/[0.08] text-sm text-slate-400">
                    {tool.name}{' '}
                    <span className="font-bold text-red-400">{tool.price}</span>
                  </span>
                  {i < arr.length - 1 && (
                    <span className="text-lg text-slate-600 font-medium">+</span>
                  )}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6 flex-wrap justify-center">
              <div className="flex flex-col items-center">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Your current stack</div>
                <div className="text-[2.5rem] font-extrabold text-slate-500 line-through decoration-red-400">$229/mo</div>
              </div>
              <div className="text-3xl text-slate-500">&rarr;</div>
              <div className="flex flex-col items-center">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Social Engine Pro</div>
                <div className="text-[3.5rem] font-extrabold bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent tracking-tight">
                  $29.99/mo
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
              <IconCheck />
              Save $199/mo — that&apos;s $2,388 a year back in your pocket
            </div>

            <Link href="/sign-up" className={btnPrimary}>
              Start Saving Today <IconArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent max-w-5xl mx-auto" />

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-8 max-w-6xl mx-auto">
        <div className={sectionLabel}>Social Proof</div>
        <h2 className="text-4xl md:text-[2.8rem] font-bold tracking-tight text-slate-100">
          Creators love{' '}
          <span className="bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">
            Social Engine
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
          {[
            {
              quote: 'I replaced Jasper, Buffer, AND my video editor. Social Engine does it all and my engagement is up 340% in 6 weeks.',
              name: 'Sarah K.',
              role: 'Fitness Creator · 280K followers',
              from: 'from-purple-500',
              to: 'to-cyan-500',
            },
            {
              quote: "The voice cloning is uncanny. My audience can't tell the difference — I'm posting daily videos without ever turning on a camera.",
              name: 'Marcus T.',
              role: 'E-commerce Brand · Shopify',
              from: 'from-cyan-500',
              to: 'to-sky-400',
            },
            {
              quote: 'Pipeline Mode is a game changer. I built a content system in 20 minutes that used to take our team a full day to run.',
              name: 'Priya M.',
              role: 'Growth Marketer · SaaS',
              from: 'from-violet-500',
              to: 'to-purple-400',
            },
          ].map((t) => (
            <div key={t.name} className="p-7 rounded-[14px] bg-[#0f1221] border border-white/[0.06]">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-[0.9rem]">★</span>
                ))}
              </div>
              <p className="text-[0.925rem] text-slate-300 leading-relaxed mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.from} ${t.to} flex items-center justify-center font-bold text-sm text-white flex-shrink-0`}>
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-100">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent max-w-5xl mx-auto" />

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-8 max-w-6xl mx-auto">
        <div className="relative rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/12 to-cyan-500/[0.06] px-12 py-20 text-center flex flex-col items-center gap-6 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[radial-gradient(ellipse,rgba(139,92,246,0.12)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className={sectionLabel}>Get Started</div>
            <h2 className="text-4xl md:text-[2.8rem] font-bold tracking-tight text-slate-100">
              Start creating for free.<br />
              <span className="bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">
                No credit card required.
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-lg">
              Join 12,000+ creators already using Social Engine to grow their audience on autopilot.
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <Link href="/sign-up" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[1.05rem] font-semibold text-white bg-gradient-to-br from-purple-500 to-cyan-500 shadow-[0_0_28px_rgba(139,92,246,0.3)] hover:opacity-90 hover:-translate-y-0.5 transition-all no-underline">
                Create Free Account <IconArrowRight />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[1.05rem] font-semibold text-slate-100 bg-white/[0.06] border border-white/10 hover:bg-white/10 hover:-translate-y-0.5 transition-all no-underline">
                View Pricing
              </Link>
            </div>
            <div className="flex items-center gap-6 flex-wrap justify-center mt-2">
              {['Free forever plan available', 'No credit card required', 'Cancel any time'].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-sm text-slate-400">
                  <span className="text-emerald-400"><IconCheck /></span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
