/**
 * Type declarations for the @ffe/db CommonJS package (packages/db).
 * These mirror the actual exports from packages/db/index.js.
 *
 * Prisma models used here match packages/db/prisma/schema.prisma.
 */
declare module '@ffe/db' {
  // ---------------------------------------------------------------------------
  // Prisma model shapes (hand-maintained to match schema.prisma)
  // ---------------------------------------------------------------------------

  export interface User {
    id: string;
    email: string;
    name: string | null;
    tier: string;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    currentPeriodEnd: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Content {
    id: string;
    userId: string | null;
    type: string;
    status: string;
    text: string | null;
    audioUrl: string | null;
    videoUrl: string | null;
    platforms: string[];
    scheduledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }

  // ---------------------------------------------------------------------------
  // A minimal Prisma-like client type for the operations we use.
  // We only type the methods we actually call in api-gateway.
  // ---------------------------------------------------------------------------

  export interface WhereInput {
    id?: string;
    userId?: string | null;
    createdAt?: { gte?: Date; lte?: Date };
  }

  export interface UserWhereInput {
    id?: string;
    email?: string;
  }

  export interface PrismaUserDelegate {
    findUnique(args: { where: { id: string } }): Promise<User | null>;
    findMany(args?: {
      where?: UserWhereInput;
      skip?: number;
      take?: number;
      orderBy?: Record<string, string>;
      select?: Record<string, unknown>;
    }): Promise<User[]>;
    create(args: { data: Partial<User> }): Promise<User>;
    update(args: { where: { id: string }; data: Partial<User> }): Promise<User>;
    count(args?: { where?: UserWhereInput }): Promise<number>;
  }

  export interface PrismaContentDelegate {
    findMany(args?: {
      where?: WhereInput;
      skip?: number;
      take?: number;
      orderBy?: Record<string, string>;
      select?: Record<string, unknown>;
    }): Promise<Content[]>;
    findFirst(args: { where: WhereInput; select?: Record<string, unknown> }): Promise<Content | null>;
    create(args: {
      data: {
        userId: string;
        type: string;
        status: string;
        text?: string;
        platforms?: string[];
      };
    }): Promise<Content>;
    count(args?: { where?: WhereInput }): Promise<number>;
  }

  export interface PrismaClientLike {
    user: PrismaUserDelegate;
    content: PrismaContentDelegate;
  }

  // ---------------------------------------------------------------------------
  // Social token functions
  // ---------------------------------------------------------------------------

  export interface SocialConnection {
    platform: string;
    profileName?: string;
    profileUrl?: string;
    status?: string;
    lastRefreshed?: Date;
    connectedAt?: Date;
  }

  export const prisma: PrismaClientLike;

  export function listConnections(userId: string): Promise<SocialConnection[]>;
  export function storeToken(
    userId: string,
    platform: string,
    tokenData: Record<string, unknown>
  ): Promise<void>;
  export function getToken(
    userId: string,
    platform: string
  ): Promise<Record<string, unknown> | null>;
  export function revokeToken(userId: string, platform: string): Promise<void>;
}
