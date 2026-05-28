// __tests__/faqs.test.ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { isAdmin: true } }),
}));

const mockInsert = vi.fn().mockResolvedValue({ data: [{ id: 'new-id' }], error: null });
const mockUpdate = vi.fn().mockResolvedValue({ error: null });
const mockDelete = vi.fn().mockResolvedValue({ error: null });
const mockEq = vi.fn().mockReturnThis();

vi.mock('@/lib/supabase', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: mockInsert })) })),
      update: vi.fn(() => ({ eq: mockUpdate })),
      delete: vi.fn(() => ({ eq: mockDelete })),
      select: vi.fn(() => ({ eq: mockEq, order: vi.fn().mockResolvedValue({ data: [], error: null }) })),
    })),
  })),
  createAnonClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
      })),
    })),
  })),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('faqs actions', () => {
  it('createFaq calls insert with correct fields', async () => {
    const { createFaq } = await import('@/lib/actions/faqs');
    await createFaq({ page: 'general', question: 'Q?', answer: 'A.', sort_order: 0 });
    expect(mockInsert).toHaveBeenCalled();
  });
});
