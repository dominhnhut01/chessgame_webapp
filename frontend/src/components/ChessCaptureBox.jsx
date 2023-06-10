import { useContext } from "react";
import "./ChessCaptureBox.css";
import { SocketContext } from "../ContextProvider/SocketContextProvider";
import { ChessContext } from "../ContextProvider/ChessContextProvider";

export default function ChessCaptureBox(props) {
  const { avatars } = useContext(SocketContext);
  const {checkTurn} = useContext(ChessContext)

  const chessSymbols = new Map([
    [
      "black",
      new Map([
        ["k", "♚"],
        ["q", "♛"],
        ["r", "♜"],
        ["b", "♝"],
        ["n", "♞"],
        ["p", "♟︎"],
      ]),
    ],
    [
      "white",
      new Map([
        ["k", "♔"],
        ["q", "♕"],
        ["r", "♖"],
        ["b", "♗"],
        ["n", "♘"],
        ["p", "♙"],
      ]),
    ],
  ]);

  let pieces = props.capturedPieces.map((pieceSymbol) => {
    return chessSymbols.get(props.color).get(pieceSymbol);
  });
  return (
    <div className="chess-capture-box">
      <div className="chess-capture-box-headline">
        {props.headline}
        <div className={`avatar-wrapper shadow-box ${(props.color === 'white' &&checkTurn() === 'b') || (props.color === 'black' &&checkTurn() === 'w')? "pulse" : ""}`}>
          <img src={avatars[props.color]} className="avatar" />
        </div>
      </div>
      <div className="capturedPieces shadow-box">
        {pieces.map((piece, idx) => (
          <div className="capturedPiece" key={idx}>
            {piece}
          </div>
        ))}
      </div>
    </div>
  );
}
