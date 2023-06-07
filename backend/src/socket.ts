import { Server as HttpServer } from "http";
import { Socket, Server } from "socket.io";
import { ChessAIEngine, GameStatus } from "./model/ChessAIModel";
import { v4 as uuidv4 } from "uuid";
import { ChessEngine } from "./model/ChessModel";

type Color = "white" | "black";

export class ServerSocket {
  public static instance: ServerSocket;
  public io: Server;

  private roomMap: Map<
    string,
    {
      white: string;
      black: string;
    }
  > = new Map(); //RoomID: {black: userID, white: userID}

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

  addToRoomMap(roomID: string, userID: string, playerColor: Color) {
    if (!this.roomMap.has(roomID))
      this.roomMap.set(roomID, {
        white: "",
        black: "",
      });

    this.roomMap.get(roomID)![playerColor] = userID;
  }

  StartListeners = (socket: Socket) => {
    console.info("Message received from " + socket.id);
    let difficulty = 1;
    let chessEngine: ChessEngine | ChessAIEngine = new ChessAIEngine(
      difficulty,
      "random"
    );
    let isMultiplayerMode = false;
    let roomID: string;

    socket.on(
      "handshake",
      (
        clientRoomID: string,
        playerColor: Color,
        callback: (userID: string, roomID: string) => void
      ) => {
        console.info("Handshake received from: " + socket.id);
        
        //If there is no clientRoomID being sent, it is not multiplayer. And otherwise
        isMultiplayerMode = !clientRoomID ? false : true;
        roomID = !clientRoomID ? uuidv4() : clientRoomID;
        let clientUserID = uuidv4();
        socket.join(roomID);
        console.log(`RoomID: ${roomID}`);

        this.addToRoomMap(roomID, clientUserID, playerColor);
        if (playerColor === "black") {
          isMultiplayerMode = true;
          chessEngine = chessEngine as ChessEngine;
        }

        console.info("Sending callback ...");
        callback(clientUserID, roomID);
      }
    );

    socket.on(
      "playerMakeMove",
      (playerMoveFrom: string, playerMoveTo: string, playerColor: Color) => {
        console.log(
          `player make move from ${playerMoveFrom} to ${playerMoveTo}`
        );
        if (isMultiplayerMode) {
          console.log("multiplayer mode");
          socket.emit(
            "opponentMakeMove",
            playerMoveFrom,
            playerMoveTo,
            playerColor === "black" ? "white" : "black"
          );

          return;
        }
        console.log("computer playing");
        (chessEngine as ChessAIEngine).updatePlayerMove(
          playerMoveFrom,
          playerMoveTo
        );
        let [opponentMoveFrom, opponentMoveTo] = (
          chessEngine as ChessAIEngine
        ).computerMakingMove();

        //Check game status after opponent making move
        let gameStatus = chessEngine.checkGameStatus();
        if (gameStatus !== "notOver") {
          console.log(gameStatus);
          this.emitGameOver(gameStatus, socket);
        }

        if (opponentMoveFrom && opponentMoveTo)
          socket.emit(
            "opponentMakeMove",
            opponentMoveFrom,
            opponentMoveTo,
            "black"
          );

        gameStatus = chessEngine.checkGameStatus();
        if (gameStatus !== "notOver") {
          console.log(gameStatus);
          this.emitGameOver(gameStatus, socket);
        }
      }
    );

    socket.on("playerUndo", async (callback: (succeed: boolean) => void) => {
      if (isMultiplayerMode) callback(false);

      try {
        (chessEngine as ChessAIEngine).playerUndo();
      } catch (e: any) {
        callback(false);
      }
      callback(true);
    });

    socket.on(
      "setDifficulty",
      async (difficulty: number, callback: (succeed: boolean) => void) => {
        if (isMultiplayerMode) callback(false);
        try {
          difficulty = difficulty;
          (chessEngine as ChessAIEngine).setMinimaxSearchDepth(difficulty);
          console.log(`Set difficulty to ${difficulty}`);
          callback(true);
        } catch (e: any) {
          callback(false);
        }
      }
    );

    socket.on("setNewGame", async (callback: (succeed: boolean) => void) => {
      try {
        chessEngine = new ChessAIEngine(difficulty, "random");
        callback(true);
      } catch (e: any) {
        console.log(e);
        callback(false);
      }
    });

    socket.on("disconnect", () => {
      console.info("Disconnect received from: " + socket.id);
    });
  };
}
