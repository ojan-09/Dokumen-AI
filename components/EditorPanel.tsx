'use client';

import { useEffect, useMemo } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlock from '@tiptap/extension-code-block';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Code,
  Table as TableIcon,
  Heading1,
  CloudCheck,
  Cloud,
} from 'lucide-react';

import { useEditorStore } from '../store/useEditorStore';

export default function EditorPanel() {
  const {
    activeDocument,
    updateEditorContent,
    saveStatus,
    setSavingState,
  } = useEditorStore();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Mulai menulis...' }),
      CodeBlock,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: { class: 'max-w-full h-auto rounded-lg' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          class: 'text-blue-600 no-underline hover:underline',
        },
      }),
    ],
    content: activeDocument?.content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      updateEditorContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (activeDocument) {
      editor?.commands.setContent(activeDocument.content);
    }
  }, [activeDocument, editor]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!activeDocument) return;
      if (saveStatus !== 'saving') return;

      setSavingState('saving');

      await fetch(`/api/documents/${activeDocument.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editor?.getHTML() || '',
          title: activeDocument.title,
        }),
      });

      setSavingState('saved');
    }, 1200);

    return () => clearTimeout(timeout);
  }, [editor?.getHTML(), activeDocument, saveStatus, setSavingState]);

  const toolbarButtons = useMemo(
    () => [
      {
        icon: Heading1,
        label: 'H1',
        action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: () => editor?.isActive('heading', { level: 1 }) ?? false,
      },
      {
        icon: Bold,
        label: 'Bold',
        action: () => editor?.chain().focus().toggleBold().run(),
        isActive: () => editor?.isActive('bold') ?? false,
      },
      {
        icon: Italic,
        label: 'Italic',
        action: () => editor?.chain().focus().toggleItalic().run(),
        isActive: () => editor?.isActive('italic') ?? false,
      },
      {
        icon: UnderlineIcon,
        label: 'Underline',
        action: () => editor?.chain().focus().toggleUnderline().run(),
        isActive: () => editor?.isActive('underline') ?? false,
      },
      {
        icon: List,
        label: 'Bullet',
        action: () => editor?.chain().focus().toggleBulletList().run(),
        isActive: () => editor?.isActive('bulletList') ?? false,
      },
      {
        icon: ListOrdered,
        label: 'Bernomor',
        action: () => editor?.chain().focus().toggleOrderedList().run(),
        isActive: () => editor?.isActive('orderedList') ?? false,
      },
      {
        icon: Code,
        label: 'Kode',
        action: () => editor?.chain().focus().toggleCodeBlock().run(),
        isActive: () => editor?.isActive('codeBlock') ?? false,
      },
      {
        icon: TableIcon,
        label: 'Tabel',
        action: () =>
          editor?.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run(),
        isActive: () => false,
      },
    ],
    [editor]
  );

  const isSaving = saveStatus === 'saving';

  return (
    <section className="flex h-screen flex-col bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        {/* Doc title + save status */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <div>
            <p className="text-xs text-slate-400">Document</p>
            <h2 className="text-lg font-semibold text-slate-900 leading-tight">
              {activeDocument?.title || 'Dokumen'}
            </h2>
          </div>

          <div
            className={`
              inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium
              transition-colors
              ${isSaving
                ? 'bg-amber-50 text-amber-600'
                : 'bg-green-50 text-green-700'
              }
            `}
          >
            {isSaving
              ? <Cloud className="h-3.5 w-3.5" />
              : <CloudCheck className="h-3.5 w-3.5" />
            }
            {isSaving ? 'Menyimpan...' : 'Tersimpan'}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-4 pb-2">
          <select 
            suppressHydrationWarning
            className="mr-1 rounded px-2 py-1 text-xs text-slate-600 border border-slate-200 bg-white outline-none focus:border-blue-400 cursor-pointer"
          >
            <option>Normal teks</option>
            <option>Judul 1</option>
            <option>Judul 2</option>
            <option>Judul 3</option>
          </select>

          <div className="mx-1 h-5 w-px bg-slate-200" />

          {toolbarButtons.map((button, i) => {
            const Icon = button.icon;
            const active = button.isActive();

            return (
              <button
                suppressHydrationWarning
                key={button.label}
                type="button"
                onClick={button.action}
                title={button.label}
                className={`
                  inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs
                  transition-colors
                  ${active
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                  }
                  ${i === 3 ? 'mr-1' : ''}
                `}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{button.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor canvas */}
      <div className="flex-1 overflow-y-auto bg-[#f8f9fa] px-8 py-10">
        <div
          className="
            mx-auto max-w-[816px]
            bg-white
            px-[96px] py-[96px]
            shadow-[0_1px_4px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.06)]
          "
          style={{ minHeight: '1056px' }}
        >
          <EditorContent
            editor={editor}
            className="
              prose prose-slate
              max-w-none
              text-[15px]
              leading-[1.8]
              tracking-[0.01em]
              text-slate-800
              focus:outline-none
              [&_.ProseMirror]:outline-none
              [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-300
              [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
              [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
              [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
            "
          />
        </div>
      </div>
    </section>
  );
}