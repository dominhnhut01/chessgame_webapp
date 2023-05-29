import './ChessCaptureBox.css'

export default function ChessCaptureBox(props) {
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
      {props.headline}:
      <div className="capturedPieces">
        {pieces.map((piece, idx) => (
          <div className="capturedPiece" key={idx}>{piece}</div>
        ))}
      </div>
    </div>
  )
}
