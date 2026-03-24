// Connection
export { connectDB, disconnectDB, mongoose } from './connection.js';

// Encryption utilities (for use in services that handle raw token data)
export { encrypt, decrypt } from './encryption.js';

// Models
export { UserModel } from './schemas/user.js';
export { ContentModel } from './schemas/content.js';
export { SessionModel } from './schemas/session.js';
export { SocialAccountModel } from './schemas/social-account.js';
export { PostModel, PostStatus } from './schemas/post.js';
export { FeatureFlagModel } from './schemas/feature-flag.js';
export { UsageModel } from './schemas/usage.js';

// Document type re-exports (for consumers who need the TS types)
export type { UserDocument } from './schemas/user.js';
export type { ContentDocument, ContentVariantDocument, GenerationParamsDocument } from './schemas/content.js';
export type { SessionDocument, SessionNodeDocument } from './schemas/session.js';
export type { SocialAccountDocument, TokensEncrypted, SocialProfileDocument } from './schemas/social-account.js';
export type { PostDocument, AnalyticsSnapshotDocument } from './schemas/post.js';
export type { FeatureFlagDocument } from './schemas/feature-flag.js';
export type { UsageDocument } from './schemas/usage.js';
