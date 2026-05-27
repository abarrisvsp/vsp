'use server';
import { createServiceClient, createAnonClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { BlogPost } from '@/lib/types';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data as BlogPost[]) ?? [];
}

export async function getRecentPublishedPosts(limit = 2): Promise<BlogPost[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as BlogPost[]) ?? [];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) return null;
  return data as BlogPost;
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
  if (error) return null;
  return data as BlogPost;
}

export async function getAllPostsForAdmin(): Promise<BlogPost[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data as BlogPost[]) ?? [];
}

export async function createBlogPost(fields: Partial<BlogPost>): Promise<string> {
  await requireAdmin();
  const supabase = createServiceClient();
  const slug = fields.slug || slugify(fields.title || 'untitled-' + Date.now());
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: fields.title ?? 'Untitled',
      slug,
      date: fields.date ?? new Date().toISOString().slice(0, 10),
      category_tag: fields.category_tag ?? null,
      cover_image_url: fields.cover_image_url ?? null,
      cover_storage_path: fields.cover_storage_path ?? null,
      body_html: fields.body_html ?? '',
      excerpt: fields.excerpt ?? null,
      read_time_minutes: fields.read_time_minutes ?? null,
      published: fields.published ?? false,
    })
    .select('id')
    .single();
  if (error) throw error;
  revalidatePath('/blog');
  return data.id;
}

export async function updateBlogPost(id: string, fields: Partial<BlogPost>): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('blog_posts')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  revalidatePath('/blog');
  if (fields.slug) revalidatePath(`/blog/${fields.slug}`);
}

export async function deleteBlogPost(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/blog');
}
