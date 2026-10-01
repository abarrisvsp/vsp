'use client';
import { useEffect, useRef, useState } from 'react';
import { loadRecaptcha, RECAPTCHA_SITE_KEY } from '@/lib/recaptcha-client';

export function SubscribeForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [hp, setHp] = useState(''); // honeypot: real users never see or fill this
  const [needsCheck, setNeedsCheck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const captchaEl = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<number | null>(null);
  const rendering = useRef(false);
  // The reCAPTCHA callback is registered once, so it reads the latest values from here.
  const latest = useRef({ email, firstName, hp });
  latest.current = { email, firstName, hp };

  function resetCheck() {
    if (window.grecaptcha && widgetId.current !== null) window.grecaptcha.reset(widgetId.current);
  }

  async function send(token: string) {
    setSubmitting(true);
    setError(null);
    try {
      const { email, firstName, hp } = latest.current;
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, first_name: firstName || undefined, hp, recaptchaToken: token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Try again?');
        resetCheck();
        return;
      }
      setMessage(data.message || 'Subscribed. Thank you!');
    } catch {
      setError('Something went wrong. Try again?');
      resetCheck();
    } finally {
      setSubmitting(false);
    }
  }

  // Google's script loads only after someone actually tries to subscribe.
  useEffect(() => {
    if (!needsCheck || rendering.current || widgetId.current !== null) return;
    rendering.current = true;
    loadRecaptcha()
      .then((g) => {
        if (!captchaEl.current) return;
        widgetId.current = g.render(captchaEl.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          theme: 'dark',
          // Ticking the box submits, so there is no second button to press.
          callback: (token: string) => send(token),
          'error-callback': () => setError("The robot check didn't load. Please try again."),
        });
      })
      .catch(() => setError("Couldn't load the robot check. Please try again later."))
      .finally(() => {
        rendering.current = false;
      });
    // send reads fresh values through `latest`, so it is safe to leave out here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsCheck]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!needsCheck) {
      setNeedsCheck(true);
      return;
    }
    setError("Tick the box to confirm you're not a robot.");
  }

  if (message) {
    return <p className="text-brand text-sm">{message}</p>;
  }

  return (
    <form onSubmit={onSubmit} className={compact ? 'flex flex-col gap-3' : 'space-y-3 max-w-md'}>
      {!compact && (
        <input
          type="text"
          placeholder="First name (optional)"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full bg-bg-elev border border-line rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-brand"
        />
      )}
      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-bg-elev border border-line rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-bg px-4 py-2 text-sm font-medium hover:bg-brand transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {submitting ? '…' : 'Subscribe'}
        </button>
      </div>
      {needsCheck && (
        <div>
          <p className="text-ink-dim text-xs mb-2">One quick check and you&rsquo;re in.</p>
          <div ref={captchaEl} />
        </div>
      )}
      {error && <p className="text-brand text-xs">{error}</p>}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this blank
          <input type="text" name="vsp_s" tabIndex={-1} autoComplete="new-password" value={hp} onChange={(e) => setHp(e.target.value)} />
        </label>
      </div>
    </form>
  );
}
