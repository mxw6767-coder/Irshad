import { Server } from "socket.io";
import type { SocketMessageSendEvent, SocketTypingEvent, SocketPresenceEvent, SocketReceiptEvent } from "@/server/socket/events";
import { markOnline, markOffline } from "@/server/socket/presence";
import { setTyping } from "@/server/socket/typing";

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    socket.on("auth:join", ({ userId }: { userId: string }) => {
      markOnline(userId);
      socket.data.userId = userId;
      socket.broadcast.emit("presence:update", { userId, status: "online" } satisfies SocketPresenceEvent);
    });

    socket.on("message:send", (event: SocketMessageSendEvent) => {
      io.to(event.conversationId).emit("message:incoming", event);
    });

    socket.on("typing:start", (event: SocketTypingEvent) => {
      setTyping(event.conversationId, event.userId, true);
      socket.to(event.conversationId).emit("typing:update", event);
    });

    socket.on("typing:stop", (event: SocketTypingEvent) => {
      setTyping(event.conversationId, event.userId, false);
      socket.to(event.conversationId).emit("typing:update", event);
    });

    socket.on("message:receipt", (event: SocketReceiptEvent) => {
      socket.to(event.conversationId).emit("message:receipt", event);
    });

    socket.on("disconnect", () => {
      const userId = socket.data.userId as string | undefined;
      if (userId) {
        markOffline(userId);
        socket.broadcast.emit("presence:update", { userId, status: "offline", lastSeenAt: new Date().toISOString() } satisfies SocketPresenceEvent);
      }
    });
  });
}

