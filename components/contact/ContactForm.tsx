'use client';
import { useState } from 'react';

const SERVICES = ['Lighting design', 'Sound system', 'Staging', 'LED video wall', 'Live streaming', 'Décor lighting', 'Special FX', 'Not sure yet'];
const EVENT_TYPES = ['Wedding', 'Mitzvah', 'School / prom', 'Corporate / gala', 'Concert / festival', 'AV install', 'Rental only', 'Something else'];
const HEADCOUNTS = ['Under 50', '50–150', '150–500', '500–1,500', '1,500+', 'Not sure'];
const BUDGETS = ['Under $5k', '$5k–$15k', '$15k–$40k', '$40k–$100k', '$100k+', 'Not sure'];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    event_type: '',
    services_needed: [] as string[],
    event_date: '',
    date_flexible: false,
    headcount: '',
    venue_city: '',
    budget_range: '',
    full_name: '',
    email: '',
    phone: '',
    preferred_contact: 'email',
    message: '',
  });

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function toggleService(s: string) {
    setForm((f) => ({
      ...f,
      services_needed: f.services_needed.includes(s)
        ? f.services_needed.filter((x) => x !== s)
        : [...f.services_needed, s],
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-line p-12 text-center bg-bg-elev">
        <h3 className="font-serif italic text-3xl mb-4">Got it.</h3>
        <p className="text-ink-dim">Aaron will be in touch within one business day — usually sooner.</p>
      </div>
    );
  }

  const chip = (active: boolean) => `cursor-pointer px-3 py-1.5 text-sm border ${active ? 'border-brand text-brand bg-brand/10' : 'border-line text-ink-dim hover:border-brand/50'}`;
  const input = 'w-full bg-bg-elev border border-line rounded px-3 py-2 text-ink focus:outline-none focus:border-brand';
  const label = 'block text-xs uppercase tracking-wider text-ink-mute mb-2';

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <fieldset>
        <legend className={label}>What kind of event?</legend>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((t) => (
            <label key={t} className={chip(form.event_type === t)}>
              <input type="radio" name="event_type" value={t} checked={form.event_type === t} onChange={() => set('event_type', t)} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={label}>What are you thinking about? <span className="text-ink-mute">Pick as many as apply.</span></legend>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <label key={s} className={chip(form.services_needed.includes(s))}>
              <input type="checkbox" checked={form.services_needed.includes(s)} onChange={() => toggleService(s)} className="sr-only" />
              {s}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className={label}>Event date</label>
          <input type="date" value={form.event_date} onChange={(e) => set('event_date', e.target.value)} className={input} />
          <label className="flex items-center gap-2 text-xs mt-2 text-ink-dim">
            <input type="checkbox" checked={form.date_flexible} onChange={(e) => set('date_flexible', e.target.checked)} />
            Date is flexible
          </label>
        </div>
        <div>
          <label className={label}>Approx. headcount</label>
          <select value={form.headcount} onChange={(e) => set('headcount', e.target.value)} className={input}>
            <option value="">Select…</option>
            {HEADCOUNTS.map((h) => <option key={h}>{h}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Venue or city <span className="text-ink-mute">If known.</span></label>
        <input value={form.venue_city} onChange={(e) => set('venue_city', e.target.value)} placeholder="e.g. Detroit Athletic Club" className={input} />
      </div>

      <fieldset>
        <legend className={label}>Approximate budget</legend>
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((b) => (
            <label key={b} className={chip(form.budget_range === b)}>
              <input type="radio" name="budget" value={b} checked={form.budget_range === b} onChange={() => set('budget_range', b)} className="sr-only" />
              {b}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className={label}>Full name *</label>
          <input required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} className={input} />
        </div>
        <div>
          <label className={label}>Email *</label>
          <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={input} />
        </div>
        <div>
          <label className={label}>Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={input} />
        </div>
        <div>
          <label className={label}>Preferred contact</label>
          <select value={form.preferred_contact} onChange={(e) => set('preferred_contact', e.target.value)} className={input}>
            <option value="email">Email</option>
            <option value="phone">Phone call</option>
            <option value="text">Text message</option>
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Anything else?</label>
        <textarea value={form.message} onChange={(e) => set('message', e.target.value)} rows={5} className={input} placeholder="Tell us about the event, the venue, the vibe…" />
      </div>

      {error && <p className="text-brand text-sm">{error}</p>}

      <button type="submit" disabled={submitting} className="bg-ink text-bg px-8 py-3 font-medium hover:bg-brand transition-colors disabled:opacity-50">
        {submitting ? 'Sending…' : 'Send it over →'}
      </button>
    </form>
  );
}
