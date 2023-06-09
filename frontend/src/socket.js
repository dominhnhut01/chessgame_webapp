import { io } from "socket.io-client";

export const socket = io('http://172.20.2.49:4800', {transports: ['websocket'], upgrade: false});