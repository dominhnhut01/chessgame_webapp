import { Chess, Move, PieceSymbol, Color } from "chess.js";

type PieceName = `${PieceSymbol}${Color}`;
type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
type File = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
type Square = {
  rank: Rank;
  file: File;
};

type MoveSAN = string;

type Piece = {
  color: Color;
  pieceSymbol: PieceSymbol;
  pieceName: PieceName;
  position: Square;
};
type GameStatus = "whiteWin" | "blackWin" | "draw" | "notOver";

class ChessEngine {
  protected chess: Chess;
  constructor() {
    this.chess = new Chess();
  }
  
  makeMove(
    move: Move | string | { from: string; to: string; promotion: PieceSymbol }
  ): Move {
    return this.chess.move(move);
  }

  checkGameStatus(): GameStatus {
    const possibleMovesNumber = this.chess.moves().length;

    if (this.chess.isCheckmate() || possibleMovesNumber === 0)
      return this.chess.turn() === "w" ? "blackWin" : "whiteWin";
    else if (this.chess.isDraw()) return "draw";
    else return "notOver";
  }
  undo(): Move | null {
    return this.chess.undo();
  }
}

export {
  ChessEngine,
  GameStatus,
  PieceName,
  Rank,
  File,
  Square,
  MoveSAN,
  Piece,
};
