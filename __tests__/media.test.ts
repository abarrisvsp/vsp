// __tests__/media.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { isAdmin: true } }),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const mockRemove = vi.fn().mockResolvedValue({ error: null });
const mockList = vi.fn();
const mockGetPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } });

// gallery_photos DB mocks
const mockIn = vi.fn(); // .select(...).in(...)  -> publication lookup for many paths
const mockMaybeSingle = vi.fn(); // .select(...).eq(...).maybeSingle() -> single row lookup
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));

function dbFrom() {
  return {
    select: vi.fn(() => ({
      in: mockIn,
      eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })),
    })),
    insert: mockInsert,
    update: mockUpdate,
  };
}

vi.mock('@/lib/supabase', () => ({
  createServiceClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({ list: mockList, remove: mockRemove, getPublicUrl: mockGetPublicUrl })),
    },
    from: vi.fn(dbFrom),
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockRemove.mockResolvedValue({ error: null });
  mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } });
  mockList.mockResolvedValue({
    data: [
      { name: 'test.jpg', created_at: '2026-01-01T00:00:00Z', metadata: { size: 1024, width: 800, height: 600, category: 'gallery' } },
    ],
    error: null,
  });
  mockIn.mockResolvedValue({ data: [], error: null });
  mockMaybeSingle.mockResolvedValue({ data: null, error: null });
  mockInsert.mockResolvedValue({ error: null });
  mockUpdateEq.mockResolvedValue({ error: null });
});

describe('deleteMedia', () => {
  it('calls storage.remove with the given path', async () => {
    const { deleteMedia } = await import('@/lib/actions/media');
    await deleteMedia('gallery/test.jpg');
    expect(mockRemove).toHaveBeenCalledWith(['gallery/test.jpg']);
  });
});

describe('getMediaFiles', () => {
  it('maps Supabase storage items to MediaFile shape', async () => {
    const { getMediaFiles } = await import('@/lib/actions/media');
    const result = await getMediaFiles();
    expect(result[0]).toMatchObject({
      name: 'test.jpg',
      publicUrl: 'https://example.com/test.jpg',
      size: 1024,
      width: 800,
      height: 600,
      onSite: false,
      eventTags: [],
    });
  });

  it('attaches onSite + eventTags from the gallery_photos row', async () => {
    mockIn.mockResolvedValue({
      data: [{ storage_path: 'gallery/test.jpg', active: true, event_tags: ['weddings', 'galas'] }],
      error: null,
    });
    const { getMediaFiles } = await import('@/lib/actions/media');
    const result = await getMediaFiles();
    const galleryFile = result.find((f) => f.path === 'gallery/test.jpg')!;
    expect(galleryFile.onSite).toBe(true);
    expect(galleryFile.eventTags).toEqual(['weddings', 'galas']);
  });

  it('skips items with empty names', async () => {
    mockList.mockResolvedValue({ data: [{ name: '', created_at: '', metadata: {} }], error: null });
    const { getMediaFiles } = await import('@/lib/actions/media');
    const result = await getMediaFiles();
    expect(result.every((f) => f.name !== '')).toBe(true);
  });

  it('skips sub-folder placeholder entries (id === null) so they do not render as broken images', async () => {
    mockList.mockResolvedValue({
      data: [
        { name: 'real.jpg', id: 'file-uuid', created_at: '2026-01-01T00:00:00Z', metadata: { size: 10 } },
        { name: 'weddings', id: null, created_at: null, metadata: null }, // Supabase marks folders with id: null
      ],
      error: null,
    });
    const { getMediaFiles } = await import('@/lib/actions/media');
    const result = await getMediaFiles();
    expect(result.some((f) => f.name === 'weddings')).toBe(false);
    expect(result.some((f) => f.name === 'real.jpg')).toBe(true);
  });
});

describe('setMediaPublication', () => {
  it('inserts a new gallery_photos row (normalized tags, active) when none exists and onSite is true', async () => {
    const { setMediaPublication } = await import('@/lib/actions/media');
    await setMediaPublication(
      { path: 'gallery/test.jpg', publicUrl: 'https://example.com/test.jpg' },
      { onSite: true, eventTags: ['galas', 'weddings'] },
    );
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        storage_path: 'gallery/test.jpg',
        public_url: 'https://example.com/test.jpg',
        event_tags: ['weddings', 'galas'], // normalized to EVENT_TAGS order
        active: true,
      }),
    );
  });

  it('updates the existing row when one already exists', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: 'abc' }, error: null });
    const { setMediaPublication } = await import('@/lib/actions/media');
    await setMediaPublication(
      { path: 'gallery/test.jpg', publicUrl: 'https://example.com/test.jpg' },
      { onSite: true, eventTags: ['corporate'] },
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ event_tags: ['corporate'], active: true }),
    );
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'abc');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('deactivates the row (hides from site) when onSite is false', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: 'abc' }, error: null });
    const { setMediaPublication } = await import('@/lib/actions/media');
    await setMediaPublication(
      { path: 'gallery/test.jpg', publicUrl: 'https://example.com/test.jpg' },
      { onSite: false, eventTags: ['corporate'] },
    );
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
