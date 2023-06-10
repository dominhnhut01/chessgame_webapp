import { io } from "socket.io-client";

export const socket = io('https://chessland.online', {transports: ['websocket'], upgrade: false});