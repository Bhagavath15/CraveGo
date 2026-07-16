import { io, Socket } from "socket.io-client";
import { getToken } from "../utils/authStore";
import { SOCKET_URL } from "../config";

let socket: Socket | null = null;

const createSocket = async (): Promise<Socket> => {
  const token = await getToken();

  const newSocket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  newSocket.on("connect", () => {
    console.log("Socket connected");
  });

  newSocket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  newSocket.on("connect_error", async (err) => {
    console.log("Socket connection error:", err.message);
    if (err.message === "Invalid or expired token") {
      const freshToken = await getToken();
      if (freshToken) {
        newSocket.auth = { token: freshToken };
        newSocket.connect();
      }
    }
  });

  return newSocket;
};

export const connectSocket = async (): Promise<Socket> => {
  if (socket?.connected) return socket;

  socket = await createSocket();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;
