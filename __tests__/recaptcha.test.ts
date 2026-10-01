// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';
import { verifyRecaptcha } from '@/lib/recaptcha';

const googleSays = (body: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body)));

describe('verifyRecaptcha', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('skips the check when no secret is configured', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', '');
    expect(await verifyRecaptcha('anything')).toBe('not-configured');
  });

  it('reports a missing token without calling Google', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', 'secret');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    expect(await verifyRecaptcha('')).toBe('missing');
    expect(await verifyRecaptcha(undefined)).toBe('missing');
    expect(await verifyRecaptcha(123)).toBe('missing');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('passes when Google confirms the token', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', 'secret');
    const spy = googleSays({ success: true });
    expect(await verifyRecaptcha('tok')).toBe('ok');
    const body = String(spy.mock.calls[0][1]?.body);
    expect(body).toContain('secret=secret');
    expect(body).toContain('response=tok');
  });

  it('fails when Google rejects the token', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', 'secret');
    googleSays({ success: false, 'error-codes': ['invalid-input-response'] });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(await verifyRecaptcha('bad')).toBe('failed');
  });

  it('reports unavailable when Google cannot be reached', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', 'secret');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await verifyRecaptcha('tok')).toBe('unavailable');
  });
});
