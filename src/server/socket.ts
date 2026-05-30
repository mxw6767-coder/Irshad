import { Server as SocketIOServer } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var io: SocketIOServer | undefined;
}

export function getSocketServer() {
  if (!global.io) {
    global.io = new SocketIOServer({
      cors: {
        origin: "*",
      },
    });
  }
  return global.io;
}
