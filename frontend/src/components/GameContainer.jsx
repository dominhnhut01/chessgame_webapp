import { useContext } from "react";
import { SocketContext } from "../ContextProvider/SocketContextProvider";
import { ChessContext } from "../ContextProvider/ChessContextProvider";
import ChessCaptureBox from "./ChessCaptureBox";
import ChessBoard from "./ChessBoard";

import "./GameContainer.css";

export default function GameContainer(props) {
  const { isConnected } = useContext(SocketContext);
  const { capturedPieces } = useContext(ChessContext);
  const {playerColor} = useContext(SocketContext);

  if (!isConnected) {
    return <div className="app">Loading...</div>;
  }
  if (playerColor === "black") {
    return (
      <div className="game-container">
      <ChessCaptureBox
        color={"black"}
        capturedPieces={capturedPieces["black"]}
        headline={"White"}
      />
      <div className="chessboard">
        <ChessBoard />
      </div>
      <ChessCaptureBox
        color={"white"}
        capturedPieces={capturedPieces["white"]}
        headline={"Black"}
      />
    </div>
    )
  }

  return (
    <div className="game-container">
      <ChessCaptureBox
        color={"white"}
        capturedPieces={capturedPieces["white"]}
        headline={"Black"}
      />
      <div className="chessboard">
        <ChessBoard />
      </div>
      <ChessCaptureBox
        color={"black"}
        capturedPieces={capturedPieces["black"]}
        headline={"White"}
      />
    </div>
  );
}
