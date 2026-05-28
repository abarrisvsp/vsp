// lib/actions/navigation.ts
'use server';
import { createServiceClient, createAnonClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { NavItem } from '@/lib/types';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');
}

/** Public read — used by Header server component */
export async function getVisibleNavItems(): Promise<NavItem[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('nav_items')
    .select('*')
    .eq('visible', true)
    .order('sort_order');
  if (error || !data || data.length === 0) return DEFAULT_NAV;
  return data as NavItem[];
}

/** Admin read — all items including hidden */
export async function getAllNavItems(): Promise<NavItem[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('nav_items')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return (data as NavItem[]) ?? [];
}

/** Save the full ordered set atomically.
 *  Deletes all rows, then inserts the new set.
 */
export async function saveNavigation(items: NavItem[]): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();

  // Delete all existing rows
  const { error: delError } = await supabase
    .from('nav_items')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // always-false condition = delete all
  if (delError) throw delError;

  // Insert new ordered set
  const rows = items.map((item, i) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    sort_order: i,
    visible: item.visible,
    is_custom: item.is_custom,
  }));
  const { error: insError } = await supabase.from('nav_items').insert(rows);
  if (insError) throw insError;

  revalidatePath('/', 'layout'); // re-render header everywhere
}

export async function addCustomNavItem(label: string, href: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: last } = await supabase
    .from('nav_items')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((last as any)?.sort_order ?? 0) + 1;
  const { error } = await supabase
    .from('nav_items')
    .insert({ label, href, sort_order, visible: true, is_custom: true });
  if (error) throw error;
  revalidatePath('/', 'layout');
}

const DEFAULT_NAV: NavItem[] = [
  { id: 'default-1', label: 'Home', href: '/', sort_order: 0, visible: true, is_custom: false },
  { id: 'default-2', label: 'Services', href: 'dropdown', sort_order: 1, visible: true, is_custom: false },
  { id: 'default-3', label: 'Gallery', href: '/gallery', sort_order: 2, visible: true, is_custom: false },
  { id: 'default-4', label: 'Journal', href: '/blog', sort_order: 3, visible: true, is_custom: false },
  { id: 'default-5', label: 'About', href: '/about', sort_order: 4, visible: true, is_custom: false },
  { id: 'default-6', label: 'Contact', href: '/contact', sort_order: 5, visible: true, is_custom: false },
];
