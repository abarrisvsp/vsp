// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RecaptchaResult } from '@/lib/recaptcha';

const verify = vi.fn<(token: unknown) => Promise<RecaptchaResult>>();
vi.mock('@/lib/recaptcha', () => ({ verifyRecaptcha: (t: unknown) => verify(t) }));

const addPublicSubscriber = vi.fn();
vi.mock('@/lib/subscribers', () => ({ addPublicSubscriber: (...a: unknown[]) => addPublicSubscriber(...a) }));

const insert = vi.fn().mockResolvedValue({ error: null });
vi.mock('@/lib/supabase', () => ({ createServiceClient: () => ({ from: () => ({ insert }) }) }));
vi.mock('@/lib/email/notification', () => ({ sendContactNotification: vi.fn() }));
// next-auth can't load under vitest; the actions module imports it for admin checks.
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));

import { POST as subscribe } from '@/app/api/subscribe/route';
import { POST as contact } from '@/app/api/contact/route';

const post = (body: unknown) =>
  new Request('http://test/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

beforeEach(() => {
  verify.mockReset();
  addPublicSubscriber.mockReset().mockResolvedValue({ success: true, message: 'Subscribed. Thank you!' });
  insert.mockClear();
});

describe('newsletter signup (/api/subscribe)', () => {
  it('saves the subscriber once the robot check passes', async () => {
    verify.mockResolvedValue('ok');
    const res = await subscribe(post({ email: 'a@b.com', first_name: 'Ann', recaptchaToken: 'tok' }));
    expect(res.status).toBe(200);
    expect(verify).toHaveBeenCalledWith('tok');
    expect(addPublicSubscriber).toHaveBeenCalledWith('a@b.com', 'Ann', undefined);
  });

  it('pretends success but saves nothing when the hidden field is filled', async () => {
    const res = await subscribe(post({ email: 'bot@x.com', hp: 'spam', recaptchaToken: 'tok' }));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(verify).not.toHaveBeenCalled();
    expect(addPublicSubscriber).not.toHaveBeenCalled();
  });

  it.each([
    ['missing', 400],
    ['failed', 400],
    ['unavailable', 503],
  ] as const)('rejects and saves nothing when the check is %s', async (result, status) => {
    verify.mockResolvedValue(result);
    const res = await subscribe(post({ email: 'a@b.com' }));
    expect(res.status).toBe(status);
    expect((await res.json()).error).toBeTruthy();
    expect(addPublicSubscriber).not.toHaveBeenCalled();
  });

  it('cannot be reached any other way: signup is no longer a server action', async () => {
    const actions = await import('@/lib/actions/subscribers');
    expect('subscribeEmail' in actions).toBe(false);
  });
});

describe('contact form (/api/contact) keeps its lead-friendly behaviour', () => {
  const lead = { full_name: 'Pat', email: 'pat@x.com', recaptchaToken: 'tok' };

  it('still accepts the inquiry if Google is unreachable', async () => {
    verify.mockResolvedValue('unavailable');
    const res = await contact(post(lead));
    expect(res.status).toBe(200);
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('still requires the robot check when Google is reachable', async () => {
    verify.mockResolvedValue('missing');
    const res = await contact(post(lead));
    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });
});
