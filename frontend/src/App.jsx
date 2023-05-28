import "./App.css";
import { useEffect, useState } from "react";
import ChessBoard from "./components/ChessBoard";
import { SocketContext, SocketContextProvider } from "./ContextProvider/SocketContextProvider";

function App() {
  return (
    <SocketContextProvider >
    <div className="app">
      <ChessBoard />
    </div>
    </SocketContextProvider>
  );
}

export default App;
