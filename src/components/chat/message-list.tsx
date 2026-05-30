"use client";

import { useMemo } from "react";
import type { useMessenger } from "@/features/messaging/use-messenger";
import { cn } from "@/lib/utils";

type MessengerState = ReturnType<typeof useMessenger>;

type Props = {
  messenger: MessengerState;
  highlightedMessages: Array<MessengerState["messages"][number] & { highlighted: boolean }>;
};

export function MessageList({ messenger, highlightedMessages }: Props) {
  const grouped = useMemo(() => {
    const items: Array<{ label: string; messages: typeof highlightedMessages }> = [];
    let pending: typeof highlightedMessages = [];

    for (const message of highlightedMessages) {
      if (message.type === "separator") {
        if (pending.length) items.push({ label: "group", messages: pending });
        items.push({ label: message.displayText ?? "Separator", messages: [message] });
        pending = [];
        continue;
      }
      pending.push(message);
    }

    if (pending.length) items.push({ label: "group", messages: pending });
    return items;
  }, [highlightedMessages]);

  return (
    <div
      ref={messenger.messageListRef}
      className="flex-1 overflow-y-auto px-4 py-5 md:px-6"
      aria-label="Message history"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3">
        <div className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/55">
          <span>Encrypted conversation — the server only relays ciphertext</span>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/5 px-2 py-1">Search highlights</span>
            <span className="rounded-full bg-white/5 px-2 py-1">Unread separators</span>
          </div>
        </div>

        {grouped.map((group, groupIndex) =>
          group.messages.map((message, messageIndex) => {
            if (message.type === "separator") {
              return (
                <div key={message.id} className="flex items-center gap-3 py-2 text-xs text-white/40">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{message.displayText}</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              );
            }

            const mine = message.senderId === messenger.activeUser;
            const highlighted = message.highlighted;

            return (
              <article
                key={message.id}
                className={cn("group relative flex", mine ? "justify-end" : "justify-start")}
                onContextMenu={(event) => {
                  event.preventDefault();
                  messenger.setSelectedMessageId(message.id);
                }}
              >
                <div
                  className={cn(
                    "relative max-w-[86%] rounded-[28px] border px-4 py-3 shadow-glass transition md:max-w-[72%]",
                    mine ? "border-accent/20 bg-accent/15" : "border-white/5 bg-white/[0.04]",
                    highlighted ? "ring-1 ring-cyanAccent/70" : "",
                  )}
                >
                  <div className="absolute -top-3 right-3 flex gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                    <button className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px]" onClick={() => messenger.startReply(message.id)}>Reply</button>
                    <button className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px]" onClick={() => messenger.startEdit(message.id)}>Edit</button>
                    <button className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px]" onClick={() => messenger.togglePin(message.id)}>Pin</button>
                    <button className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px]" onClick={() => messenger.deleteMessage(message.id)}>Delete</button>
                    <button className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px]" onClick={() => messenger.setToast("Copied message")}>Copy</button>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-white/45">
                        <span className="rounded-full bg-white/5 px-2 py-1">{mine ? "You" : messenger.activeConversation.title}</span>
                        {message.pinned ? <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-yellow-200">Pinned</span> : null}
                        {message.starred ? <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-cyan-200">Starred</span> : null}
                        {message.editedAt ? <span className="rounded-full bg-white/5 px-2 py-1">edited</span> : null}
                        {message.replyToId ? <span className="rounded-full bg-white/5 px-2 py-1">reply</span> : null}
                      </div>

                      {message.quotedText ? (
                        <div className="mb-3 rounded-2xl border-l-2 border-accent/70 bg-black/20 px-3 py-2 text-sm text-white/65">
                          {message.quotedText}
                        </div>
                      ) : null}

                      <p className={cn("whitespace-pre-wrap text-[15px] leading-7", message.deletedAt ? "italic text-white/45" : "text-white/90")}>
                        {message.deletedAt ? "message removed" : message.displayText ?? message.plaintextPreview ?? "Encrypted message"}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/40">
                        {message.status === "READ" ? <span className="text-cyan-200">Read</span> : null}
                        {message.status === "DELIVERED" ? <span className="text-emerald-200">Delivered</span> : null}
                        {message.status === "SENT" ? <span className="text-white/45">Sent</span> : null}
                        {message.deliveredAt ? <span>delivered {message.deliveredAt}</span> : null}
                        {message.readAt ? <span>read {message.readAt}</span> : null}
                        {message.sentAt ? <span>{message.sentAt}</span> : null}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          }),
        )}
      </div>
    </div>
  );
}
