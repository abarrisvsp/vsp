// __tests__/media.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

describe('getMediaFiles', () => {
  beforeEach(() => {
    mockRemove.mockClear();
    mockList.mockClear();
    mockList.mockResolvedValue({
      data: [
        {
          name: 'test.jpg',
          created_at: '2026-01-01T00:00:00Z',
          metadata: { size: 1024, width: 800, height: 600, category: 'gallery' },
        },
      ],
      error: null,
    });
  });

  it('maps Supabase storage items to MediaFile shape', async () => {
    const { getMediaFiles } = await import('@/lib/actions/media');
    const result = await getMediaFiles();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toMatchObject({
      name: 'test.jpg',
      publicUrl: 'https://example.com/test.jpg',
      size: 1024,
      width: 800,
      height: 600,
    });
  });

  it('skips items with empty names', async () => {
    mockList.mockResolvedValue({
      data: [{ name: '', created_at: '', metadata: {} }],
      error: null,
    });
    const { getMediaFiles } = await import('@/lib/actions/media');
    const result = await getMediaFiles();
    expect(result.every((f) => f.name !== '')).toBe(true);
  });
});
