import { createServiceClient } from '@/lib/supabase';
import type { Subscriber } from '@/lib/types';

/**
 * Every active subscriber. Supabase returns at most 1,000 rows per request, so
 * this reads in pages instead of trusting a single select to get them all.
 *
 * Deliberately NOT in a 'use server' file: anything exported from one becomes a
 * publicly callable endpoint. Callers must check admin access themselves.
 */
export async function fetchAllActiveSubscribers(): Promise<Subscriber[]> {
  const supabase = createServiceClient();
  const pageSize = 1000;
  const all: Subscriber[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('active', true)
      .order('subscribed_at', { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const rows = (data as Subscriber[]) ?? [];
    all.push(...rows);
    if (rows.length < pageSize) return all;
  }
}
