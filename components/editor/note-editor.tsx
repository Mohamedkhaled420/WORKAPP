"use client";

import { useState, useTransition } from "react";

import { EditorContent, type Content, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { updateNote } from "@/app/notes/actions";
import type { AiTransformAction } from "@/lib/ai/transform";

export function NoteEditor({
  noteId,
  initialTitle,
  initialContent,
}: {
  noteId: string;
  initialTitle: string;
  initialContent: Content | null;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Placeholder.configure({
        placeholder: "Start writing…",
      }),
    ],
    content: (initialContent ?? "") as Content,
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc max-w-none focus:outline-none min-h-[50vh] px-2 py-4",
      },
    },
  });

  async function runTransform(action: AiTransformAction) {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) return;

    const selectedText = editor.state.doc.textBetween(from, to, " ");

    setStatus(null);

    try {
      const res = await fetch("/api/ai/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text: selectedText }),
      });

      if (!res.ok) {
        setStatus("AI request failed.");
        return;
      }

      const json = (await res.json()) as { result?: string };
      const result = json.result?.trim();

      if (!result) {
        setStatus("No AI output.");
        return;
      }

      editor.chain().focus().insertContentAt({ from, to }, result).run();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "AI request failed.");
    }
  }

  return (
    <div className="space-y-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-base font-medium"
        placeholder="Untitled"
      />

      <div className="rounded-xl border bg-card">
        {editor ? (
          <BubbleMenu
            editor={editor}
            shouldShow={({ editor: ed }) => !ed.state.selection.empty}
          >
            <div className="flex gap-1 rounded-md border bg-background p-1 shadow-sm">
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => runTransform("simplify")}
              >
                Simplify
              </Button>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => runTransform("fix_grammar")}
              >
                Fix grammar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => runTransform("summarize")}
              >
                Summarize
              </Button>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => runTransform("action_items")}
              >
                Action items
              </Button>
            </div>
          </BubbleMenu>
        ) : null}

        <EditorContent editor={editor} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={!editor || isSaving}
          onClick={() => {
            if (!editor) return;
            setStatus(null);

            startSaving(async () => {
              const res = await updateNote(noteId, {
                title: title.trim() || "Untitled",
                content: editor.getHTML(),
              });

              if (!res.ok) {
                setStatus(res.error);
                return;
              }

              setStatus("Saved.");
            });
          }}
        >
          Save
        </Button>

        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </div>
    </div>
  );
}
