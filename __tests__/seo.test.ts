// __tests__/seo.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { isAdmin: true } }),
}));

const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      upsert: mockUpsert,
      select: vi.fn(() => ({ eq: mockEq })),
    })),
  })),
  createAnonClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: mockEq })),
    })),
  })),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('SEO actions', () => {
  beforeEach(() => {
    mockUpsert.mockClear();
  });

  it('updateSeoSettings calls upsert with correct fields', async () => {
    const { updateSeoSettings } = await import('@/lib/actions/seo');
    await updateSeoSettings('/', { meta_title: 'Test Title', meta_description: 'Test desc' });
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ route: '/', meta_title: 'Test Title' }),
      expect.objectContaining({ onConflict: 'route' })
    );
  });
});
