"use client";

import type { useMessenger } from "@/features/messaging/use-messenger";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MessengerState = ReturnType<typeof useMessenger>;

type Props = {
  messenger: MessengerState;
};

export function ChatSidebar({ messenger }: Props) {
  return (
    <aside className="flex min-h-screen flex-col border-r border-white/5 bg-[#0b0d12]">
      <div className="border-b border-white/5 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/35">Irshad</p>
            <h2 className="mt-2 text-2xl font-semibold">Private Messages</h2>
          </div>
          <button
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10"
            onClick={() => messenger.setShowSettings(true)}
          >
            Settings
          </button>
        </div>
      </div>

      <div className="space-y-3 border-b border-white/5 px-4 py-4">
        <div className="grid grid-cols-2 gap-2">
          {(["Cat", "Fox"] as const).map((user) => (
            <button
              key={user}
              className={cn(
                "rounded-2xl border px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-accent/70",
                messenger.activeUser === user ? "border-accent/50 bg-accent/15" : "border-white/10 bg-white/5 hover:bg-white/10",
              )}
              onClick={() => messenger.setActiveUser(user)}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{user}</div>
                  <div className="text-xs text-white/45">{messenger.onlineUsers[user] ? "online" : "offline"}</div>
                </div>
                <span className={cn("h-2.5 w-2.5 rounded-full", messenger.onlineUsers[user] ? "bg-emerald-400" : "bg-zinc-600")} />
              </div>
            </button>
          ))}
        </div>

        <Input
          id="conversation-search"
          value={messenger.conversationSearch}
          onChange={(event) => messenger.setConversationSearch(event.target.value)}
          placeholder="Search conversations"
          aria-label="Search conversations"
        />
        <div className="flex items-center gap-2 text-xs text-white/45">
          <span className="rounded-full bg-white/5 px-2 py-1">Unread {messenger.activeConversation.unreadCount}</span>
          <span className="rounded-full bg-white/5 px-2 py-1">Favorites {messenger.allConversations.filter((conversation) => conversation.favorite).length}</span>
          <span className="rounded-full bg-white/5 px-2 py-1">{messenger.attachments.length} attachments ready</span>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {messenger.conversations.map((conversation) => (
          <button
            key={conversation.id}
            className={cn(
              "group w-full rounded-3xl border px-4 py-4 text-left transition focus:outline-none focus:ring-2 focus:ring-accent/70",
              messenger.activeConversationId === conversation.id
                ? "border-accent/40 bg-accent/10"
                : "border-white/5 bg-white/[0.03] hover:bg-white/5",
            )}
            onClick={() => messenger.setActiveConversationId(conversation.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{conversation.title}</span>
                  {conversation.favorite ? <span className="text-xs text-yellow-300">★</span> : null}
                  {conversation.unreadCount ? (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-white">{conversation.unreadCount}</span>
                  ) : null}
                </div>
                <div className="truncate text-xs text-white/40">{conversation.handle}</div>
                <div className="mt-2 truncate text-sm text-white/55">{conversation.lastMessage}</div>
              </div>
              <div className="text-right text-xs text-white/35">
                <div className={cn("inline-flex rounded-full px-2 py-1", conversation.presence === "online" ? "bg-emerald-500/10 text-emerald-300" : "bg-white/5 text-white/45")}>
                  {conversation.presence}
                </div>
                <div className="mt-2">{conversation.lastActiveAt}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

