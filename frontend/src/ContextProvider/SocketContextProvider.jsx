import { createContext, useState, useEffect, useContext } from "react";
import { socket } from "../socket";
import { useParams } from "react-router-dom";

import ChessAndSocketEventEmitter from "./ChessAndSocketEventEmitter";

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
}

const SocketContextProvider = (props) => {
  const [roomID, setRoomID] = useState(useParams().roomID);
  let [userID, setUserID] = useState("");
  const playerColor = roomID ? "black" : "white";

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [newGameTrigger, setNewGameTrigger] = useState(false);
  const [roomLink, setRoomLink] = useState(roomID ? `http://localhost:5173/${roomID}` : ""); //Set room link later by calling the backend
  const [gameStatus, setGameStatus] = useState("notOver");

  const avatars = selectRandom(avatarFilePaths);

  useEffect(() => {
    async function handshake(socket) {
      socket.emit("handshake", roomID, playerColor, async (userID, roomID) => {
        console.log("Establish handshake");
        setRoomID(roomID);
        setUserID(userID);
        setRoomLink(`http://localhost:5173/${roomID}`);
      });
    };

    async function connectSocket() {
      // Code to initialize and connect the socket
      // Loop until socket.isConnected() returns true
      while (!socket.connected) {
        await handshake(socket);
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Delay for 1 second
        console.log(isConnected);
      }

      setIsConnected(true);
      toggleNewGameTrigger();
    };

    connectSocket();
  }, []);

  ChessAndSocketEventEmitter.on("playerMakeMove", (playerMoveFrom, playerMoveTo) => {
    console.log("playerMakeMove: SocketContextProvider");
    console.log(`listener number: ${ChessAndSocketEventEmitter.listenerCount("playerMakeMove")}`)

    socket.emit(
      "playerMakeMove",
      playerMoveFrom,
      playerMoveTo,
      playerColor,
    )
  })

  socket.on("opponentMakeMove", (opponentMoveFrom, opponentMoveTo, opponentColor) => {
    ChessAndSocketEventEmitter.emit("opponentMakeMove", opponentMoveFrom, opponentMoveTo, opponentColor);
  })

  socket.on("gameOver", (gameResult) => {
    setGameStatus(gameResult);
    console.log(gameStatus);
  })

  function playerUndoEmit(callback) {
    socket.emit("playerUndo", (succeed) => {
      callback(succeed);
    })
  }

  function toggleNewGameTrigger() {
    setNewGameTrigger(prevTrigger => {
      return !prevTrigger;
    })
  }
  function setNewGameEmit(callback) {
    socket.emit("setNewGame", (succeed) => {
      callback(succeed);
    })
  }

  function setDifficultyEmit(difficulty, callback) {
    socket.emit("setDifficulty", difficulty, (succeed) => {
      callback(succeed);
    })
  }


  

  return (
    <SocketContext.Provider value={{avatars, isConnected, playerUndoEmit, newGameTrigger, setNewGameEmit, setDifficultyEmit, roomLink, gameStatus, playerColor}}>
      {props.children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketContextProvider };