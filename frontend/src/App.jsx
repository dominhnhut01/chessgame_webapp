import "./App.css";
import { useEffect, useState } from "react";
import ChessBoard from "./components/ChessBoard";
import {
  SocketContext,
  SocketContextProvider,
} from "./ContextProvider/SocketContextProvider";
import ControlBox from "./components/ControlBox";
import ChatBox from "./components/ChatBox";
import { ChessContextProvider } from "./ContextProvider/ChessContextProvider";
import ChessCaptureBox from "./components/ChessCaptureBox";
import GameContainer from "./components/GameContainer";

function App() {
  return (
    <SocketContextProvider>
      <ChessContextProvider>
        <div className="app container-fluid">
          <div className="row">
            <div className="col-2">
              <ChatBox />
            </div>
            <div className="col-8">
              <GameContainer/>
            </div>
            <div className="control-box-container col-2">
              <ControlBox />
            </div>
          </div>
        </div>
      </ChessContextProvider>
    </SocketContextProvider>
  );
}

export default App;
