import { Router, Request, Response, IRouter } from 'express';
import { prisma } from '@ffe/db';
import crypto from 'crypto';

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// In-memory session store (until a Session model is added to Prisma schema)
// Sessions hold a list of nodes, each optionally linked to a Content record.
// ---------------------------------------------------------------------------

interface SessionNode {
  id: string;
  contentId: string | null;
  parentNodeId: string | null;
  label: string | null;
  createdAt: string;
}

interface Session {
  id: string;
  userId: string;
  title: string;
  nodes: SessionNode[];
  createdAt: string;
  updatedAt: string;
}

// Production note: replace with a Redis or Postgres-backed store.
const sessionStore = new Map<string, Session>();

// ---------------------------------------------------------------------------
// POST /api/sessions
// ---------------------------------------------------------------------------

interface CreateSessionRequest {
  title?: string;
}

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { title = 'Untitled Session' } = req.body as CreateSessionRequest;
  const now = new Date().toISOString();

  const session: Session = {
    id: crypto.randomUUID(),
    userId: req.userId!,
    title,
    nodes: [],
    createdAt: now,
    updatedAt: now,
  };

  sessionStore.set(session.id, session);
  res.status(201).json({ success: true, data: session });
});

// ---------------------------------------------------------------------------
// GET /api/sessions
// ---------------------------------------------------------------------------

router.get('/', (_req: Request, res: Response): void => {
  const userSessions = Array.from(sessionStore.values())
    .filter((s) => s.userId === _req.userId!)
    .map(({ id, title, createdAt, updatedAt, nodes }) => ({
      id,
      title,
      nodeCount: nodes.length,
      createdAt,
      updatedAt,
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  res.status(200).json({ success: true, data: userSessions });
});

// ---------------------------------------------------------------------------
// GET /api/sessions/:id
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const session = sessionStore.get(req.params.id);

  if (!session || session.userId !== req.userId!) {
    res.status(404).json({ success: false, error: 'Session not found' });
    return;
  }

  // Enrich nodes with their content records where available
  const enrichedNodes = await Promise.all(
    session.nodes.map(async (node) => {
      if (!node.contentId) return node;
      try {
        const content = await prisma.content.findFirst({
          where: { id: node.contentId, userId: req.userId! },
          select: {
            id: true,
            type: true,
            status: true,
            platforms: true,
            createdAt: true,
          },
        });
        return { ...node, content };
      } catch {
        return node;
      }
    })
  );

  res.status(200).json({
    success: true,
    data: { ...session, nodes: enrichedNodes },
  });
});

// ---------------------------------------------------------------------------
// POST /api/sessions/:id/branch
// ---------------------------------------------------------------------------

interface BranchRequest {
  fromNodeId: string;
  label?: string;
  contentId?: string;
}

router.post('/:id/branch', async (req: Request, res: Response): Promise<void> => {
  const session = sessionStore.get(req.params.id);

  if (!session || session.userId !== req.userId!) {
    res.status(404).json({ success: false, error: 'Session not found' });
    return;
  }

  const { fromNodeId, label, contentId } = req.body as BranchRequest;

  if (!fromNodeId) {
    res.status(400).json({ success: false, error: 'fromNodeId is required' });
    return;
  }

  const parentExists = session.nodes.some((n) => n.id === fromNodeId);
  if (!parentExists) {
    res.status(400).json({
      success: false,
      error: 'fromNodeId not found in this session',
    });
    return;
  }

  const newNode: SessionNode = {
    id: crypto.randomUUID(),
    contentId: contentId ?? null,
    parentNodeId: fromNodeId,
    label: label ?? null,
    createdAt: new Date().toISOString(),
  };

  session.nodes.push(newNode);
  session.updatedAt = new Date().toISOString();
  sessionStore.set(session.id, session);

  res.status(201).json({ success: true, data: newNode });
});

export default router;
