'use server';
import { createServiceClient, createAnonClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { BlogPost, Subscriber } from '@/lib/types';
import { slugify } from '@/lib/slugify';

export type BroadcastSummary = {
  sent: number;
  scheduled: number;
  lastScheduledFor: string | null;
};

async function broadcastPostToSubscribers(id: string): Promise<BroadcastSummary> {
  const supabase = createServiceClient();
  const { data: post } = await supabase.from('blog_posts').select('*').eq('id', id).maybeSingle();
  const { data: subs } = await supabase.from('subscribers').select('*').eq('active', true);
  if (!post || !subs || subs.length === 0) {
    return { sent: 0, scheduled: 0, lastScheduledFor: null };
  }
  const { sendPostBroadcast } = await import('@/lib/email/post-broadcast');
  const result = await sendPostBroadcast(post as BlogPost, subs as Subscriber[]);
  await supabase
    .from('blog_posts')
    .update({ subscribers_emailed_at: new Date().toISOString() })
    .eq('id', id);
  return {
    sent: result.sent,
    scheduled: result.scheduled,
    lastScheduledFor: result.lastScheduledFor,
  };
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');
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

export async function createBlogPost(
  fields: Partial<BlogPost>
): Promise<{ id: string; broadcast?: BroadcastSummary }> {
  await requireAdmin();
  const supabase = createServiceClient();
  const slug = fields.slug || slugify(fields.title || 'untitled-' + Date.now());
  const emailSubscribers = fields.email_subscribers ?? true;
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
      published_at: fields.published_at ?? null,
      email_subscribers: emailSubscribers,
    })
    .select('id')
    .single();
  if (error) throw error;
  revalidatePath('/blog');

  let broadcast: BroadcastSummary | undefined;
  if (fields.published === true && emailSubscribers) {
    try {
      broadcast = await broadcastPostToSubscribers(data.id);
    } catch (e) {
      console.error('Subscriber broadcast failed on create (post saved anyway)', e);
    }
  }

  return { id: data.id, broadcast };
}

export async function updateBlogPost(
  id: string,
  fields: Partial<BlogPost>
): Promise<{ updated: boolean; broadcast?: BroadcastSummary }> {
  await requireAdmin();
  const supabase = createServiceClient();

  // Get current state to detect publish transition
  const { data: current } = await supabase
    .from('blog_posts')
    .select('published, subscribers_emailed_at')
    .eq('id', id)
    .maybeSingle();
  const wasPublished = current?.published === true;
  const willBePublished = fields.published === true;
  const isFirstPublish = !wasPublished && willBePublished && !current?.subscribers_emailed_at;

  const { error } = await supabase
    .from('blog_posts')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;

  revalidatePath('/blog');
  if (fields.slug) revalidatePath(`/blog/${fields.slug}`);

  // Auto-send on first publish (unless email_subscribers is explicitly false)
  let broadcast: BroadcastSummary | undefined;
  const shouldEmail = isFirstPublish && (fields.email_subscribers ?? true);
  if (shouldEmail) {
    try {
      broadcast = await broadcastPostToSubscribers(id);
    } catch (e) {
      console.error('Subscriber broadcast failed (post saved anyway)', e);
    }
  }

  return { updated: true, broadcast };
}

/**
 * Send the post's announcement email to a few explicit test addresses only.
 * Does not touch the subscriber list or mark the post as emailed, so it's safe
 * to run repeatedly while testing. Sends the SAVED version of the post.
 */
export async function sendTestBlogEmail(
  id: string,
  emails: string[]
): Promise<{ sent: number; failed: number; errors: string[] }> {
  await requireAdmin();
  const clean = Array.from(
    new Set(
      emails
        .map((e) => e.trim().toLowerCase())
        .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
    )
  ).slice(0, 10); // hard cap so this can never be used to blast the world
  if (clean.length === 0) {
    return { sent: 0, failed: 0, errors: ['No valid email addresses provided.'] };
  }
  const supabase = createServiceClient();
  const { data: post } = await supabase.from('blog_posts').select('*').eq('id', id).maybeSingle();
  if (!post) return { sent: 0, failed: clean.length, errors: ['Post not found.'] };

  const { sendTestPostBroadcast } = await import('@/lib/email/post-broadcast');
  return sendTestPostBroadcast(post as BlogPost, clean);
}

export async function deleteBlogPost(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/blog');
}

export async function getScheduledPostsCount(): Promise<number> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('published', false)
    .not('published_at', 'is', null);
  return count ?? 0;
}

/**
 * Called by the cron handler for posts that went live via scheduled publish.
 * Only broadcasts if the post has email_subscribers=true and hasn't been emailed yet.
 */
export async function broadcastScheduledPostIfNeeded(id: string): Promise<void> {
  const supabase = createServiceClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('id, email_subscribers, subscribers_emailed_at')
    .eq('id', id)
    .maybeSingle();
  if (!post) return;
  if (!post.email_subscribers) return;
  if (post.subscribers_emailed_at) return; // already sent
  await broadcastPostToSubscribers(id);
}
