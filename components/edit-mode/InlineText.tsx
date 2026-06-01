'use client';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useEditMode } from './EditModeProvider';
import { updateSiteContent } from '@/lib/actions/content';
import { toast } from 'sonner';
import {
  parseBlockStyle,
  serializeBlockStyle,
  applyBlockStyle,
  type BlockStyle,
} from '@/lib/edit-mode/block-style';
import { BlockControls } from './BlockControls';

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'em' | 'strong';

// Read a contenteditable element as plain text, preserving paragraph/line breaks.
// Browsers represent Enter as <br>, <div>, or <p> inside contenteditable depending on
// the engine — textContent flattens all of them, so a typed-out paragraph break
// disappears on save. Walk the DOM and emit \n for <br> and block boundaries.
function extractPlainText(el: HTMLElement): string {
  const BLOCK = new Set(['DIV', 'P', 'LI', 'BLOCKQUOTE', 'PRE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
  let out = '';
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += (node as Text).data;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = (node as Element).tagName;
    if (tag === 'BR') { out += '\n'; return; }
    const isBlock = BLOCK.has(tag);
    // Ensure a newline before a block boundary (except at very start).
    if (isBlock && out.length > 0 && !out.endsWith('\n')) out += '\n';
    node.childNodes.forEach(walk);
    if (isBlock && !out.endsWith('\n')) out += '\n';
  };
  el.childNodes.forEach(walk);
  // Collapse 3+ consecutive newlines to 2 (a single blank line).
  return out.replace(/\n{3,}/g, '\n\n');
}

interface InlineTextProps {
  contentKey: string;
  defaultValue: string;
  tag?: Tag;
  className?: string;
  multiline?: boolean;
  revalidate?: string;
  styleValue?: string;
  clampMobileSize?: string;
}

export function InlineText({
  contentKey,
  defaultValue,
  tag = 'span',
  className = '',
  multiline = false,
  revalidate,
  styleValue,
  clampMobileSize,
}: InlineTextProps) {
  const { editMode, isAdmin, setIsEditing: setGlobalEditing } = useEditMode();
  const [value, setValue] = useState(defaultValue);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [style, setStyle] = useState<BlockStyle>(() => parseBlockStyle(styleValue));
  useEffect(() => {
    if (!editing) setStyle(parseBlockStyle(styleValue));
  }, [styleValue, editing]);
  const styledClassName = useMemo(
    () => applyBlockStyle(className, style, { heroClampMax: clampMobileSize }),
    [className, style, clampMobileSize],
  );
  const ref = useRef<HTMLElement | null>(null);
  const originalRef = useRef(defaultValue);

  // Keep displayed value in sync when defaultValue changes (e.g., after revalidate)
  useEffect(() => {
    if (!editing) {
      setValue(defaultValue);
      originalRef.current = defaultValue;
    }
  }, [defaultValue, editing]);

  const enterEdit = useCallback(() => {
    if (!editMode || editing) return;
    setEditing(true);
    setGlobalEditing(true);
    setTimeout(() => {
      if (!ref.current) return;
      ref.current.focus();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, 0);
  }, [editMode, editing, setGlobalEditing]);

  const exitEdit = useCallback(() => {
    setEditing(false);
    setGlobalEditing(false);
  }, [setGlobalEditing]);

  const handleCancel = useCallback(() => {
    if (ref.current) ref.current.textContent = originalRef.current;
    setValue(originalRef.current);
    setStyle(parseBlockStyle(styleValue));
    exitEdit();
  }, [exitEdit, styleValue]);

  const handleSave = useCallback(async () => {
    const newValue = (ref.current ? extractPlainText(ref.current) : value).trim();
    const contentChanged = newValue !== originalRef.current;
    const savedStyle = parseBlockStyle(styleValue);
    const styleChanged = serializeBlockStyle(style) !== serializeBlockStyle(savedStyle);
    if (!contentChanged && !styleChanged) {
      exitEdit();
      return;
    }
    setSaving(true);
    try {
      if (contentChanged) {
        await updateSiteContent(contentKey, newValue, revalidate);
        setValue(newValue);
        originalRef.current = newValue;
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
  }, [contentKey, value, revalidate, exitEdit, style, styleValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Enter' && !multiline) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleCancel, handleSave, multiline],
  );

  // Render plain element when not admin or not in edit mode
  if (!isAdmin || !editMode) {
    const Tag = tag as keyof JSX.IntrinsicElements;
    return <Tag className={styledClassName}>{value}</Tag>;
  }

  const Tag = tag as unknown as React.ComponentType<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement>; contentEditable?: boolean; suppressContentEditableWarning?: boolean }>;
  return (
    <span className="relative inline">
      <Tag
        ref={ref}
        data-inline-text=""
        data-editing={editing ? 'true' : 'false'}
        contentEditable={editing}
        suppressContentEditableWarning
        className={className}
        onClick={enterEdit}
        onKeyDown={handleKeyDown}
        onBlur={(e: React.FocusEvent) => {
          const next = e.relatedTarget as HTMLElement | null;
          if (next?.closest('[data-inline-text-actions]')) return;
          if (editing && !saving) handleCancel();
        }}
      >
        {value}
      </Tag>
      {editing && (
        <span
          data-inline-text-actions
          className="absolute left-0 top-full mt-1 flex flex-col gap-1 z-[10000] bg-bg-elev border border-line rounded shadow-lg p-1 max-md:fixed max-md:left-0 max-md:right-0 max-md:bottom-0 max-md:top-auto max-md:rounded-none max-md:mt-0 max-md:p-3 max-md:justify-center"
          contentEditable={false}
        >
          <BlockControls style={style} onChange={setStyle} />
          <span className="flex gap-1 justify-end">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCancel}
              disabled={saving}
              className="px-3 py-1 text-xs bg-neutral-600 text-white rounded hover:bg-neutral-500"
            >
              Cancel
            </button>
          </span>
        </span>
      )}
    </span>
  );
}
