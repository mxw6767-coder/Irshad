export type SocketMessageSendEvent = {
  conversationId: string;
  senderId: string;
  receiverId: string;
  senderDeviceId: string;
  ciphertext: string;
  nonce: string;
};

export type SocketTypingEvent = {
  conversationId: string;
  userId: string;
  isTyping: boolean;
};

export type SocketPresenceEvent = {
  userId: string;
  status: "online" | "offline";
  lastSeenAt?: string;
};

export type SocketReceiptEvent = {
  messageId: string;
  conversationId: string;
  userId: string;
  deliveredAt?: string;
  readAt?: string;
};

