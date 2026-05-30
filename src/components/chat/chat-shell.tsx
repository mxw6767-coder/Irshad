"use client";

import { useMemo } from "react";
import type { useMessenger } from "@/features/messaging/use-messenger";
import { ChatSidebar } from "@/components/chat/sidebar";
import { MessageList } from "@/components/chat/message-list";
import { Composer } from "@/components/chat/composer";
import { SettingsPanel } from "@/components/chat/settings-panel";
import { cn } from "@/lib/utils";

type MessengerState = ReturnType<typeof useMessenger>;

type Props = {
  messenger: MessengerState;
};

export function ChatShell({ messenger }: Props) {
  const highlightedMessages = useMemo(
    () =>
      messenger.messages.map((message) => ({
        ...message,
        highlighted: messenger.search ? (message.displayText ?? message.plaintextPreview ?? "").toLowerCase().includes(messenger.search.toLowerCase()) : false,
      })),
    [messenger.messages, messenger.search],
  );

  return (
    <main className="min-h-screen bg-[#0a0b0f] text-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[320px_1fr]">
        <ChatSidebar messenger={messenger} />
        <section className="relative flex min-h-screen flex-col border-l border-white/5 bg-gradient-to-b from-[#111318] via-[#0e1016] to-[#0b0d12]">
          <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0e1016]/90 px-5 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/35">
                  <span className={cn("h-2 w-2 rounded-full", messenger.connectionState === "connected" ? "bg-emerald-400" : "bg-amber-400")} />
                  <span>{messenger.connectionState}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 normal-case tracking-normal text-white/60">
                    {messenger.activeUser}
                  </span>
                </div>
                <h1 className="mt-2 truncate text-xl font-semibold md:text-2xl">{messenger.activeConversation.title}</h1>
                <p className="truncate text-sm text-white/50">
                  {messenger.activeConversation.status} · {messenger.activeConversation.presence}
                  {messenger.typingUser ? ` · ${messenger.typingUser} is typing` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent/70"
                  onClick={() => messenger.setShowSettings(true)}
                >
                  Settings
                </button>
                <button
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent/70"
                  onClick={() => messenger.toggleFavoriteConversation(messenger.activeConversationId)}
                >
                  {messenger.activeConversation.favorite ? "Unfavorite" : "Favorite"}
                </button>
              </div>
            </div>
          </header>

          <MessageList messenger={messenger} highlightedMessages={highlightedMessages} />

          <Composer messenger={messenger} />

          {messenger.showScrollToBottom ? (
            <button
              className="absolute bottom-28 right-5 rounded-full border border-white/10 bg-accent px-4 py-2 text-sm font-medium shadow-lg shadow-black/30 transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => messenger.markViewed()}
            >
              Jump to latest
            </button>
          ) : null}

          {messenger.showSettings ? <SettingsPanel messenger={messenger} /> : null}
        </section>
      </div>
    </main>
  );
}

