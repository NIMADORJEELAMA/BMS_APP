import {io} from 'socket.io-client';

// Replace with your local IP if testing on a physical device
const SOCKET_URL = 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  autoConnect: false, // We will connect manually on login
});
