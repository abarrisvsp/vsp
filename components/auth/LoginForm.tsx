'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { requestLoginCode } from '@/lib/actions/auth';

const inputClass =
  'w-full bg-bg-elev border border-line rounded px-3 py-2 text-ink focus:outline-none focus:border-brand';
const buttonClass =
  'w-full bg-ink text-bg font-medium py-2 rounded hover:bg-brand transition-colors disabled:opacity-50';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Default landing after login is the admin control room. If middleware
  // bumped a deeper page through callbackUrl (e.g. /about), respect that.
  const callbackUrl = params.get('callbackUrl') || '/admin';

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitting(true);
    setError(null);
    await requestLoginCode(email);
    setSubmitting(false);
    setStep('code');
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn('credentials', {
      email,
      code: code.trim(),
      remember: String(remember),
      redirect: false,
    });
    setSubmitting(false);
    if (result?.error) {
      setError('That code is invalid or expired. Request a new one below.');
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  if (step === 'email') {
    return (
      <form onSubmit={sendCode} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1">Email</label>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        {error && <p className="text-sm text-brand">{error}</p>}
        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? 'Sending…' : 'Email me a code'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verifyCode} className="w-full max-w-sm space-y-4">
      <p className="text-sm text-ink-mute">
        If that&rsquo;s the admin address, a 6-digit code is on its way to your inbox. It expires in
        10 minutes.
      </p>
      <div>
        <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1">Code</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          required
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          className={`${inputClass} tracking-[0.4em] text-center text-lg`}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-mute select-none cursor-pointer">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="accent-brand"
        />
        Stay signed in for 14 days
      </label>
      {error && <p className="text-sm text-brand">{error}</p>}
      <button type="submit" disabled={submitting} className={buttonClass}>
        {submitting ? 'Verifying…' : 'Sign in'}
      </button>
      <div className="flex justify-between text-xs text-ink-mute">
        <button
          type="button"
          onClick={() => {
            setStep('email');
            setCode('');
            setError(null);
          }}
          className="hover:text-ink underline"
        >
          Use a different email
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => sendCode()}
          className="hover:text-ink underline disabled:opacity-50"
        >
          Resend code
        </button>
      </div>
    </form>
  );
}
