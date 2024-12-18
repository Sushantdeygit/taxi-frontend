import { io } from "socket.io-client";

// Create a socket instance
const socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL, {
  autoConnect: true,
});

// Helper functions to connect, disconnect, and emit events
const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    console.log("Socket connected:", socket.id);
  }
};

const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("Socket disconnected");
  }
};

export { socket, connectSocket, disconnectSocket };
