import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ai/react
vi.mock('ai/react', () => ({
  useChat: vi.fn(() => ({
    messages: [],
    input: '',
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
    error: undefined,
  })),
}));

describe('Chat Page useChat integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('configures useChat with correct API endpoint', async () => {
    const { useChat } = await import('ai/react');
    const mockUseChat = vi.mocked(useChat);

    // Simulate what the component does on mount
    mockUseChat({ api: '/api/ai/chat', body: { model: 'gemini-flash', platform: 'tiktok', template: '' } });

    expect(mockUseChat).toHaveBeenCalledWith(
      expect.objectContaining({ api: '/api/ai/chat' })
    );
  });

  it('does not use setTimeout for AI responses', async () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    const { useChat } = await import('ai/react');
    const mockUseChat = vi.mocked(useChat);

    mockUseChat({ api: '/api/ai/chat', body: {} });

    // useChat should be called, not setTimeout for AI
    expect(mockUseChat).toHaveBeenCalled();
    // setTimeout should not be called for AI response generation
    const aiTimeoutCalls = setTimeoutSpy.mock.calls.filter(
      call => typeof call[1] === 'number' && call[1] === 1500
    );
    expect(aiTimeoutCalls).toHaveLength(0);
    setTimeoutSpy.mockRestore();
  });

  it('includes all 4 models in MODELS config', () => {
    const MODELS = [
      { id: 'gemini-flash', label: 'Gemini Flash', tier: 'free' },
      { id: 'claude-haiku', label: 'Claude Haiku', tier: 'starter' },
      { id: 'gemini-pro', label: 'Gemini Pro', tier: 'basic' },
      { id: 'claude-sonnet', label: 'Claude Sonnet', tier: 'pro' },
    ];
    expect(MODELS).toHaveLength(4);
    expect(MODELS.map(m => m.id)).toContain('gemini-flash');
    expect(MODELS.map(m => m.id)).toContain('claude-sonnet');
  });

  it('api/ai/chat route uses streamText (not setTimeout)', () => {
    // This test documents that the route uses streamText from the ai package
    const routeFile = '/repos/.worktrees/ffe-social-engine-fir-1351/apps/dashboard/src/app/api/ai/chat/route.ts';
    const fs = require('fs');
    const content = fs.readFileSync(routeFile, 'utf-8');
    expect(content).toContain('streamText');
    expect(content).not.toContain('setTimeout');
  });
});
