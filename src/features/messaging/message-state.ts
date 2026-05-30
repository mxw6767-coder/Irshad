import type { ChatMessage } from "@/types/domain";

export function markMessageDelivered(message: ChatMessage, deliveredAt = new Date().toISOString()): ChatMessage {
  return { ...message, status: "DELIVERED", deliveredAt };
}

export function markMessageRead(message: ChatMessage, readAt = new Date().toISOString()): ChatMessage {
  return { ...message, status: "READ", deliveredAt: message.deliveredAt ?? readAt, readAt };
}

export function softDeleteMessage(message: ChatMessage, deletedAt = new Date().toISOString()): ChatMessage {
  return { ...message, deletedAt };
}

export function editMessage(message: ChatMessage, editedAt = new Date().toISOString()): ChatMessage {
  return { ...message, editedAt };
}

