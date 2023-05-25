import { Server as HttpServer } from "http";
import { Socket, Server } from "socket.io";
import { v4 } from "uuid";
import ChessAIEngine from "./model/model";
import { Chess } from "chess.js";

export class ServerSocket {
  public static instance: ServerSocket;
  public io: Server;

  /** Master list of all connected rooms */

  constructor(server: HttpServer) {
    
    ServerSocket.instance = this;
    this.io = new Server(server, {
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      cors: {
        origin: "*",
      },
    });

    this.io.on("connect", this.StartListeners);
  }

  StartListeners = (socket: Socket) => {
    console.info("Message received from " + socket.id);
    let difficulty = 1;
    let aiEngine = new ChessAIEngine(difficulty);

    socket.on("handshake", (callback: () => void) => {
      
      console.info("Handshake received from: " + socket.id);

      console.info("Sending callback ...");
      callback();
    });

    socket.on(
      "playerMakeMove",
      (
        playerMoveFrom: string,
        playerMoveTo: string,
        computerMakeMove: (computerMove: string) => void
      ) => {
        aiEngine.updatePlayerMove(playerMoveFrom, playerMoveTo);
        const computerMove: string = aiEngine.computerMakingMove();
        console.log(`Computer making move: ${computerMove}`);
        computerMakeMove(computerMove);
      }
    );

    socket.on("disconnect", () => {
      console.info("Disconnect received from: " + socket.id);
    });
  };
}
