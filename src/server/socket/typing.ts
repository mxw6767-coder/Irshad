const typingUsers = new Map<string, Set<string>>();

export function setTyping(conversationId: string, userId: string, isTyping: boolean) {
  const users = typingUsers.get(conversationId) ?? new Set<string>();
  if (isTyping) users.add(userId);
  else users.delete(userId);
  typingUsers.set(conversationId, users);
}

export function getTypingUsers(conversationId: string) {
  return Array.from(typingUsers.get(conversationId) ?? []);
}

