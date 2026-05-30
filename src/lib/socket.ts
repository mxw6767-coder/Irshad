import { io, type Socket } from "socket.io-client";

export type ClientSocket = Socket;

let socket: ClientSocket | null = null;

export function getClientSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", {
      autoConnect: false,
      transports: ["websocket"],
    }) as ClientSocket;
  }

  return socket;
}
