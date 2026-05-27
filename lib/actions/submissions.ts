'use server';
import { createServiceClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';

export async function getUnreadSubmissionCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.isAdmin) return 0;
  const supabase = createServiceClient();
  const { count } = await supabase
    .from('contact_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)
    .eq('archived', false);
  return count ?? 0;
}
