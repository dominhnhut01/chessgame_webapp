import { Server as HttpServer } from "http";
import { Socket, Server } from "socket.io";
import { ChessAIEngine, GameStatus } from "./model/model";
import { Move } from "chess.js";

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

  emitGameOver(gameStatus: GameStatus, socket: Socket) {
    if (gameStatus !== "notOver") {
      socket.emit("gameOver", gameStatus);
    }
  }

  StartListeners = (socket: Socket) => {
    console.info("Message received from " + socket.id);
    let difficulty = 1;
    // let openingMovesList = ['ruy_lopez', 'italian_game', 'slav_defense'];
    // let openingMoves = openingMovesList[Math.floor(Math.random()*openingMovesList.length)];
    let aiEngine = new ChessAIEngine(difficulty, 'random');

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
        computerMakeMove: (computerMove: {[key: string]: string}) => void
      ) => {
        try {
          aiEngine.updatePlayerMove(playerMoveFrom, playerMoveTo);
          let gameStatus = aiEngine.checkGameStatus();
          if (gameStatus !== "notOver") {
            this.emitGameOver(gameStatus, socket);
            return;
          }
          const computerMove = aiEngine.computerMakingMove();
          // console.log(`Computer making move: ${computerMove}`);
          console.log(computerMove);
          computerMakeMove(computerMove);
          if (gameStatus !== "notOver") this.emitGameOver(gameStatus, socket);
        } catch (e: any) {
          console.log(aiEngine.chess.history({ verbose: true }));
          console.log(aiEngine.chess.ascii());
        }
      }
    );

    socket.on("disconnect", () => {
      console.info("Disconnect received from: " + socket.id);
    });
  };
}
