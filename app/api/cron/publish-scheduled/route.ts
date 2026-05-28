// app/api/cron/publish-scheduled/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .update({ published: true })
    .eq('published', false)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .select('id, slug');

  if (error) {
    console.error('[cron] publish-scheduled error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const published = posts ?? [];
  console.log(`[cron] published ${published.length} scheduled posts`);

  revalidatePath('/blog');
  for (const post of published) {
    if (post.slug) revalidatePath(`/blog/${post.slug}`);
  }

  return NextResponse.json({ published: published.length, ids: published.map((p: { id: string }) => p.id) });
}
