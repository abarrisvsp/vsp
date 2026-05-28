'use server';
import { createServiceClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { ContactSubmission } from '@/lib/types';

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

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');
}

export async function getSubmissions(archived = false): Promise<ContactSubmission[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .eq('archived', archived)
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return (data as ContactSubmission[]) ?? [];
}

export async function markSubmissionRead(id: string, read = true): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('contact_submissions').update({ read }).eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/inbox');
}

export async function archiveSubmission(id: string, archived = true): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('contact_submissions').update({ archived }).eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/inbox');
}

export async function updateSubmissionNotes(id: string, notes: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('contact_submissions').update({ notes }).eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/inbox');
}

export async function getRecentSubmissions(limit = 3): Promise<
  Pick<ContactSubmission, 'id' | 'full_name' | 'event_type' | 'read' | 'submitted_at'>[]
> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('id, full_name, event_type, read, submitted_at')
    .order('submitted_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
