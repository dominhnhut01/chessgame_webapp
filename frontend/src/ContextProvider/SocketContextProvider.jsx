import { createContext, useState, useEffect, useContext } from "react";
import { socket } from "../socket";
import { useParams } from "react-router-dom";

import { ChessAndSocketEventEmitter } from "./ChessAndSocketEventEmitter";

const SocketContext = createContext();
const avatarFilePaths = [
  "/avatar/robot1.png",
  "/avatar/robot2.png",
  "/avatar/robot3.png",
  "/avatar/robot4.png",
  "/avatar/robot5.png",
  "/avatar/robot6.png",
  "/avatar/robot7.png",
];
const selectRandom = (selectionPool) => {
  const randomNumber1 = Math.floor(Math.random() * selectionPool.length);
  let randomNumber2 = randomNumber1;
  while (randomNumber1 === randomNumber2)
    randomNumber2 = Math.floor(Math.random() * selectionPool.length);
  return {
    black: selectionPool[randomNumber1],
    white: selectionPool[randomNumber2],
  };
};

const SocketContextProvider = (props) => {
  const [roomID, setRoomID] = useState(useParams().roomID);
  const [playerColor, setPlayerColor] = useState("white");

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [roomLink, setRoomLink] = useState(
    roomID ? `http://172.20.2.49:5173/${roomID}` : ""
  ); //Set room link later by calling the backend

  const avatars = selectRandom(avatarFilePaths);

  useEffect(() => {
    async function joinRoom(socket) {
      socket.emit("joinRoom", roomID, async (succeed, roomID, playerColorReturn) => {
        setIsConnected(succeed);
        if (!succeed) {
          alert("Room is full or does not exist. Please join another room!");
          socket.disconnect();
        }
        console.log(`Join room: ${roomID}`);
        if (playerColor !== playerColorReturn)
          setPlayerColor(playerColorReturn);
        setRoomID(roomID);
        setRoomLink(`http://172.20.2.49:5173/${roomID}`);
      });
    }

    async function connectSocket() {
      // Code to initialize and connect the socket
      // Loop until socket.isConnected() returns true
      while (!socket.connected) {
        await joinRoom(socket);
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Delay for 1 second
        console.log(isConnected);
      }

      ChessAndSocketEventEmitter.emit("setNewGame");
    }

    connectSocket();
  }, []);

  useEffect(() => {
    ChessAndSocketEventEmitter.on("playerMakeMove", (data) => {
      // console.log("playerMakeMove: SocketContextProvider");
      // console.log(
      //   `listener number: ${ChessAndSocketEventEmitter.listenerCount(
      //     "playerMakeMove"
      //   )}`
      // );
      // console.log(
      //   `player move from ${data.playerMoveFrom} to ${data.playerMoveTo}`
      // );
      socket.emit(
        "playerMakeMove",
        data.playerMoveFrom,
        data.playerMoveTo,
      );
    });
  }, []);

  socket.on(
    "opponentMakeMove",
    (opponentMoveFrom, opponentMoveTo) => {
      
      ChessAndSocketEventEmitter.emit("opponentMakeMove", {
        opponentMoveFrom,
        opponentMoveTo,
      });
    }
  );

  socket.on("setNewGame", () => {
    ChessAndSocketEventEmitter.emit("setNewGame");
  })

  function setNewGameEmit(callback) {
    socket.emit("setNewGame", (succeed) => {
      callback(succeed);
    });
  }

  // socket.on("gameOver", (gameResult) => {
  //   setGameStatus(gameResult);
  //   console.log(gameStatus);
  // });

  function playerUndoEmit(callback) {
    socket.emit("playerUndo", (succeed) => {
      callback(succeed);
    });
  }
  

  function setDifficultyEmit(difficulty, callback) {
    socket.emit("setDifficulty", difficulty, (succeed) => {
      callback(succeed);
    });
  }

  return (
    <SocketContext.Provider
      value={{
        avatars,
        isConnected,
        playerUndoEmit,
        setNewGameEmit,
        setDifficultyEmit,
        roomLink,
        playerColor,
      }}
    >
      {props.children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketContextProvider };
