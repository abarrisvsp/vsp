import { describe, it, expect, vi, afterEach } from 'vitest';
import { adminLoginEmails, generateCode, hashCode, matchAdminLoginEmail } from '@/lib/auth-codes';

describe('generateCode', () => {
  it('returns a zero-padded 6-digit string', () => {
    for (let i = 0; i < 500; i++) {
      const code = generateCode();
      expect(code).toMatch(/^\d{6}$/);
    }
  });
});

describe('hashCode', () => {
  it('is deterministic for the same input', async () => {
    expect(await hashCode('123456')).toBe(await hashCode('123456'));
  });

  it('differs for different inputs and is not the plaintext', async () => {
    const a = await hashCode('123456');
    const b = await hashCode('654321');
    expect(a).not.toBe(b);
    expect(a).not.toContain('123456');
    // SHA-256 hex is 64 chars.
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('admin login allowlist', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('matches ADMIN_EMAIL case-insensitively and returns the normalized address', () => {
    vi.stubEnv('ADMIN_EMAIL', 'Aaron@VisionarySoundProductions.com');
    vi.stubEnv('ADMIN_LOGIN_EMAILS', '');
    expect(matchAdminLoginEmail('  aaron@visionarysoundproductions.COM ')).toBe('aaron@visionarysoundproductions.com');
  });

  it('adds every address in ADMIN_LOGIN_EMAILS, ignoring spaces and duplicates', () => {
    vi.stubEnv('ADMIN_EMAIL', 'aaron@vsp.com');
    vi.stubEnv('ADMIN_LOGIN_EMAILS', ' nbarris11@gmail.com , AARON@vsp.com,, ');
    expect(adminLoginEmails()).toEqual(['aaron@vsp.com', 'nbarris11@gmail.com']);
    expect(matchAdminLoginEmail('NBarris11@gmail.com')).toBe('nbarris11@gmail.com');
  });

  it('rejects addresses that are not on the list', () => {
    vi.stubEnv('ADMIN_EMAIL', 'aaron@vsp.com');
    vi.stubEnv('ADMIN_LOGIN_EMAILS', 'nbarris11@gmail.com');
    expect(matchAdminLoginEmail('someone@else.com')).toBeNull();
    expect(matchAdminLoginEmail('')).toBeNull();
    expect(matchAdminLoginEmail(undefined)).toBeNull();
  });

  it('lets nobody in when both variables are empty (never fails open)', () => {
    vi.stubEnv('ADMIN_EMAIL', '');
    vi.stubEnv('ADMIN_LOGIN_EMAILS', '');
    expect(adminLoginEmails()).toEqual([]);
    expect(matchAdminLoginEmail('aaron@vsp.com')).toBeNull();
    expect(matchAdminLoginEmail(',')).toBeNull();
  });
});
