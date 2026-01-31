"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import Link from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

/* 🔥 CUSTOM EXTENSIONS (CRITICAL) */
import { FontSize } from "./extensions/FontSize";
import { LineHeight } from "./extensions/LineHeight";

/* ==================================================
   TYPES
================================================== */

interface ProductDescriptionEditorProps {
  value: string;
  onChange: (html: string) => void;
}

/* ==================================================
   COMPONENT
================================================== */

export default function ProductDescriptionEditor({
  value,
  onChange,
}: ProductDescriptionEditorProps) {
  /**
   * Prevent infinite loops between:
   * TipTap → onUpdate → API → parent → value → TipTap
   */
  const lastEmittedHTML = useRef<string>("");

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            style: "margin-bottom: 1em;",
          },
        },
      }),

      Heading.configure({
        levels: [1, 2, 3, 4],
      }),

      /* 🔑 TEXT STYLE CORE */
      TextStyle,
      Color,
      FontFamily,
      FontSize,     // ✅ REQUIRED
      LineHeight,   // ✅ REQUIRED

      Highlight.configure({
        multicolor: true,
      }),

      Underline,
      Subscript,
      Superscript,

      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    content: value || "",

    onUpdate({ editor }) {
      const html = editor.getHTML();

      if (html !== lastEmittedHTML.current) {
        lastEmittedHTML.current = html;
        onChange(html);
      }
    },
  });

  /* ==================================================
     SYNC EXTERNAL VALUE → EDITOR
  ================================================== */

  useEffect(() => {
    if (!editor) return;

    const incoming = typeof value === "string" ? value : "";

    if (incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming, {
        emitUpdate: false,
      });
      lastEmittedHTML.current = incoming;
    }
  }, [value, editor]);

  if (!editor) return null;

  /* ==================================================
     HELPERS
  ================================================== */

  const setFontSize = (size: string) => {
    if (!size) return;

    editor
      .chain()
      .focus()
      .setMark("textStyle", { fontSize: size })
      .run();
  };

  const setLineHeight = (lineHeight: string) => {
    if (!lineHeight) return;

    editor
      .chain()
      .focus()
      .setMark("textStyle", { lineHeight })
      .run();
  };

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <div className="admin-editor">
      {/* ================= TOOLBAR ================= */}
      <div className="admin-editor-toolbar">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          I
        </button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
          U
        </button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()}>
          S
        </button>

        <span className="editor-sep" />

        <button onClick={() => editor.commands.setTextAlign("left")}>⬅</button>
        <button onClick={() => editor.commands.setTextAlign("center")}>⬌</button>
        <button onClick={() => editor.commands.setTextAlign("right")}>➡</button>

        <span className="editor-sep" />

        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          •
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1.
        </button>

        <span className="editor-sep" />

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </button>

        <span className="editor-sep" />

        <select
          onChange={(e) =>
            editor.chain().focus().setFontFamily(e.target.value).run()
          }
        >
          <option value="">Font</option>
          <option value="Inter">Inter</option>
          <option value="Manrope">Manrope</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times</option>
        </select>

        <select onChange={(e) => setFontSize(e.target.value)}>
          <option value="">Size</option>
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
          <option value="32px">32</option>
        </select>

        <select onChange={(e) => setLineHeight(e.target.value)}>
          <option value="">Line</option>
          <option value="1.2">Tight</option>
          <option value="1.5">Normal</option>
          <option value="1.8">Relaxed</option>
          <option value="2">Loose</option>
        </select>

        <input
          type="color"
          title="Text color"
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
        />

        <input
          type="color"
          title="Highlight"
          onChange={(e) =>
            editor
              .chain()
              .focus()
              .toggleHighlight({ color: e.target.value })
              .run()
          }
        />

        <button onClick={() => editor.chain().focus().toggleSubscript().run()}>
          x₂
        </button>
        <button onClick={() => editor.chain().focus().toggleSuperscript().run()}>
          x²
        </button>
      </div>

      {/* ================= EDITOR ================= */}
      <EditorContent
        editor={editor}
        className="admin-editor-content"
      />
    </div>
  );
}
