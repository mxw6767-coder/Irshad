const http = require("http");
const { Server } = require("socket.io");

const port = Number(process.env.PORT || 3001);

const server = http.createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify({ status: "ok" }));
});

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : "*",
    methods: ["GET", "POST"],
  },
});

const typingUsers = new Map();
const onlineUsers = new Map();

function setTyping(conversationId, userId, isTyping) {
  const users = typingUsers.get(conversationId) ?? new Set();
  if (isTyping) users.add(userId);
  else users.delete(userId);
  typingUsers.set(conversationId, users);
}

io.on("connection", (socket) => {
  socket.on("auth:join", ({ userId }) => {
    socket.data.userId = userId;
    onlineUsers.set(userId, { lastSeenAt: null });
    socket.broadcast.emit("presence:update", { userId, status: "online" });
  });

  socket.on("conversation:join", ({ conversationId }) => {
    socket.join(conversationId);
  });

  socket.on("message:send", (event) => {
    io.to(event.conversationId).emit("message:incoming", event);
  });

  socket.on("typing:start", (event) => {
    setTyping(event.conversationId, event.userId, true);
    socket.to(event.conversationId).emit("typing:update", { userId: event.userId, isTyping: true });
  });

  socket.on("typing:stop", (event) => {
    setTyping(event.conversationId, event.userId, false);
    socket.to(event.conversationId).emit("typing:update", { userId: event.userId, isTyping: false });
  });

  socket.on("message:receipt", (event) => {
    socket.to(event.conversationId).emit("message:receipt", event);
  });

  socket.on("disconnect", () => {
    const userId = socket.data.userId;
    if (userId) {
      onlineUsers.set(userId, { lastSeenAt: new Date().toISOString() });
      socket.broadcast.emit("presence:update", {
        userId,
        status: "offline",
        lastSeenAt: new Date().toISOString(),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Realtime server running on http://localhost:${port}`);
});

