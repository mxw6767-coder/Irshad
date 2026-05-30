"use client";

import { useEffect, useMemo, useRef } from "react";
import type { useMessenger } from "@/features/messaging/use-messenger";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type MessengerState = ReturnType<typeof useMessenger>;

type Props = {
  messenger: MessengerState;
};

export function Composer({ messenger }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.style.setProperty("height", "auto");
  }, [messenger.composer.text]);

  const toolbar = useMemo(
    () => [
      { label: "Bold", insert: "**bold**" },
      { label: "Italic", insert: "_italic_" },
      { label: "Code", insert: "`code`" },
      { label: "Quote", insert: "> quote" },
    ],
    [],
  );

  const insertSnippet = (snippet: string) => {
    messenger.setComposer((current) => ({ ...current, text: `${current.text}${current.text ? " " : ""}${snippet}` }));
    textareaRef.current?.focus();
  };

  const counter = `${messenger.composer.text.length}/4000`;

  return (
    <footer className="border-t border-white/5 bg-[#0c0f14] px-4 py-4 md:px-6">
      <div className="mx-auto max-w-5xl">
        {messenger.composer.replyToId || messenger.composer.editMessageId ? (
          <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">
            {messenger.composer.editMessageId ? "Editing message" : "Replying to message"} ·{" "}
            <button className="underline decoration-white/30 underline-offset-4" onClick={() => messenger.setComposer((current) => ({ ...current, replyToId: undefined, editMessageId: undefined, quoteText: undefined }))}>
              clear
            </button>
            {messenger.composer.quoteText ? <div className="mt-2 text-white/50">{messenger.composer.quoteText}</div> : null}
          </div>
        ) : null}

        <div className="glass rounded-[28px] border border-white/10 bg-white/[0.03] p-3 shadow-glass">
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
            <div className="flex flex-wrap gap-2">
              {toolbar.map((item) => (
                <button
                  key={item.label}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10"
                  onClick={() => insertSnippet(item.insert)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs text-white/40">
              <span className={cn("rounded-full px-2 py-1", messenger.connectionState === "connected" ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300")}>
                {messenger.connectionState}
              </span>
              <span>{counter}</span>
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              <Textarea
                ref={textareaRef}
                value={messenger.composer.text}
                onChange={(event) => messenger.updateComposer(event.target.value)}
                onKeyDown={async (event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                    event.preventDefault();
                    await messenger.submitComposer(messenger.composer.text);
                  }
                  if (event.key === "Escape") {
                    messenger.setComposer((current) => ({ ...current, replyToId: undefined, editMessageId: undefined, quoteText: undefined }));
                  }
                }}
                placeholder="Write an encrypted message…"
                className="min-h-28 rounded-[24px] border border-white/10 bg-[#0a0c11] px-4 py-4 text-base text-white placeholder:text-white/30 focus:border-accent/60"
                aria-label="Message composer"
              />
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:bg-white/10" onClick={() => messenger.setToast("Emoji picker ready")}>Emoji</button>
                <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:bg-white/10" onClick={() => messenger.setToast("GIF picker ready")}>GIF</button>
                <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:bg-white/10" onClick={() => messenger.setToast("Stickers ready")}>Stickers</button>
                <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:bg-white/10" onClick={() => messenger.setToast("Attachment upload ready")}>Attach</button>
                <span className="ml-auto">Draft preserved locally</span>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 md:w-44">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-3 text-sm text-white/55">
                <div className="font-medium text-white/80">Quick actions</div>
                <ul className="mt-2 space-y-1">
                  <li>⌘/Ctrl + K search</li>
                  <li>⌘/Ctrl + Enter send</li>
                  <li>Esc clear preview</li>
                </ul>
              </div>
              <Button
                className="h-12 rounded-2xl text-base"
                onClick={async () => {
                  if (!messenger.composer.text.trim()) return;
                  await messenger.submitComposer(messenger.composer.text);
                }}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

