import { describe, it, expect } from 'vitest';
import { generateCode, hashCode } from '@/lib/auth-codes';

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
