/**
 * Template registry for the Social Engine content creation pipeline.
 * Each template has distinct form fields, system prompts, default platforms, tone, and output types.
 */

/** @type {Record<string, import('./types').TemplateConfig>} */
const TEMPLATES = {
  'product-launch': {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Announce a new product or feature with excitement',
    icon: '🚀',
    fields: [
      { id: 'productName',  label: 'Product Name',    type: 'text',     placeholder: 'e.g. SuperWidget Pro', required: true },
      { id: 'keyBenefit',   label: 'Key Benefit',     type: 'text',     placeholder: 'e.g. saves 2 hours/day', required: true },
      { id: 'price',        label: 'Price',           type: 'text',     placeholder: 'e.g. $29/mo or Free', required: false },
      { id: 'launchDate',   label: 'Launch Date',     type: 'date',     required: false },
      { id: 'callToAction', label: 'Call to Action',  type: 'text',     placeholder: 'e.g. Sign up today', required: false },
    ],
    defaultPlatforms: ['instagram', 'x', 'linkedin'],
    tone: 'excited',
    outputTypes: ['caption', 'batch', 'hashtags'],
    systemPrompt: (fields) => `You are crafting a product launch announcement for "${fields.productName}".
Key benefit: ${fields.keyBenefit || 'not specified'}
Price: ${fields.price || 'not specified'}
Launch date: ${fields.launchDate || 'soon'}
CTA: ${fields.callToAction || 'Learn more'}
Make it exciting, benefit-focused, and drive urgency.`,
  },

  'tutorial': {
    id: 'tutorial',
    name: 'Tutorial',
    description: 'Teach your audience a skill or process',
    icon: '📚',
    fields: [
      { id: 'topic',       label: 'Topic',        type: 'text',   placeholder: 'e.g. How to edit videos on iPhone', required: true },
      { id: 'steps',       label: 'Key Steps',    type: 'textarea', placeholder: '1. Open app\n2. Import video\n3. Add filters', required: false },
      { id: 'difficulty',  label: 'Difficulty',   type: 'select', options: ['beginner', 'intermediate', 'advanced'], required: false },
      { id: 'duration',    label: 'Time to Learn', type: 'text',  placeholder: 'e.g. 5 minutes', required: false },
    ],
    defaultPlatforms: ['youtube', 'tiktok', 'instagram'],
    tone: 'educational',
    outputTypes: ['caption', 'thread', 'hashtags'],
    systemPrompt: (fields) => `You are creating tutorial content about: "${fields.topic}".
Difficulty: ${fields.difficulty || 'beginner'}
Key steps: ${fields.steps || 'to be determined'}
Time: ${fields.duration || 'quick'}
Make it instructional, clear, and encouraging.`,
  },

  'trending': {
    id: 'trending',
    name: 'Trending',
    description: 'Ride a current trend or viral moment',
    icon: '📈',
    fields: [
      { id: 'trend',    label: 'Trend / Hashtag', type: 'text', placeholder: 'e.g. #BookTok or AI art', required: true },
      { id: 'angle',    label: 'Your Angle',      type: 'text', placeholder: 'e.g. how we use it in our business', required: true },
      { id: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g. small business owners', required: false },
    ],
    defaultPlatforms: ['tiktok', 'instagram', 'x'],
    tone: 'energetic',
    outputTypes: ['caption', 'batch', 'hashtags'],
    systemPrompt: (fields) => `You are creating content around the trend: "${fields.trend}".
Your unique angle: ${fields.angle}
Target audience: ${fields.audience || 'general'}
Make it timely, relatable, and shareable.`,
  },

  'behind-scenes': {
    id: 'behind-scenes',
    name: 'Behind the Scenes',
    description: 'Show your authentic process or team',
    icon: '🎬',
    fields: [
      { id: 'what', label: 'What are you showing?', type: 'text',     placeholder: 'e.g. our morning content shoot', required: true },
      { id: 'who',  label: 'Who is involved?',      type: 'text',     placeholder: 'e.g. just me, or the full team', required: false },
      { id: 'mood', label: 'Mood / Vibe',            type: 'select',  options: ['fun', 'authentic', 'inspiring', 'educational', 'raw'], required: false },
    ],
    defaultPlatforms: ['instagram', 'tiktok', 'youtube'],
    tone: 'authentic',
    outputTypes: ['caption', 'hashtags'],
    systemPrompt: (fields) => `You are writing behind-the-scenes content showing: "${fields.what}".
Who: ${fields.who || 'the creator'}
Mood: ${fields.mood || 'authentic'}
Make it real, human, and build genuine connection with the audience.`,
  },

  'promo': {
    id: 'promo',
    name: 'Promotion / Sale',
    description: 'Drive sales with a limited-time offer',
    icon: '💰',
    fields: [
      { id: 'discount',  label: 'Discount / Offer',  type: 'text', placeholder: 'e.g. 30% off or Buy 1 Get 1', required: true },
      { id: 'endDate',   label: 'Offer Ends',        type: 'date', required: false },
      { id: 'urgency',   label: 'Urgency Message',   type: 'text', placeholder: 'e.g. Only 50 spots left!', required: false },
      { id: 'product',   label: 'Product / Service', type: 'text', placeholder: 'e.g. Annual membership', required: false },
    ],
    defaultPlatforms: ['instagram', 'facebook', 'x'],
    tone: 'urgent',
    outputTypes: ['caption', 'batch', 'hashtags'],
    systemPrompt: (fields) => `You are writing promotional content for: "${fields.discount}".
Product/service: ${fields.product || 'the offer'}
Ends: ${fields.endDate || 'soon'}
Urgency: ${fields.urgency || 'limited time only'}
Make it compelling, create FOMO, and drive immediate action.`,
  },
};

/**
 * Get a template config by ID.
 * @param {string} id
 * @returns {import('./types').TemplateConfig | undefined}
 */
function getTemplate(id) {
  return TEMPLATES[id];
}

/**
 * Get all available templates.
 * @returns {import('./types').TemplateConfig[]}
 */
function getAllTemplates() {
  return Object.values(TEMPLATES);
}

module.exports = { TEMPLATES, getTemplate, getAllTemplates };
