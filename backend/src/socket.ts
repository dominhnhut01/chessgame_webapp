import { Server as HttpServer } from "http";
import { Socket, Server } from "socket.io";
import { ChessMinimaxModel, GameStatus } from "./model/ChessMinimaxModel";
import { v4 as uuidv4 } from "uuid";
import { ChessEngine } from "./model/ChessModel";
import ChessAIModelInterface from "./model/ChessAIModelInterface";
import ChessStockfishModel from "./model/ChessStockfishEngine";

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

  private roomsRecord: Map<
    string,
    { white: string; black: string; numberOfPlayers: number }
  > = new Map(); //RoomID: {whiteSocketID, blackSocketID}

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
        numberOfPlayers: 0,
      });

    this.roomsRecord.get(roomID)![playerColor] = socketID;
    this.roomsRecord.get(roomID)!.numberOfPlayers += 1;
  }

  StartListeners = async (socket: Socket) => {
    console.info("Message received from " + socket.id);
    let difficulty = 1;
    let chessEngine: ChessAIModelInterface = await ChessStockfishModel.loadStockfishEngine(difficulty);
    console.log("done loading")
    let roomID: string;

    socket.on(
      "joinRoom",
      (
        clientRoomID: string,
        callback: (
          succeed: boolean,
          roomID: string | null,
          playerColor: Color | null
        ) => void
      ) => {
        console.log("Join room request")
        //if no record about this socket and no input roomID => This is a new socket and need to create a new room
        if (!this.socketsRecord.has(socket.id) && !clientRoomID) {
          roomID = uuidv4();
          this.updateSocketsRecord(roomID, socket.id, "white", false);
          this.udpateRoomsRecord(roomID, socket.id, "white");
          callback(true, roomID, "white");
        }

        //no record about this socket and do have input roomID => this socket want to join a room
        if (!this.socketsRecord.has(socket.id) && clientRoomID) {
          roomID = clientRoomID;

          //Check if room exist and check number of player in room
          if (
            !this.roomsRecord.has(clientRoomID) ||
            this.roomsRecord.get(clientRoomID)!.numberOfPlayers >= 2
          ) {
            callback(false, null, null);
            return;
          }

          this.updateSocketsRecord(clientRoomID, socket.id, "black", true);
          this.udpateRoomsRecord(clientRoomID, socket.id, "black");
          this.socketsRecord.get(
            this.roomsRecord.get(clientRoomID)!.white
          )!.isInMultiplayerMode = true;

          //Force White to reset the game when going in multiplayer mode
          socket.to(roomID).emit("setNewGame");

          //Callback to black player socket
          callback(true, roomID, "black");
        }
        //Join room
        socket.join(roomID.trim());
        // console.log(`RoomID: ${roomID}`);
      }
    );

    socket.on(
      "playerMakeMove",
      async (playerMoveFrom: string, playerMoveTo: string) => {
        // console.log(
        //   `player make move from ${playerMoveFrom} to ${playerMoveTo}`
        // );
        if (this.socketsRecord.get(socket.id)?.isInMultiplayerMode) {
          // console.log("multiplayer mode");
          socket
            .to(roomID)
            .emit("opponentMakeMove", playerMoveFrom, playerMoveTo);

          return;
        }
        // console.log("computer playing");
        chessEngine.updatePlayerMove(
          playerMoveFrom,
          playerMoveTo
        );
        let [opponentMoveFrom, opponentMoveTo] = await (
          chessEngine as ChessMinimaxModel
        ).computerMakingMove();

  

        if (opponentMoveFrom && opponentMoveTo)
          socket.emit("opponentMakeMove", opponentMoveFrom, opponentMoveTo);
      }
    );

    socket.on("playerUndo", async (callback: (succeed: boolean) => void) => {
      if (this.socketsRecord.get(socket.id)?.isInMultiplayerMode)
        callback(false);

      try {
        chessEngine.playerUndo();
      } catch (e: any) {
        callback(false);
      }
      callback(true);
    });

    socket.on(
      "setDifficulty",
      async (difficulty: number, callback: (succeed: boolean) => void) => {
        if (this.socketsRecord.get(socket.id)?.isInMultiplayerMode)
          callback(false);
        try {
          difficulty = difficulty;
          chessEngine.setSearchDepth(difficulty);
          // console.log(`Set difficulty to ${difficulty}`);
          callback(true);
        } catch (e: any) {
          callback(false);
        }
      }
    );

    socket.on("setNewGame", async (callback: (succeed: boolean) => void) => {
      if (this.socketsRecord.get(socket.id)?.isInMultiplayerMode) {
        try {
          socket.to(roomID).emit("setNewGame");
          callback(true);
        } catch (e: any) {
          // console.log(e);
          callback(false);
        }
      } else {
        try {
          chessEngine = new ChessMinimaxModel(difficulty, "random");
          callback(true);
        } catch (e: any) {
          // console.log(e);
          callback(false);
        }
      }
    });

    socket.on("disconnect", () => {
      console.info("Disconnect received from: " + socket.id);
      socket.to(roomID).emit("opponentDisconnected")
      if (this.socketsRecord.has(socket.id)) {
        if (this.roomsRecord.has(roomID)) {
            this.roomsRecord.delete(roomID);
          }
        this.socketsRecord.delete(socket.id);
      }
    });
  };
}
