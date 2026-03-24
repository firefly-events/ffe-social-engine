export enum Platform {
  Instagram = 'instagram',
  TikTok = 'tiktok',
  YouTube = 'youtube',
  Twitter = 'twitter',
  LinkedIn = 'linkedin',
  Facebook = 'facebook',
  Pinterest = 'pinterest',
  Threads = 'threads',
  Bluesky = 'bluesky',
}

export enum ContentType {
  Caption = 'caption',
  Image = 'image',
  Video = 'video',
  Voice = 'voice',
}

export enum ContentStatus {
  Draft = 'draft',
  Ready = 'ready',
  Scheduled = 'scheduled',
  Published = 'published',
  Failed = 'failed',
  Archived = 'archived',
}

export interface ContentVariant {
  id: string;
  platform: Platform;
  text?: string;
  /** CDN/storage URL for image or video asset */
  assetUrl?: string;
  /** Audio URL for voice content */
  audioUrl?: string;
  /** Duration in seconds for video/voice */
  durationSeconds?: number;
  /** Platform-specific metadata (hashtags, alt text, etc.) */
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface GenerationParams {
  prompt: string;
  tone?: string;
  style?: string;
  targetPlatforms: Platform[];
  /** e.g. "gpt-4o", "claude-3-5-sonnet", "gemini-2.0-flash" */
  aiModel: string;
  temperature?: number;
  /** Raw model parameters passed through */
  modelParams?: Record<string, unknown>;
}

export interface ContentItem {
  id: string;
  userId: string;
  type: ContentType;
  status: ContentStatus;
  /** Original user prompt or source description */
  sourcePrompt: string;
  generationParams: GenerationParams;
  variants: ContentVariant[];
  /**
   * Session node that produced this content item, for traceability.
   */
  sessionId?: string;
  sessionNodeId?: string;
  /** Cached result — skip re-generation if true */
  isCached: boolean;
  /** Tags for organisation/search */
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateContentInput = Pick<
  ContentItem,
  'userId' | 'type' | 'sourcePrompt' | 'generationParams'
> &
  Partial<Pick<ContentItem, 'tags' | 'sessionId' | 'sessionNodeId'>>;
