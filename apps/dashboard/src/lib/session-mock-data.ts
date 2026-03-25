import type { ContentSession, ContentNode } from './session-types'

// Helper to produce deterministic dates relative to "now"
function daysAgo(n: number): Date {
  const d = new Date('2026-03-24T12:00:00Z')
  d.setDate(d.getDate() - n)
  return d
}

// ─── Session 1 ────────────────────────────────────────────────────────────────
// SXSW announcement — main trunk + two Instagram variations + a LinkedIn fork
const sxswRoot: ContentNode = {
  id: 'n1-root',
  parentId: null,
  isTrunk: true,
  status: 'posted',
  content: {
    text: "The wait is over. Firefly Events is officially at SXSW 2026 — and we're bringing the most electrifying lineup Austin has ever seen. Tickets on sale now. 🔥 #SXSW #FireflyEvents",
  },
  metadata: {
    aiModel: 'GPT-4o',
    prompt: 'Announce Firefly Events at SXSW 2026 with excitement and urgency',
    platform: 'Instagram',
    generatedAt: daysAgo(6),
  },
  children: [],
}

const sxswV2: ContentNode = {
  id: 'n1-v2',
  parentId: 'n1-root',
  isTrunk: true,
  status: 'posted',
  content: {
    text: "Austin, we're coming for you. Firefly Events × SXSW 2026 — over 50 artists across 3 stages. Grab your wristband before they're gone. Link in bio. 🎶",
  },
  metadata: {
    aiModel: 'GPT-4o',
    prompt: 'More specific version — mention artists count and stages',
    platform: 'Instagram',
    generatedAt: daysAgo(5),
  },
  children: [],
}

const sxswBranch1: ContentNode = {
  id: 'n1-branch1',
  parentId: 'n1-root',
  isTrunk: false,
  status: 'archived',
  content: {
    text: 'POV: You just got the SXSW announcement you deserved. Firefly Events is in Austin this March — and the lineup is genuinely unreal. No hype, just facts. 👀 #SXSW2026',
  },
  metadata: {
    aiModel: 'Claude 3.5 Sonnet',
    prompt: 'Try a POV / Gen-Z voice for the same announcement',
    platform: 'TikTok',
    generatedAt: daysAgo(5),
  },
  children: [],
}

const sxswLinkedIn: ContentNode = {
  id: 'n1-linkedin',
  parentId: 'n1-v2',
  isTrunk: false,
  status: 'approved',
  content: {
    text: "Proud to announce that Firefly Events will be present at SXSW 2026 in Austin, TX. This milestone represents our largest event programming to date — 50+ artists, 3 stages, and thousands of attendees. We'd love to connect with fellow event professionals in Austin. Drop a comment if you'll be there.",
  },
  metadata: {
    aiModel: 'GPT-4o',
    prompt: 'Rewrite for LinkedIn professional audience — drop the hype, add substance',
    platform: 'LinkedIn',
    generatedAt: daysAgo(4),
  },
  children: [],
}

sxswRoot.children = [sxswV2, sxswBranch1]
sxswV2.children = [sxswLinkedIn]

export const SESSION_SXSW: ContentSession = {
  id: 's1',
  title: 'SXSW 2026 Announcement',
  createdAt: daysAgo(6),
  updatedAt: daysAgo(4),
  platforms: ['Instagram', 'TikTok', 'LinkedIn'],
  rootNode: sxswRoot,
}

// ─── Session 2 ────────────────────────────────────────────────────────────────
// Artist spotlight — clean linear trunk with one Twitter branch
const artistRoot: ContentNode = {
  id: 'n2-root',
  parentId: null,
  isTrunk: true,
  status: 'posted',
  content: {
    text: "Introducing the headliner you didn't know you needed. @NovaPulse takes the main stage Friday at 9 PM — and trust us, you don't want to miss this. 🎧 Tickets still available at the link. #FireflyFest",
  },
  metadata: {
    aiModel: 'GPT-4o',
    prompt: 'Artist spotlight post for Nova Pulse headlining Friday night',
    platform: 'Instagram',
    generatedAt: daysAgo(3),
  },
  children: [],
}

const artistTwitter: ContentNode = {
  id: 'n2-twitter',
  parentId: 'n2-root',
  isTrunk: false,
  status: 'draft',
  content: {
    text: 'Nova Pulse. Main stage. Friday 9 PM. That is all. 🔥 @FireflyEvents #FireflyFest',
  },
  metadata: {
    aiModel: 'Claude 3.5 Sonnet',
    prompt: 'Twitter/X version — short, punchy, under 280 chars',
    platform: 'Twitter',
    generatedAt: daysAgo(2),
  },
  children: [],
}

const artistV2: ContentNode = {
  id: 'n2-v2',
  parentId: 'n2-root',
  isTrunk: true,
  status: 'approved',
  content: {
    text: "Nova Pulse doesn't just perform — they transform. Friday night at Firefly Fest 2026, the main stage becomes something else entirely. 8:45 PM doors. 9 PM showtime. Limited GA still available. 🎶",
  },
  metadata: {
    aiModel: 'Gemini 1.5 Pro',
    prompt: 'More evocative language, build atmosphere around the performance',
    platform: 'Instagram',
    generatedAt: daysAgo(2),
  },
  children: [],
}

artistRoot.children = [artistTwitter, artistV2]

export const SESSION_ARTIST: ContentSession = {
  id: 's2',
  title: 'Nova Pulse Headliner Spotlight',
  createdAt: daysAgo(3),
  updatedAt: daysAgo(2),
  platforms: ['Instagram', 'Twitter'],
  rootNode: artistRoot,
}

// ─── Session 3 ────────────────────────────────────────────────────────────────
// Behind-the-scenes campaign — single trunk, three platform branches
const btsRoot: ContentNode = {
  id: 'n3-root',
  parentId: null,
  isTrunk: true,
  status: 'approved',
  content: {
    text: "48 hours out. Here's what a 200-person setup crew looks like from above. Every cable. Every stage truss. Every light rig — accounted for. See you Friday. 📸 #BTS #FireflyFest2026",
  },
  metadata: {
    aiModel: 'Claude 3.5 Sonnet',
    prompt: 'Behind-the-scenes setup post, 48hr countdown, convey scale and precision',
    platform: 'Instagram',
    generatedAt: daysAgo(1),
  },
  children: [],
}

const btsLinkedIn: ContentNode = {
  id: 'n3-linkedin',
  parentId: 'n3-root',
  isTrunk: false,
  status: 'draft',
  content: {
    text: "T-minus 48 hours. Here's a look at the operational scale behind Firefly Fest 2026: 200+ crew members, 12 stages, 40,000 sq ft of rigging, and counting. Event production at this level is a logistics problem as much as a creative one. Happy to talk shop with any production pros in Austin this week.",
  },
  metadata: {
    aiModel: 'Claude 3.5 Sonnet',
    prompt: 'LinkedIn version — lean into the operations / logistics angle for professionals',
    platform: 'LinkedIn',
    generatedAt: daysAgo(1),
  },
  children: [],
}

const btsTikTok: ContentNode = {
  id: 'n3-tiktok',
  parentId: 'n3-root',
  isTrunk: false,
  status: 'draft',
  content: {
    text: "POV: You're 48 hours from showtime and the stage isn't even fully built yet 😅 This is what the Firefly Fest setup looks like from the inside. Don't worry — we've done this before. See you Friday 🎶 #BehindTheScenes #EventLife #FireflyFest",
  },
  metadata: {
    aiModel: 'GPT-4o',
    prompt: 'TikTok voice — anxiety + humor + reassurance, POV format',
    platform: 'TikTok',
    generatedAt: daysAgo(1),
  },
  children: [],
}

btsRoot.children = [btsLinkedIn, btsTikTok]

export const SESSION_BTS: ContentSession = {
  id: 's3',
  title: 'Behind the Scenes — 48hr Countdown',
  createdAt: daysAgo(1),
  updatedAt: daysAgo(1),
  platforms: ['Instagram', 'LinkedIn', 'TikTok'],
  rootNode: btsRoot,
}

// ─── Session 4 ────────────────────────────────────────────────────────────────
// Post-event recap — just started, work in progress
const recapRoot: ContentNode = {
  id: 'n4-root',
  parentId: null,
  isTrunk: true,
  status: 'draft',
  content: {
    text: "That's a wrap on Firefly Fest 2026. 40,000 people. 50 artists. 3 unforgettable nights. We'll be processing this one for a while. Thank you Austin. 🧡 #FireflyFest2026",
  },
  metadata: {
    aiModel: 'GPT-4o',
    prompt: 'Post-event recap, emotional close, thank the crowd',
    platform: 'Instagram',
    generatedAt: daysAgo(0),
  },
  children: [],
}

export const SESSION_RECAP: ContentSession = {
  id: 's4',
  title: 'Firefly Fest 2026 — Event Recap',
  createdAt: new Date('2026-03-24T08:00:00Z'),
  updatedAt: new Date('2026-03-24T08:00:00Z'),
  platforms: ['Instagram'],
  rootNode: recapRoot,
}

// ─── All sessions ──────────────────────────────────────────────────────────────
export const ALL_SESSIONS: ContentSession[] = [
  SESSION_SXSW,
  SESSION_ARTIST,
  SESSION_BTS,
  SESSION_RECAP,
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Flatten all nodes in a session tree into a map keyed by id */
export function flattenNodes(session: ContentSession): Map<string, ContentNode> {
  const map = new Map<string, ContentNode>()
  function walk(node: ContentNode) {
    map.set(node.id, node)
    node.children.forEach(walk)
  }
  walk(session.rootNode)
  return map
}

/** Count total nodes (versions) in a session */
export function countNodes(session: ContentSession): number {
  let count = 0
  function walk(node: ContentNode) {
    count++
    node.children.forEach(walk)
  }
  walk(session.rootNode)
  return count
}

/** Count branch forks (nodes with siblings) */
export function countBranches(session: ContentSession): number {
  let forks = 0
  function walk(node: ContentNode) {
    if (node.children.length > 1) forks += node.children.length - 1
    node.children.forEach(walk)
  }
  walk(session.rootNode)
  return forks
}
