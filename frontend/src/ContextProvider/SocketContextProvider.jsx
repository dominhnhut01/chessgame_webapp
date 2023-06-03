import { createContext, useState, useEffect, useContext } from "react";
import { socket } from "../socket";
import { useParams } from "react-router-dom";

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
  const roomID = useParams().roomID;
  const playerColor = roomID ? "black" : "white";

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [newGameTrigger, setNewGameTrigger] = useState(false);
  const [roomLink, setRoomLink] = useState(roomID ? `http://localhost:5173/${roomID}` : ""); //Set room link later by calling the backend
  const [gameStatus, setGameStatus] = useState("notOver");

  const avatars = selectRandom(avatarFilePaths)

  function playerMakeMoveEmit(playerMoveFrom, playerMoveTo, chessCallback) {
    socket.emit(
      "playerMakeMove",
      playerMoveFrom,
      playerMoveTo,
      (computerMove) => {
        console.log("Received computer move: " + computerMove)
        chessCallback(computerMove);
      }
    );
  };

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


  useEffect(() => {
    const handshake = async (socket) => {
      socket.emit("handshake", async () => {
        console.log("Establish handshake");
      });
    };

    const connectSocket = async () => {
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

  return (
    <SocketContext.Provider value={{avatars, isConnected, playerMakeMoveEmit, playerUndoEmit, newGameTrigger, setNewGameEmit, setDifficultyEmit, roomLink, gameStatus, playerColor}}>
      {props.children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketContextProvider };