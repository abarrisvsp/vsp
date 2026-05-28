// __tests__/navigation.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { isAdmin: true } }),
}));

const mockDelete = vi.fn().mockResolvedValue({ error: null });
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockSelectOrder = vi.fn().mockResolvedValue({
  data: [{ id: '1', label: 'Home', href: '/', sort_order: 0, visible: true, is_custom: false }],
  error: null,
});

vi.mock('@/lib/supabase', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      delete: vi.fn(() => ({ neq: mockDelete })),
      insert: mockInsert,
      select: vi.fn(() => ({
        order: mockSelectOrder,
        eq: vi.fn(() => ({ order: mockSelectOrder })),
      })),
    })),
  })),
  createAnonClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ order: mockSelectOrder })),
      })),
    })),
  })),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('saveNavigation', () => {
  beforeEach(() => {
    mockDelete.mockClear();
    mockInsert.mockClear();
    mockSelectOrder.mockClear();
    // Restore defaults
    mockDelete.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });
    mockSelectOrder.mockResolvedValue({
      data: [{ id: '1', label: 'Home', href: '/', sort_order: 0, visible: true, is_custom: false }],
      error: null,
    });
  });

  it('deletes all rows and inserts new ordered set', async () => {
    const { saveNavigation } = await import('@/lib/actions/navigation');
    await saveNavigation([
      { id: '1', label: 'Home', href: '/', sort_order: 0, visible: true, is_custom: false },
    ]);
    expect(mockDelete).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalled();
  });

  it('throws when insert fails', async () => {
    mockDelete.mockResolvedValueOnce({ error: null });
    mockInsert.mockResolvedValueOnce({ error: new Error('insert failed') });
    const { saveNavigation } = await import('@/lib/actions/navigation');
    await expect(
      saveNavigation([{ id: '1', label: 'Home', href: '/', sort_order: 0, visible: true, is_custom: false }])
    ).rejects.toThrow('insert failed');
  });

  it('does not call insert when delete fails', async () => {
    mockDelete.mockResolvedValueOnce({ error: new Error('delete failed') });
    const { saveNavigation } = await import('@/lib/actions/navigation');
    await expect(
      saveNavigation([{ id: '1', label: 'Home', href: '/', sort_order: 0, visible: true, is_custom: false }])
    ).rejects.toThrow('delete failed');
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
