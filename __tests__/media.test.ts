// __tests__/media.test.ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { isAdmin: true } }),
}));

const mockRemove = vi.fn().mockResolvedValue({ error: null });
const mockList = vi.fn().mockResolvedValue({
  data: [
    {
      name: 'test.jpg',
      created_at: '2026-01-01T00:00:00Z',
      metadata: { size: 1024, width: 800, height: 600, category: 'gallery' },
    },
  ],
  error: null,
});
const mockGetPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } });

vi.mock('@/lib/supabase', () => ({
  createServiceClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        list: mockList,
        remove: mockRemove,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
  })),
}));

describe('deleteMedia', () => {
  it('calls storage.remove with the given path', async () => {
    const { deleteMedia } = await import('@/lib/actions/media');
    await deleteMedia('gallery/test.jpg');
    expect(mockRemove).toHaveBeenCalledWith(['gallery/test.jpg']);
  });
});
