import { createContext, useState, useEffect } from "react";
import { socket } from "../socket";

const SocketContext = createContext();

const SocketContextProvider = (props) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  const playerMakeMoveEmit = (playerMoveFrom, playerMoveTo, chessCallback) => {
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
    alert(`Game Over: ${gameResult}`);
    socket.disconnect();
  })

  const playerUndoEmit = (callback) => {
    socket.emit("playerUndo", (succeed) => {
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
    };

    connectSocket();
  }, []);

  return (
    <SocketContext.Provider value={{isConnected, playerMakeMoveEmit, playerUndoEmit}}>
      {props.children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketContextProvider };