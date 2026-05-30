export type ConversationSummary = {
  id: string;
  title: string;
  handle: string;
  presence: "online" | "offline" | "last seen recently";
  status: string;
  unreadCount: number;
  favorite?: boolean;
  lastMessage?: string;
  lastActiveAt?: string;
};

export type MessageState = "SENT" | "DELIVERED" | "READ";

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  senderDeviceId: string;
  type?: "message" | "system" | "separator";
  replyToId?: string;
  quotedText?: string;
  draftId?: string;
  pinned?: boolean;
  starred?: boolean;
  ciphertext: string;
  nonce: string;
  plaintextPreview?: string;
  displayText?: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  editedAt?: string;
  deletedAt?: string;
  status: MessageState;
};

export type DeviceRecord = {
  id: string;
  userId: string;
  name: string;
  identityKeyPublic: string;
  deviceKeyPublic: string;
  createdAt: string;
  revokedAt?: string;
};

export type ComposerAttachment = {
  id: string;
  name: string;
  mimeType: string;
  sizeLabel: string;
  kind: "image" | "video" | "file";
};

export type ProfileName = "Cat" | "Fox";
