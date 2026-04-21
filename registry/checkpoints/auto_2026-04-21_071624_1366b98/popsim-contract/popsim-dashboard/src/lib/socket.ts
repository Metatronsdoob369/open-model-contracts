import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:8080';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    console.log('🔌 Connecting to PopSim Delivery Hub...');
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log('🔌 Disconnected from Delivery Hub');
  }
};
