'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import ImageExt from '@tiptap/extension-image';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '@/lib/actions/upload';
import { toast } from 'sonner';

export function TiptapEditor({ initialHtml, onChange }: { initialHtml: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      ImageExt,
    ],
    content: initialHtml || '<p>Write your story…</p>',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  async function handleImageInsert() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'blog');
      try {
        const { publicUrl } = await uploadImage(fd);
        editor!.chain().focus().setImage({ src: publicUrl }).run();
      } catch {
        toast.error('Image upload failed');
      }
    };
    input.click();
  }

  function handleLink() {
    const url = prompt('URL:');
    if (url) editor!.chain().focus().setLink({ href: url }).run();
    else editor!.chain().focus().unsetLink().run();
  }

  const btn = (active: boolean) => `p-2 rounded ${active ? 'bg-brand text-white' : 'bg-bg-elev hover:bg-line text-ink-dim'}`;

  return (
    <div className="border border-line rounded">
      <div className="flex gap-1 p-2 border-b border-line flex-wrap">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))}><Bold className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))}><Italic className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))}><Heading2 className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))}><Heading3 className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))}><List className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))}><ListOrdered className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))}><Quote className="w-4 h-4" /></button>
        <button type="button" onClick={handleLink} className={btn(editor.isActive('link'))}><LinkIcon className="w-4 h-4" /></button>
        <button type="button" onClick={handleImageInsert} className={btn(false)}><ImageIcon className="w-4 h-4" /></button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
