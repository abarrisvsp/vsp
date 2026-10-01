'use client';

declare global {
  interface Window {
    grecaptcha?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => number;
      reset: (id?: number) => void;
    };
  }
}

// Public reCAPTCHA v2 (checkbox) site key; safe to expose. Same fallback as the
// contact form, so production works without extra config.
export const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LfADwYtAAAAAOOnGSYVOSruxvz7hZZCkBCmIPlW';

// Same id the contact form uses, so the script only ever loads once per page.
const SCRIPT_ID = 'recaptcha-v2-script';

type Grecaptcha = NonNullable<Window['grecaptcha']>;

/** Loads Google's script on demand and resolves once it is ready to render. */
export function loadRecaptcha(timeoutMs = 15000): Promise<Grecaptcha> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const iv = setInterval(() => {
      const g = window.grecaptcha;
      if (g?.render) {
        clearInterval(iv);
        resolve(g);
      } else if (Date.now() - started > timeoutMs) {
        clearInterval(iv);
        reject(new Error('reCAPTCHA timed out'));
      }
    }, 100);
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      s.async = true;
      s.defer = true;
      s.onerror = () => {
        clearInterval(iv);
        reject(new Error('reCAPTCHA script failed to load'));
      };
      document.body.appendChild(s);
    }
  });
}
