'use client';
import { useState } from 'react';

export function SubscribeForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, first_name: firstName || undefined }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      return;
    }
    setMessage(data.message);
    setEmail('');
    setFirstName('');
  }

  if (message) {
    return <p className="text-brand text-sm">{message}</p>;
  }

  return (
    <form onSubmit={onSubmit} className={compact ? 'flex gap-2' : 'space-y-3 max-w-md'}>
      {!compact && (
        <input
          type="text"
          placeholder="First name (optional)"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full bg-bg-elev border border-line rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-brand"
        />
      )}
      <div className={compact ? 'flex gap-2 flex-1' : 'flex gap-2'}>
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
      {error && <p className="text-brand text-xs">{error}</p>}
    </form>
  );
}
