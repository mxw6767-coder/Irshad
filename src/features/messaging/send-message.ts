import type { ChatMessage } from "@/types/domain";

export function createEncryptedMessage(input: {
  conversationId: string;
  senderId: string;
  receiverId: string;
  senderDeviceId: string;
  ciphertext: string;
  nonce: string;
}): ChatMessage {
  const sentAt = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    status: "SENT",
    sentAt,
    ...input,
  };
}

