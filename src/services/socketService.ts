// socket.js or within the file
import {io} from 'socket.io-client';

const SOCKET_URL = 'http://192.168.29.142:3000'; // Use your machine's IP for physical devices!
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket'], // Faster for mobile
});
