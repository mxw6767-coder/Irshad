"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage, ComposerAttachment, ConversationSummary } from "@/types/domain";
import { createEncryptedMessage } from "@/features/messaging/send-message";
import { markMessageDelivered, markMessageRead, softDeleteMessage, editMessage } from "@/features/messaging/message-state";
import { sealPlaintext } from "@/lib/crypto/primitives";
import { getClientSocket } from "@/lib/socket";

export type AppSection = "chat" | "settings";
export type DemoUser = "Vinayak" | "Friend";
export type ComposerMode = "compose" | "reply" | "edit";

const conversationSeed: ConversationSummary[] = [
  {
    id: "alpha",
    handle: "@friend",
    title: "Friend",
    presence: "online",
    status: "Encrypted direct chat",
    unreadCount: 3,
    favorite: true,
    lastMessage: "Keep the payloads client-side only.",
    lastActiveAt: "Just now",
  },
  {
    id: "beta",
    handle: "@vinayak",
    title: "Vinayak",
    presence: "last seen recently",
    status: "Private workspace",
    unreadCount: 0,
    lastMessage: "Ready for the next test.",
    lastActiveAt: "5m ago",
  },
];

const nowLabel = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const messageSeed: ChatMessage[] = [
  {
    id: "m-1",
    conversationId: "alpha",
    senderId: "Friend",
    receiverId: "Vinayak",
    senderDeviceId: "friend-device",
    ciphertext: "RW5jcnlwdGVkIGNoYW5uZWwgaXMgdXA=",
    nonce: "ZGVtby1ub25jZS0x",
    plaintextPreview: "Encrypted channel is up.",
    displayText: "Encrypted channel is up.",
    sentAt: "09:41",
    deliveredAt: "09:41",
    readAt: "09:42",
    status: "READ",
    pinned: true,
  },
  {
    id: "m-2",
    conversationId: "alpha",
    senderId: "Vinayak",
    receiverId: "Friend",
    senderDeviceId: "vinayak-device",
    ciphertext: "S2VlcCB0aGUgcGF5bG9hZHMgY2xpZW50LXNpZGUgb25seS4=",
    nonce: "ZGVtby1ub25jZS0y",
    plaintextPreview: "Keep the payloads client-side only.",
    displayText: "Keep the payloads client-side only.",
    sentAt: "09:42",
    deliveredAt: "09:42",
    status: "DELIVERED",
  },
  {
    id: "m-3",
    conversationId: "alpha",
    senderId: "Friend",
    receiverId: "Vinayak",
    senderDeviceId: "friend-device",
    type: "separator",
    ciphertext: "",
    nonce: "",
    plaintextPreview: "",
    displayText: "Unread messages",
    sentAt: "",
    status: "SENT",
  },
];

const attachmentSeed: ComposerAttachment[] = [
  { id: "a1", name: "design-preview.png", mimeType: "image/png", sizeLabel: "1.2 MB", kind: "image" },
  { id: "a2", name: "notes.md", mimeType: "text/markdown", sizeLabel: "12 KB", kind: "file" },
];

type ComposerState = {
  text: string;
  replyToId?: string;
  editMessageId?: string;
  quoteText?: string;
  draftKey: string;
};

export function useMessenger() {
  const [section, setSection] = useState<AppSection>("chat");
  const [activeUser, setActiveUser] = useState<DemoUser>("Vinayak");
  const [search, setSearch] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [conversations, setConversations] = useState(conversationSeed);
  const [messages, setMessages] = useState(messageSeed);
  const [activeConversationId, setActiveConversationId] = useState("alpha");
  const [onlineUsers, setOnlineUsers] = useState<Record<DemoUser, boolean>>({ Vinayak: true, Friend: true });
  const [typingUser, setTypingUser] = useState<string | null>("Friend");
  const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "degraded">("connected");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [attachments] = useState(attachmentSeed);
  const [composer, setComposer] = useState<ComposerState>({ text: "", draftKey: "alpha:Vinayak" });
  const [toast, setToast] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const messageListRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0],
    [activeConversationId, conversations],
  );

  const visibleConversations = useMemo(() => {
    let list = conversations.filter((conversation) => {
      const query = conversationSearch.toLowerCase();
      return (
        !query ||
        conversation.title.toLowerCase().includes(query) ||
        conversation.handle.toLowerCase().includes(query) ||
        conversation.lastMessage?.toLowerCase().includes(query)
      );
    });

    if (favoritesOnly) list = list.filter((conversation) => conversation.favorite);
    return list;
  }, [conversationSearch, conversations, favoritesOnly]);

  const conversationMessages = useMemo(() => {
    let list = messages.filter((message) => message.conversationId === activeConversationId);
    if (search) {
      const query = search.toLowerCase();
      list = list.filter((message) => (message.displayText ?? message.plaintextPreview ?? "").toLowerCase().includes(query));
    }
    if (pinnedOnly) list = list.filter((message) => message.pinned);
    return list;
  }, [activeConversationId, messages, pinnedOnly, search]);

  useEffect(() => {
    const storedDraft = window.localStorage.getItem(`draft:${activeConversationId}:${activeUser}`) ?? "";
    setComposer((current) => ({ ...current, text: storedDraft, draftKey: `${activeConversationId}:${activeUser}` }));
  }, [activeConversationId, activeUser]);

  useEffect(() => {
    window.localStorage.setItem(`draft:${composer.draftKey}`, composer.text);
    setDrafts((current) => ({ ...current, [composer.draftKey]: composer.text }));
  }, [composer.draftKey, composer.text]);

  useEffect(() => {
    const socket = getClientSocket();
    socket.connect();
    setConnectionState("connecting");
    socket.emit("auth:join", { userId: activeUser });
    socket.emit("conversation:join", { conversationId: activeConversationId });
    setConnectionState("connected");

    const handleIncoming = (event: { messageId: string; senderId: string; receiverId: string; senderDeviceId: string; conversationId: string; ciphertext: string; nonce: string }) => {
      if (event.senderId === activeUser) return;
      setMessages((current) => {
        if (current.some((message) => message.id === event.messageId)) return current;
        return [
          ...current,
          {
            id: event.messageId,
            conversationId: event.conversationId,
            senderId: event.senderId,
            receiverId: event.receiverId,
            senderDeviceId: event.senderDeviceId,
            ciphertext: event.ciphertext,
            nonce: event.nonce,
            plaintextPreview: "",
            displayText: "Encrypted message",
            sentAt: nowLabel(),
            status: "DELIVERED",
          },
        ];
      });
    };

    const handleTyping = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUser(isTyping ? userId : null);
    };

    const handlePresence = ({ userId, status, lastSeenAt }: { userId: DemoUser; status: "online" | "offline"; lastSeenAt?: string }) => {
      setOnlineUsers((current) => ({ ...current, [userId]: status === "online" }));
      setConversations((current) =>
        current.map((conversation) =>
          conversation.title === userId
            ? { ...conversation, presence: status === "online" ? "online" : "last seen recently", lastActiveAt: lastSeenAt ?? conversation.lastActiveAt }
            : conversation,
        ),
      );
    };

    const handleReceipt = ({ messageId, deliveredAt, readAt }: { messageId: string; deliveredAt?: string; readAt?: string }) => {
      setMessages((current) =>
        current.map((message) => {
          if (message.id !== messageId) return message;
          if (readAt) return markMessageRead(message, readAt);
          if (deliveredAt) return markMessageDelivered(message, deliveredAt);
          return message;
        }),
      );
    };

    socket.on("message:incoming", handleIncoming);
    socket.on("typing:update", handleTyping);
    socket.on("presence:update", handlePresence);
    socket.on("message:receipt", handleReceipt);

    return () => {
      socket.off("message:incoming", handleIncoming);
      socket.off("typing:update", handleTyping);
      socket.off("presence:update", handlePresence);
      socket.off("message:receipt", handleReceipt);
      socket.disconnect();
    };
  }, [activeConversationId, activeUser]);

  useEffect(() => {
    const onScroll = () => {
      const container = messageListRef.current;
      if (!container) return;
      const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
      setShowScrollToBottom(!nearBottom);
    };
    const container = messageListRef.current;
    container?.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => container?.removeEventListener("scroll", onScroll);
  }, [conversationMessages.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("conversation-search")?.focus();
      }
      if (event.key === "Escape") {
        setSelectedMessageId(null);
        setShowSettings(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const syncConversationPreview = (conversationId: string, preview: string) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, lastMessage: preview, lastActiveAt: "Just now", unreadCount: activeUser === conversation.title ? 0 : conversation.unreadCount + 1 }
          : conversation,
      ),
    );
  };

  const sendMessage = async (plaintext: string) => {
    const socket = getClientSocket();
    const receiverId = activeUser === "Vinayak" ? "Friend" : "Vinayak";
    const senderDeviceId = activeUser === "Vinayak" ? "vinayak-device" : "friend-device";
    const sealed = await sealPlaintext(plaintext);
    const nextMessage = createEncryptedMessage({
      conversationId: activeConversationId,
      senderId: activeUser,
      receiverId,
      senderDeviceId,
      ciphertext: sealed.ciphertext,
      nonce: sealed.nonce,
    });

    const composedMessage: ChatMessage = {
      ...nextMessage,
      plaintextPreview: plaintext,
      displayText: plaintext,
      status: "SENT",
    };

    setMessages((current) => [...current, composedMessage]);
    syncConversationPreview(activeConversationId, plaintext);
    setComposer((current) => ({ ...current, text: "", replyToId: undefined, editMessageId: undefined, quoteText: undefined }));
    window.localStorage.removeItem(`draft:${activeConversationId}:${activeUser}`);

    socket.emit("message:send", {
      messageId: nextMessage.id,
      conversationId: activeConversationId,
      senderId: activeUser,
      receiverId,
      senderDeviceId,
      ciphertext: sealed.ciphertext,
      nonce: sealed.nonce,
    });

    socket.emit("message:receipt", {
      messageId: nextMessage.id,
      conversationId: activeConversationId,
      userId: receiverId,
      deliveredAt: new Date().toISOString(),
    });
    setToast("Message sent");
  };

  const updateComposer = (value: string) => setComposer((current) => ({ ...current, text: value, draftKey: `${activeConversationId}:${activeUser}` }));

  const startReply = (messageId: string) => {
    const target = messages.find((message) => message.id === messageId);
    setComposer((current) => ({
      ...current,
      replyToId: messageId,
      quoteText: target?.displayText ?? target?.plaintextPreview ?? "",
      editMessageId: undefined,
    }));
  };

  const startEdit = (messageId: string) => {
    const target = messages.find((message) => message.id === messageId);
    setComposer((current) => ({
      ...current,
      editMessageId: messageId,
      replyToId: undefined,
      quoteText: undefined,
      text: target?.displayText ?? target?.plaintextPreview ?? "",
    }));
  };

  const submitComposer = async (value: string) => {
    if (composer.editMessageId) {
      const updatedText = value.trim();
      if (!updatedText) return;
      setMessages((current) =>
        current.map((message) =>
          message.id === composer.editMessageId
            ? { ...message, displayText: updatedText, plaintextPreview: updatedText, editedAt: new Date().toISOString() }
            : message,
        ),
      );
      setComposer((current) => ({ ...current, editMessageId: undefined, text: "" }));
      setToast("Message edited");
      return;
    }
    await sendMessage(value);
  };

  const deleteMessage = (messageId: string) => {
    setMessages((current) => current.map((message) => (message.id === messageId ? softDeleteMessage(message) : message)));
    setToast("Message deleted");
  };

  const togglePin = (messageId: string) => {
    setMessages((current) => current.map((message) => (message.id === messageId ? { ...message, pinned: !message.pinned } : message)));
  };

  const toggleFavoriteConversation = (conversationId: string) => {
    setConversations((current) => current.map((conversation) => (conversation.id === conversationId ? { ...conversation, favorite: !conversation.favorite } : conversation)));
  };

  const markViewed = () => {
    setMessages((current) =>
      current.map((message) =>
        message.conversationId === activeConversationId && message.senderId !== activeUser && !message.readAt
          ? markMessageRead(message)
          : message,
      ),
    );
  };

  return {
    section,
    setSection,
    activeUser,
    setActiveUser,
    search,
    setSearch,
    conversationSearch,
    setConversationSearch,
    drafts,
    conversations: visibleConversations,
    allConversations: conversations,
    activeConversation,
    messages: conversationMessages,
    allMessages: messages,
    activeConversationId,
    setActiveConversationId,
    onlineUsers,
    typingUser,
    connectionState,
    selectedMessageId,
    setSelectedMessageId,
    showScrollToBottom,
    showSettings,
    setShowSettings,
    favoritesOnly,
    setFavoritesOnly,
    pinnedOnly,
    setPinnedOnly,
    attachments,
    composer,
    setComposer,
    updateComposer,
    sendMessage,
    submitComposer,
    startReply,
    startEdit,
    deleteMessage,
    togglePin,
    toggleFavoriteConversation,
    markViewed,
    messageListRef,
    toast,
    setToast,
    reducedMotion,
    setReducedMotion,
  };
}
