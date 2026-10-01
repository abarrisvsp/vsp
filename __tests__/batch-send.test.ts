import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Subscriber } from '@/lib/types';

const mockSend = vi.fn();
// The code does `new Resend()`, so the mock has to be constructible.
vi.mock('resend', () => ({
  Resend: class {
    batch = { send: mockSend };
  },
}));
vi.mock('@/lib/supabase', () => ({ createServiceClient: vi.fn() }));

import { sendInDailyBatches } from '@/lib/email/batch-send';

const subs = (n: number): Subscriber[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `id-${i}`,
    email: `person${i}@example.com`,
    first_name: null,
    last_name: null,
    active: true,
    source: null,
    unsubscribe_token: `tok-${i}`,
    subscribed_at: '2026-01-01T00:00:00Z',
    unsubscribed_at: null,
  }));

const build = (sub: Subscriber) => ({ subject: 'Hello', html: `<p>${sub.email}</p>` });

describe('sendInDailyBatches', () => {
  beforeEach(() => {
    mockSend.mockReset().mockResolvedValue({ data: {}, error: null });
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    vi.stubEnv('RESEND_DAILY_LIMIT', '');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('sends 95 today and schedules the rest a day apart (211 subscribers)', async () => {
    const before = Date.now();
    const res = await sendInDailyBatches(subs(211), build);

    expect(mockSend).toHaveBeenCalledTimes(3);
    const [day0, day1, day2] = mockSend.mock.calls.map((c) => c[0] as Record<string, unknown>[]);
    expect([day0.length, day1.length, day2.length]).toEqual([95, 95, 21]);
    expect(day0[0].scheduled_at).toBeUndefined();

    const hours = (e: Record<string, unknown>) => (Date.parse(String(e.scheduled_at)) - before) / 3_600_000;
    expect(Math.round(hours(day1[0]))).toBe(24);
    expect(Math.round(hours(day2[0]))).toBe(48);

    expect(res).toMatchObject({ sent: 95, scheduled: 116, failed: 0 });
  });

  it('sends each person exactly once, with their own unsubscribe link', async () => {
    await sendInDailyBatches(subs(211), build);
    const all = mockSend.mock.calls.flatMap((c) => c[0] as { to: string[]; headers: Record<string, string> }[]);
    const recipients = all.map((e) => e.to[0]);
    expect(recipients).toHaveLength(211);
    expect(new Set(recipients).size).toBe(211);
    expect(all[7].to).toEqual(['person7@example.com']);
    expect(all[7].headers['List-Unsubscribe']).toContain('/unsubscribe?token=tok-7');
  });

  it('respects a raised daily limit after a Resend upgrade', async () => {
    vi.stubEnv('RESEND_DAILY_LIMIT', '3000');
    const res = await sendInDailyBatches(subs(211), build);
    // Still split into calls of 100 (Resend's per-request cap), but none scheduled.
    expect(mockSend.mock.calls.map((c) => (c[0] as unknown[]).length)).toEqual([100, 100, 11]);
    expect(res).toMatchObject({ sent: 211, scheduled: 0 });
  });

  it('counts a failed batch as failed rather than throwing', async () => {
    mockSend.mockRejectedValueOnce(new Error('quota exceeded'));
    const res = await sendInDailyBatches(subs(10), build);
    expect(res).toMatchObject({ sent: 0, failed: 10 });
    expect(res.errors[0]).toContain('quota exceeded');
  });

  it('sends nothing when no API key is configured', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    const res = await sendInDailyBatches(subs(5), build);
    expect(mockSend).not.toHaveBeenCalled();
    expect(res.failed).toBe(5);
  });
});
