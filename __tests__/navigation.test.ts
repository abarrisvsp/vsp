// __tests__/navigation.test.ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { isAdmin: true } }),
}));

const mockDelete = vi.fn().mockResolvedValue({ error: null });
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockSelect = vi.fn().mockResolvedValue({
  data: [{ id: '1', label: 'Home', href: '/', sort_order: 0, visible: true, is_custom: false }],
  error: null,
});

vi.mock('@/lib/supabase', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      delete: vi.fn(() => ({ neq: mockDelete })),
      insert: mockInsert,
      select: vi.fn(() => ({
        order: mockSelect,
      })),
    })),
  })),
  createAnonClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ order: mockSelect })),
      })),
    })),
  })),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('saveNavigation', () => {
  it('deletes all rows and inserts new ordered set', async () => {
    const { saveNavigation } = await import('@/lib/actions/navigation');
    await saveNavigation([
      { id: '1', label: 'Home', href: '/', sort_order: 0, visible: true, is_custom: false },
    ]);
    expect(mockDelete).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalled();
  });
});
