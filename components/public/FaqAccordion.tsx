// components/public/FaqAccordion.tsx
'use client';

import { useState } from 'react';
import type { Faq } from '@/lib/types';

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (faqs.length === 0) return null;

  return (
    <div className="space-y-2">
      {faqs.map((faq) => (
        <div key={faq.id} className="border border-line rounded overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
            className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-bg-soft transition-colors"
          >
            <span className="font-medium text-sm text-ink">{faq.question}</span>
            <span className="text-ink-mute text-lg shrink-0">
              {openId === faq.id ? '−' : '+'}
            </span>
          </button>
          {openId === faq.id && (
            <div className="px-5 pb-4 text-sm text-ink-dim leading-relaxed border-t border-line">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
