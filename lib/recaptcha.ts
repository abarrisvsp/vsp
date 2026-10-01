export type RecaptchaResult = 'ok' | 'missing' | 'failed' | 'unavailable' | 'not-configured';

/**
 * Checks a reCAPTCHA v2 token with Google. Each caller decides what an outage
 * ('unavailable') means for it: the contact form lets the message through so a
 * lead is never lost, while newsletter signup refuses.
 */
export async function verifyRecaptcha(token: unknown): Promise<RecaptchaResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return 'not-configured';
  if (typeof token !== 'string' || !token) return 'missing';
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }).toString(),
    });
    const verify = await res.json();
    if (!verify.success) {
      console.warn('reCAPTCHA failed', verify['error-codes']);
      return 'failed';
    }
    return 'ok';
  } catch (e) {
    console.error('reCAPTCHA verify error', e);
    return 'unavailable';
  }
}
