import { Server as HttpServer } from "http";
import { Socket, Server } from "socket.io";
import { ChessAIEngine, GameStatus } from "./model/ChessAIModel";
import { v4 as uuidv4 } from "uuid";
import { ChessEngine } from "./model/ChessModel";

type Color = "white" | "black";

export class ServerSocket {
  public static instance: ServerSocket;
  public io: Server;

  private socketsRecord: Map<
    string,
    {
      roomID: string;
      userColor: Color;
      isInMultiplayerMode: boolean;
    }
  > = new Map(); //userID: {roomID, userColor}

  private roomsRecord: Map<string, { white: string; black: string }> =
    new Map(); //RoomID: {whiteSocketID, blackSocketID}

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

  updateSocketsRecord(
    roomID: string,
    socketID: string,
    playerColor: Color,
    isInMultiplayerMode: boolean
  ) {
    if (!this.socketsRecord.has(socketID))
      this.socketsRecord.set(socketID, {
        roomID: roomID,
        userColor: playerColor,
        isInMultiplayerMode: isInMultiplayerMode,
      });
  }

  udpateRoomsRecord(roomID: string, socketID: string, playerColor: Color) {
    if (!this.roomsRecord.has(roomID))
      this.roomsRecord.set(roomID, {
        white: "",
        black: "",
      });

    this.roomsRecord.get(roomID)![playerColor] = socketID;
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
        callback: (roomID: string, playerColor: Color) => void
      ) => {
        console.info("Handshake received from: " + socket.id);
        let roomID: string = "";
        if (!this.socketsRecord.has(socket.id) && !clientRoomID) {
          roomID = uuidv4();
          this.updateSocketsRecord(roomID, socket.id, "white", false);
          this.udpateRoomsRecord(roomID, socket.id, "white");
          callback(roomID, "white");
        }

        if (!this.socketsRecord.has(socket.id) && clientRoomID) {
          roomID = clientRoomID;
          this.updateSocketsRecord(clientRoomID, socket.id, "black", true);
          this.udpateRoomsRecord(clientRoomID, socket.id, "black");
          this.socketsRecord.get(
            this.roomsRecord.get(clientRoomID)!.white
          )!.isInMultiplayerMode = true;
          chessEngine = chessEngine as ChessEngine;
          callback(roomID, "black");
        }
        //Join room
        socket.join(roomID.trim());
        console.log(`RoomID: ${roomID}`);
      }
    );
    
    socket.on(
      "playerMakeMove",
      (playerMoveFrom: string, playerMoveTo: string) => {
        console.log(
          `player make move from ${playerMoveFrom} to ${playerMoveTo}`
        );
        if (this.socketsRecord.get(socket.id)) {
          console.log("multiplayer mode");
          socket.to(this.socketsRecord.get(socket.id)!.roomID).emit(
            "opponentMakeMove",
            playerMoveFrom,
            playerMoveTo,
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
          );

        gameStatus = chessEngine.checkGameStatus();
        if (gameStatus !== "notOver") {
          console.log(gameStatus);
          this.emitGameOver(gameStatus, socket);
        }
      }
    );

    socket.on("playerUndo", async (callback: (succeed: boolean) => void) => {
      if (this.socketsRecord.get(socket.id)) callback(false);

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
        if (this.socketsRecord.get(socket.id)) callback(false);
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
