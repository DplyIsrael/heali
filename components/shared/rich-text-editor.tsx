"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Min editor body height in px. Defaults to 300. */
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "הקלד/י כאן...",
  minHeight = 300,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Keep formatting tight — no horizontal rule / code block in the
        // toolbar means we don't need them in the schema either.
        horizontalRule: false,
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        dir: "rtl",
        lang: "he",
        class:
          "prose max-w-none focus:outline-none px-4 py-3 text-[15px] leading-relaxed text-foreground",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    // Required for Next.js 16 SSR.
    immediatelyRender: false,
  });

  // Keep editor in sync if the parent resets value (e.g. opening the "edit"
  // form after creating a new article).
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className="rounded-[10px] border border-border-input bg-white"
        style={{ minHeight }}
      />
    );
  }

  const handleAddLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("הזן/י כתובת קישור (השאר/י ריק להסרה):", prev ?? "");
    if (url === null) return; // user hit cancel
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  type ToolbarBtn = {
    icon: typeof Bold;
    label: string;
    onClick: () => void;
    isActive?: boolean;
  };
  const buttons: ToolbarBtn[] = [
    { icon: Bold, label: "מודגש", onClick: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive("bold") },
    { icon: Italic, label: "נטוי", onClick: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive("italic") },
    { icon: Heading2, label: "כותרת 2", onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive("heading", { level: 2 }) },
    { icon: Heading3, label: "כותרת 3", onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive("heading", { level: 3 }) },
    { icon: List, label: "רשימה", onClick: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive("bulletList") },
    { icon: ListOrdered, label: "רשימה ממוספרת", onClick: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive("orderedList") },
    { icon: Quote, label: "ציטוט", onClick: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive("blockquote") },
    { icon: LinkIcon, label: "קישור", onClick: handleAddLink, isActive: editor.isActive("link") },
    { icon: Undo, label: "בטל", onClick: () => editor.chain().focus().undo().run() },
    { icon: Redo, label: "בצע שוב", onClick: () => editor.chain().focus().redo().run() },
  ];

  return (
    <div className="rounded-[10px] border border-border-input bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border-input bg-[#f9f9f9] px-2 py-2">
        {buttons.map((b, i) => (
          <button
            key={i}
            type="button"
            onClick={b.onClick}
            title={b.label}
            aria-label={b.label}
            className={`flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors ${
              b.isActive
                ? "bg-accent text-black"
                : "text-foreground hover:bg-muted/30"
            }`}
          >
            <b.icon className="size-4" />
          </button>
        ))}
      </div>

      {/* Editor surface */}
      <div className="relative" style={{ minHeight }}>
        <EditorContent editor={editor} />
        {editor.isEmpty && (
          <div
            className="pointer-events-none absolute top-3 right-4 text-[15px] text-muted-foreground"
            aria-hidden="true"
          >
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
