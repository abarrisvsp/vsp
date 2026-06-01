'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import LinkExt from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Eraser,
  Pencil,
} from 'lucide-react';
import { useEditMode } from './EditModeProvider';
import { updateSiteContent } from '@/lib/actions/content';
import { toast } from 'sonner';
import { toHtml, stripOuterParagraph, resolveDisplayHtml, type DisplayTag } from './rich-text';
import {
  parseBlockStyle,
  serializeBlockStyle,
  applyBlockStyle,
  type BlockStyle,
} from '@/lib/edit-mode/block-style';
import { BlockControls } from './BlockControls';

interface InlineRichTextProps {
  contentKey: string;
  defaultValue: string;
  /** Element to render in display mode. Defaults to 'span' when inline, 'div' otherwise. */
  tag?: DisplayTag;
  /**
   * Inline mode = no block structure changes (no headings/lists/blockquotes), saved
   * HTML has the wrapping <p> stripped. Use for headlines, eyebrows, labels, short
   * single-thought fields where bullet lists or H2 would break the layout.
   * Block mode (default false) gives the full toolbar.
   */
  inline?: boolean;
  className?: string;
  revalidate?: string;
  /** JSON from `${contentKey}__style`; controls size/spacing/width. */
  styleValue?: string;
  /** Cap the rendered size on small screens (e.g. 'text-7xl' for hero headlines). */
  clampMobileSize?: string;
}

const COLORS: { label: string; value: string | null }[] = [
  { label: 'Reset', value: null },
  { label: 'Ink', value: '#f5f1ea' },
  { label: 'Ink dim', value: '#b8b1a4' },
  { label: 'Ink mute', value: '#7a7468' },
  { label: 'Amber', value: '#ef4444' },
  { label: 'Gold', value: '#d4a64a' },
  { label: 'Success', value: '#22c55e' },
  { label: 'White', value: '#ffffff' },
];

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`px-2 py-1.5 rounded text-xs transition-colors ${
        active ? 'bg-brand text-white' : 'bg-bg-elev hover:bg-line text-ink-dim'
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, inline }: { editor: Editor; inline: boolean }) {
  const setColor = (value: string | null) => {
    if (value === null) editor.chain().focus().unsetColor().run();
    else editor.chain().focus().setColor(value).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-line bg-bg-elev rounded-t">
      <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="w-3.5 h-3.5" />
      </ToolbarButton>

      {!inline && (
        <>
          <span className="w-px h-5 bg-line mx-1" />
          <ToolbarButton title="Heading 2 (large)" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton title="Heading 3 (medium)" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton title="Body paragraph" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>
            <span className="text-[10px] font-semibold leading-none">P</span>
          </ToolbarButton>
          <span className="w-px h-5 bg-line mx-1" />
          <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="w-3.5 h-3.5" />
          </ToolbarButton>
        </>
      )}

      <span className="w-px h-5 bg-line mx-1" />

      <ToolbarButton title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        <AlignLeft className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        <AlignCenter className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        <AlignRight className="w-3.5 h-3.5" />
      </ToolbarButton>

      <span className="w-px h-5 bg-line mx-1" />

      <div className="relative group">
        <ToolbarButton title="Color" onClick={() => {}}>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm border border-line" style={{ background: editor.getAttributes('textStyle')?.color || 'transparent' }} />
            <span className="text-[10px]">▾</span>
          </span>
        </ToolbarButton>
        <div className="hidden group-hover:flex group-focus-within:flex absolute z-[10001] top-full left-0 mt-1 flex-wrap gap-1 p-2 bg-bg-elev border border-line rounded shadow-lg w-40">
          {COLORS.map((c) => (
            <button
              key={c.label}
              type="button"
              title={c.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setColor(c.value)}
              className="w-6 h-6 rounded-sm border border-line"
              style={{
                background: c.value ?? 'transparent',
                backgroundImage: c.value ? undefined : 'repeating-linear-gradient(45deg, #555 0 2px, transparent 2px 4px)',
              }}
            />
          ))}
        </div>
      </div>

      <ToolbarButton
        title="Link"
        active={editor.isActive('link')}
        onClick={() => {
          const previous = editor.getAttributes('link').href as string | undefined;
          const url = window.prompt('URL (leave blank to remove):', previous ?? 'https://');
          if (url === null) return;
          if (url === '') {
            editor.chain().focus().unsetLink().run();
          } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }
        }}
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
        <Eraser className="w-3.5 h-3.5" />
      </ToolbarButton>
    </div>
  );
}

export function InlineRichText({
  contentKey,
  defaultValue,
  tag,
  inline = false,
  className = '',
  revalidate,
  styleValue,
  clampMobileSize,
}: InlineRichTextProps) {
  const { editMode, isAdmin, setIsEditing: setGlobalEditing } = useEditMode();
  const [html, setHtml] = useState<string>(() => toHtml(defaultValue, inline));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setHtml(toHtml(defaultValue, inline));
  }, [defaultValue, inline, editing]);

  const [style, setStyle] = useState<BlockStyle>(() => parseBlockStyle(styleValue));
  useEffect(() => {
    if (!editing) setStyle(parseBlockStyle(styleValue));
  }, [styleValue, editing]);

  const styledClassName = useMemo(
    () => applyBlockStyle(className, style, { heroClampMax: clampMobileSize }),
    [className, style, clampMobileSize],
  );

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure(
          inline
            ? {
                heading: false,
                bulletList: false,
                orderedList: false,
                listItem: false,
                blockquote: false,
                codeBlock: false,
                horizontalRule: false,
              }
            : {},
        ),
        Underline,
        TextStyle,
        Color,
        LinkExt.configure({ openOnClick: false }),
        TextAlign.configure({ types: inline ? ['paragraph'] : ['heading', 'paragraph'] }),
      ],
      content: html || '<p></p>',
      editable: editing,
      editorProps: {
        attributes: { class: `focus:outline-none ${className}` },
      },
      immediatelyRender: false,
    },
    [inline],
  );

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editing);
    if (!editing) {
      const current = editor.getHTML();
      if (current !== html) editor.commands.setContent(html || '<p></p>', { emitUpdate: false });
    }
  }, [editor, editing, html]);

  const enterEdit = useCallback(() => {
    if (!editMode || editing || !editor) return;
    setEditing(true);
    setGlobalEditing(true);
    setTimeout(() => editor.commands.focus('end'), 0);
  }, [editMode, editing, editor, setGlobalEditing]);

  const exitEdit = useCallback(() => {
    setEditing(false);
    setGlobalEditing(false);
  }, [setGlobalEditing]);

  const handleCancel = useCallback(() => {
    if (editor) editor.commands.setContent(html || '<p></p>', { emitUpdate: false });
    setStyle(parseBlockStyle(styleValue));
    exitEdit();
  }, [editor, html, exitEdit, styleValue]);

  const handleSave = useCallback(async () => {
    if (!editor) return;
    let next = editor.getHTML();
    if (inline) next = stripOuterParagraph(next);
    const contentChanged = !(next === html || next === stripOuterParagraph(html));
    const savedStyle = parseBlockStyle(styleValue);
    const styleChanged = serializeBlockStyle(style) !== serializeBlockStyle(savedStyle);
    if (!contentChanged && !styleChanged) {
      exitEdit();
      return;
    }
    setSaving(true);
    try {
      if (contentChanged) {
        await updateSiteContent(contentKey, next, revalidate);
        setHtml(inline ? toHtml(next, true) : next);
      }
      if (styleChanged) {
        await updateSiteContent(`${contentKey}__style`, serializeBlockStyle(style), revalidate);
      }
      toast.success('Saved');
      exitEdit();
    } catch (e) {
      console.error(e);
      toast.error('Save failed — try again');
    } finally {
      setSaving(false);
    }
  }, [editor, inline, html, contentKey, revalidate, exitEdit, style, styleValue]);

  // What HTML to actually paint into the display element. resolveDisplayHtml strips
  // the wrapping <p> when the wrapper is text-level (p/h1–h4/span) so we never nest
  // a <p> inside a <p> (which breaks SSR hydration).
  const wrapperTag = tag ?? (inline ? 'span' : 'div');
  const displayHtml = resolveDisplayHtml(html, { inline, tag: wrapperTag });
  const Wrapper = wrapperTag as keyof JSX.IntrinsicElements;
  const wrapperClass = `inline-rich-display ${inline ? 'inline-rich-inline' : ''} ${styledClassName}`.trim();

  if (!isAdmin || !editMode) {
    return <Wrapper className={wrapperClass} dangerouslySetInnerHTML={{ __html: displayHtml }} />;
  }

  if (!editing) {
    return (
      <span className="relative inline-block group max-w-full">
        <Wrapper
          className={`${wrapperClass} cursor-text rounded outline-1 outline-dashed outline-brand outline-offset-4`}
          onClick={enterEdit}
          dangerouslySetInnerHTML={{ __html: displayHtml || (inline ? 'Click to edit…' : '<p class="opacity-50">Click to edit…</p>') }}
        />
        <button
          type="button"
          onClick={enterEdit}
          className="absolute -top-2 -right-2 bg-brand text-white text-[10px] px-1.5 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10"
          aria-label="Edit"
        >
          <Pencil className="w-3 h-3" /> Edit
        </button>
      </span>
    );
  }

  return (
    <span className="relative inline-block border border-brand rounded bg-bg shadow-lg max-w-full">
      {editor && <Toolbar editor={editor} inline={inline} />}
      <EditorContent editor={editor} className={`p-3 ${className}`} />
      <BlockControls style={style} onChange={setStyle} />
      <span className="flex items-center justify-end gap-2 border-t border-line p-2 bg-bg-elev rounded-b">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="px-3 py-1 text-xs bg-neutral-600 text-white rounded hover:bg-neutral-500"
        >
          Cancel
        </button>
      </span>
    </span>
  );
}
