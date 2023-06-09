import { io } from "socket.io-client";

export const socket = io('http://172.25.8.251:4800', {transports: ['websocket'], upgrade: false});