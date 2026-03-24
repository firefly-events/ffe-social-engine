import type { GenerationParams } from './content.js';

export enum SessionStatus {
  Active = 'active',
  Paused = 'paused',
  Completed = 'completed',
  Abandoned = 'abandoned',
}

export enum NodeStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Skipped = 'skipped',
}

export interface SessionNodeOutput {
  /** Generated text result */
  text?: string;
  /** Asset URL if the node produced media */
  assetUrl?: string;
  /** Reference to a ContentItem produced by this node */
  contentItemId?: string;
  /** Raw model response for debugging */
  rawResponse?: unknown;
  /** Tokens consumed */
  tokensUsed?: number;
}

export interface SessionNode {
  id: string;
  /** null for root nodes */
  parentNodeId: string | null;
  /** Depth in the branching tree (0 = root) */
  depth: number;
  label?: string;
  status: NodeStatus;
  generationParams: GenerationParams;
  input: {
    prompt: string;
    contextFromParent?: unknown;
    userEdits?: string;
  };
  output?: SessionNodeOutput;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  title?: string;
  status: SessionStatus;
  /**
   * Set when this session is forked from another session.
   * Enables comparing branched generation paths.
   */
  parentSessionId?: string;
  /** ID of the node in the parent session this was forked from */
  forkFromNodeId?: string;
  nodes: SessionNode[];
  /**
   * Cached intermediate results keyed by node ID.
   * Avoids re-running expensive generations on replay.
   */
  cachedResults: Record<string, SessionNodeOutput>;
  /** Platform targets for this session */
  targetPlatforms: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateSessionInput = Pick<Session, 'userId'> &
  Partial<Pick<Session, 'title' | 'parentSessionId' | 'forkFromNodeId' | 'targetPlatforms' | 'metadata'>>;
