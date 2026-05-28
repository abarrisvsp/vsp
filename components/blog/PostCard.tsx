'use client';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Pencil } from 'lucide-react';
import type { BlogPost } from '@/lib/types';
import { useEditMode } from '@/components/edit-mode/EditModeProvider';

export function PostCard({ post }: { post: BlogPost }) {
  const { editMode } = useEditMode();
  return (
    <article className="relative group">
      <Link href={`/blog/${post.slug}`}>
        {post.cover_image_url && (
          <div className="relative aspect-[16/10] mb-4 overflow-hidden">
            <Image src={post.cover_image_url} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <div className="text-xs uppercase tracking-wider text-ink-mute mb-2">
          {post.category_tag} {post.date && <>· {format(new Date(post.date), 'MMM d, yyyy')}</>}
          {!post.published && <span className="ml-2 text-brand">DRAFT</span>}
        </div>
        <h3 className="font-serif italic text-2xl mb-2 group-hover:text-brand transition-colors">{post.title}</h3>
        {post.excerpt && <p className="text-ink-dim text-sm">{post.excerpt}</p>}
      </Link>
      {editMode && (
        <Link href={`/admin/blog/${post.id}`} className="absolute top-2 right-2 p-1 bg-bg-elev border border-line rounded opacity-0 group-hover:opacity-100 transition-opacity">
          <Pencil className="w-4 h-4" />
        </Link>
      )}
    </article>
  );
}
