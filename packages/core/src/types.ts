export interface BrandVoice {
  name: string;
  tone: string;
  avoid: string;
  examples: string;
  targetAudience: string;
  emojiUsage: string;
  hashtagStyle: string;
  updatedAt: string;
}

export interface UserPublicMetadata {
  brandVoice?: BrandVoice;
  onboardingCompleted?: boolean;
  onboardingStep?: string;
  planCache?: any;
  [key: string]: any;
}

export interface UserUnsafeMetadata {
  defaultAiModel?: string;
  defaultPlatforms?: string[];
  contentViewMode?: 'grid' | 'list';
  theme?: 'light' | 'dark' | 'system';
  hasSeenWelcomeModal?: boolean;
  lastActiveTemplateId?: string;
  [key: string]: any;
}
