import { createContext, useState, useEffect, useContext } from "react";
import { socket } from "../socket";
import { useNavigate, useParams } from "react-router-dom";

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
  const navigate = useNavigate();

  const [roomID, setRoomID] = useState(useParams().roomID);
  const [playerColor, setPlayerColor] = useState("white");

  const [isConnected, setIsConnected] = useState(socket.connected);
  const baseLink = window.location.href
  const [roomLink, setRoomLink] = useState(
    roomID ? `${baseLink}${roomID}` : ""
  ); //Set room link later by calling the backend

  const avatars = selectRandom(avatarFilePaths);

  useEffect(() => {
    async function joinRoom(socket) {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          // Handle timeout
          resolve(false); // Resolve the promise with false indicating failure
        }, 300); // Timeout duration in milliseconds (e.g., 5000ms = 5 seconds)
    
        socket.emit("joinRoom", roomID, async (succeed, roomID, playerColorReturn) => {
          clearTimeout(timeout); // Clear the timeout since the callback was executed
    
          setIsConnected(succeed);
          if (!succeed) {
            alert("Room is full or does not exist! Please reload the website to continue");
            socket.disconnect();
            ChessAndSocketEventEmitter.emit("setNewGame");
            navigate('/');
          }
          if (playerColor !== playerColorReturn)
            setPlayerColor(playerColorReturn);
          setRoomID(roomID);
          setRoomLink(`${baseLink}${roomID}`);
    
          resolve(succeed); // Resolve the promise with the value of succeed
        });
      });
    }

    async function connectSocket() {
      // Code to initialize and connect the socket
      // Loop until socket.isConnected() returns true
      let succeed = false;
      while (!succeed) {
        console.log("sending joinRoom request")
        succeed = await joinRoom(socket);
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Delay for 1 second
      }

      ChessAndSocketEventEmitter.emit("setNewGame");
    }

    connectSocket();
  }, []);

  useEffect(() => {
    console.log(isConnected)
  }, [isConnected])

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

  socket.on("opponentDisconnected", () => {
    alert("Opponent disconnected! Please reload the website to start a new game");
    socket.disconnect();
    navigate('/');
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

  function setAIModelEmit(aiModel, callback) {
    socket.emit("setAIModel", aiModel, (succeed) => {
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
        setAIModelEmit
      }}
    >
      {props.children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketContextProvider };
