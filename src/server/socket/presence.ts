const onlineUsers = new Map<string, { lastSeenAt?: string }>();

export function markOnline(userId: string) {
  onlineUsers.set(userId, {});
}

export function markOffline(userId: string) {
  onlineUsers.set(userId, { lastSeenAt: new Date().toISOString() });
}

export function getPresence(userId: string) {
  return onlineUsers.get(userId) ? "online" : "offline";
}

