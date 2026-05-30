"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage, ComposerAttachment, ConversationSummary, ProfileName } from "@/types/domain";
import { createEncryptedMessage } from "@/features/messaging/send-message";
import { markMessageDelivered, markMessageRead, softDeleteMessage } from "@/features/messaging/message-state";
import { sealPlaintext } from "@/lib/crypto/primitives";
import { getClientSocket } from "@/lib/socket";
import { notifyIncomingMessage, isDesktop } from "@/lib/desktop";

export type AppSection = "chat" | "settings";
export type DemoUser = ProfileName;
export type ComposerMode = "compose" | "reply" | "edit";
export const profileOptions: ProfileName[] = ["Cat", "Fox", "Owl", "Bear", "Lynx"];

const nowLabel = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const conversationSeed: ConversationSummary[] = [
  {
    id: "alpha",
    handle: "@fox",
    title: "Fox",
    presence: "online",
    status: "Encrypted direct chat",
    unreadCount: 3,
    favorite: true,
    lastMessage: "Keep the payloads client-side only.",
    lastActiveAt: "Just now",
  },
  {
    id: "beta",
    handle: "@cat",
    title: "Cat",
    presence: "last seen recently",
    status: "Private workspace",
    unreadCount: 0,
    lastMessage: "Ready for the next test.",
    lastActiveAt: "5m ago",
  },
];

const messageSeed: ChatMessage[] = [
  {
    id: "m-1",
    conversationId: "alpha",
    senderId: "Fox",
    receiverId: "Cat",
    senderDeviceId: "fox-device",
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
    senderId: "Cat",
    receiverId: "Fox",
    senderDeviceId: "cat-device",
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
    senderId: "Fox",
    receiverId: "Cat",
    senderDeviceId: "fox-device",
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

type GateStatus = "locked" | "need_profile" | "ready";

const storageKeys = {
  gate: "irshad.entry.granted",
  activeUser: "irshad.active.profile",
  profileCat: "irshad.profile.cat.password",
  profileFox: "irshad.profile.fox.password",
  profileOwl: "irshad.profile.owl.password",
  profileBear: "irshad.profile.bear.password",
  profileLynx: "irshad.profile.lynx.password",
  profileRegistry: "irshad.profile.registry",
  onboarding: "irshad.profile.onboarded",
};

function setCookie(name: string, value: string, maxAgeSeconds = 31536000) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; samesite=strict`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=strict`;
}

export function useMessenger() {
  const [gateStatus, setGateStatus] = useState<GateStatus>("locked");
  const [gatePassword, setGatePassword] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);
  const [section, setSection] = useState<AppSection>("chat");
  const [activeUser, setActiveUser] = useState<DemoUser>("Fox");
  const [search, setSearch] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [conversations, setConversations] = useState(conversationSeed);
  const [messages, setMessages] = useState(messageSeed);
  const [activeConversationId, setActiveConversationId] = useState("alpha");
  const [onlineUsers, setOnlineUsers] = useState<Record<DemoUser, boolean>>({
    Cat: true,
    Fox: true,
    Owl: false,
    Bear: false,
    Lynx: false,
  });
  const [typingUser, setTypingUser] = useState<string | null>("Cat");
  const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "degraded">("connected");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [attachments] = useState(attachmentSeed);
  const [composer, setComposer] = useState<ComposerState>({ text: "", draftKey: "alpha:Fox" });
  const [toast, setToast] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [profileSetupMode, setProfileSetupMode] = useState<"register" | "login">("register");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [entryPasswordInput, setEntryPasswordInput] = useState("");
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [profileUnlocked, setProfileUnlocked] = useState(false);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const idleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const entryGranted = window.localStorage.getItem(storageKeys.gate) === "true";
    const onboarded = window.localStorage.getItem(storageKeys.onboarding) === "true";
    const storedProfile = window.localStorage.getItem(storageKeys.activeUser);
    if (profileOptions.includes(storedProfile as ProfileName)) setActiveUser(storedProfile as ProfileName);
    if (entryGranted) {
      setGateStatus(onboarded ? "ready" : "need_profile");
      setProfileUnlocked(onboarded);
    } else {
      setGateStatus("locked");
      setProfileUnlocked(false);
    }
  }, []);

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
    if (gateStatus !== "ready") return;
    const storedDraft = window.localStorage.getItem(`draft:${activeConversationId}:${activeUser}`) ?? "";
    setComposer((current) => ({ ...current, text: storedDraft, draftKey: `${activeConversationId}:${activeUser}` }));
  }, [activeConversationId, activeUser, gateStatus]);

  useEffect(() => {
    if (gateStatus !== "ready") return;
    window.localStorage.setItem(`draft:${composer.draftKey}`, composer.text);
    setDrafts((current) => ({ ...current, [composer.draftKey]: composer.text }));
  }, [composer.draftKey, composer.text, gateStatus]);

  useEffect(() => {
    if (gateStatus !== "ready") return;
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
      if (isDesktop()) {
        notifyIncomingMessage(event.senderId, "New encrypted message received");
        setSelectedMessageId(event.messageId);
      }
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
  }, [activeConversationId, activeUser, gateStatus]);

  useEffect(() => {
    if (gateStatus !== "ready") return;

    const resetIdleTimer = () => {
      if (idleTimeoutRef.current) {
        window.clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = window.setTimeout(() => {
        logout();
        setGateError("Session expired after inactivity. Enter the access code again.");
      }, 15 * 60 * 1000);
    };

    const activityEvents = ["pointerdown", "keydown", "scroll", "mousemove", "touchstart"] as const;
    activityEvents.forEach((eventName) => window.addEventListener(eventName, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, resetIdleTimer));
    };
  }, [gateStatus]);

  useEffect(() => {
    if (gateStatus !== "ready") return;
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
  }, [conversationMessages.length, gateStatus]);

  useEffect(() => {
    if (gateStatus !== "ready") return;
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
  }, [gateStatus]);

  const syncConversationPreview = (conversationId: string, preview: string) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              lastMessage: preview,
              lastActiveAt: "Just now",
              unreadCount: activeUser === conversation.title ? 0 : conversation.unreadCount + 1,
            }
          : conversation,
      ),
    );
  };

  const submitEntryPassword = () => {
    const expected = process.env.NEXT_PUBLIC_ENTRY_PASSWORD;
    if (!expected || entryPasswordInput !== expected) {
      setGateError("Wrong access code");
      return;
    }
    setCookie("irshad_entry_ok", "1", 15 * 60);
    window.localStorage.setItem(storageKeys.gate, "true");
    setGateStatus(window.localStorage.getItem(storageKeys.onboarding) === "true" ? "ready" : "need_profile");
    setGateError(null);
  };

  const getProfileKey = (profile: ProfileName) => {
    switch (profile) {
      case "Cat":
        return storageKeys.profileCat;
      case "Fox":
        return storageKeys.profileFox;
      case "Owl":
        return storageKeys.profileOwl;
      case "Bear":
        return storageKeys.profileBear;
      case "Lynx":
        return storageKeys.profileLynx;
    }
  };

  const getRegisteredProfiles = () => {
    try {
      return JSON.parse(window.localStorage.getItem(storageKeys.profileRegistry) ?? "[]") as ProfileName[];
    } catch {
      return [];
    }
  };

  const setRegisteredProfiles = (profiles: ProfileName[]) => {
    window.localStorage.setItem(storageKeys.profileRegistry, JSON.stringify(Array.from(new Set(profiles))));
  };

  const availableProfileOptions = profileOptions.filter((profile) => {
    const registered = getRegisteredProfiles();
    return !registered.includes(profile) || profile === activeUser;
  });

  const saveProfile = () => {
    if (activeUser.length > 5) {
      setProfileError("Profile name must be 5 characters or less");
      return;
    }
    const passwordStoreKey = getProfileKey(activeUser);
    const existing = window.localStorage.getItem(passwordStoreKey);
    if (profileSetupMode === "register") {
      if (!profilePassword || profilePassword.length < 6) {
        setProfileError("Use a longer profile password");
        return;
      }
      if (profilePassword !== profileConfirmPassword) {
        setProfileError("Passwords do not match");
        return;
      }
      if (existing) {
        setProfileError("Profile already exists. Switch to login.");
        return;
      }
      const registeredProfiles = getRegisteredProfiles();
      if (registeredProfiles.includes(activeUser) && !existing) {
        setProfileError("That animal name is already reserved");
        return;
      }
      window.localStorage.setItem(passwordStoreKey, profilePassword);
      window.localStorage.setItem(storageKeys.activeUser, activeUser);
      window.localStorage.setItem(storageKeys.onboarding, "true");
      setRegisteredProfiles([...getRegisteredProfiles(), activeUser]);
      setCookie(`irshad_profile_${activeUser.toLowerCase()}`, "1", 365 * 24 * 60 * 60);
      setGateStatus("ready");
      setProfileUnlocked(true);
      setProfileError(null);
      return;
    }

    if (existing !== profilePassword) {
      setProfileError("Wrong profile password");
      return;
    }
    window.localStorage.setItem(storageKeys.activeUser, activeUser);
    window.localStorage.setItem(storageKeys.onboarding, "true");
    setRegisteredProfiles([...getRegisteredProfiles(), activeUser]);
    setCookie(`irshad_profile_${activeUser.toLowerCase()}`, "1", 365 * 24 * 60 * 60);
    setGateStatus("ready");
    setProfileUnlocked(true);
    setProfileError(null);
  };

  const switchProfile = (profile: DemoUser) => {
    setActiveUser(profile);
    window.localStorage.setItem(storageKeys.activeUser, profile);
    setProfileUnlocked(Boolean(window.localStorage.getItem(`irshad_profile_${profile.toLowerCase()}`)));
    setToast(`Switched to ${profile}`);
  };

  const logout = () => {
    window.localStorage.removeItem(storageKeys.gate);
    window.localStorage.removeItem(storageKeys.onboarding);
    window.localStorage.removeItem(storageKeys.activeUser);
    window.localStorage.removeItem(storageKeys.profileRegistry);
    clearCookie("irshad_entry_ok");
    clearCookie("irshad_profile_cat");
    clearCookie("irshad_profile_fox");
    clearCookie("irshad_profile_owl");
    clearCookie("irshad_profile_bear");
    clearCookie("irshad_profile_lynx");
    setGateStatus("locked");
    setEntryPasswordInput("");
    setProfilePassword("");
    setProfileConfirmPassword("");
    setGateError(null);
    setProfileError(null);
    setProfileUnlocked(false);
    setToast("Logged out");
  };

  const resetSessionCookie = () => {
    clearCookie("irshad_entry_ok");
    window.localStorage.removeItem(storageKeys.gate);
    window.localStorage.removeItem(storageKeys.onboarding);
    setGateStatus("locked");
    setToast("Entry session cleared");
  };

  const sendMessage = async (plaintext: string) => {
    const socket = getClientSocket();
    const receiverId = activeUser === "Fox" ? "Cat" : "Fox";
    const senderDeviceId = activeUser === "Fox" ? "fox-device" : "cat-device";
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

  const gateCopy = {
    entryPasswordInput,
    setEntryPasswordInput,
    submitEntryPassword,
    gateError,
    visiblePassword,
    setVisiblePassword,
    profileSetupMode,
    setProfileSetupMode,
    profilePassword,
    setProfilePassword,
    profileConfirmPassword,
    setProfileConfirmPassword,
    profileError,
    saveProfile,
  };

  return {
    gateStatus,
    gateCopy,
    availableProfileOptions,
    profileUnlocked,
    section,
    setSection,
    activeUser,
    setActiveUser,
    switchProfile,
    logout,
    resetSessionCookie,
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
