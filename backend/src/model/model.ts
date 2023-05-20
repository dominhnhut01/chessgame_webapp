import { Chess, Color, PieceSymbol, Square } from "chess.js";

/**
 * Position info of the Piece
 */
type Piece = {
  rank: string;
  file: string;
};

class ChessAIEngine {
  readonly pieceTables = new Map([
    [
      "p",
      [
        0, 0, 0, 0, 0, 0, 0, 0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
        5, 5, 10, 25, 25, 10, 5, 5,
        0, 0, 0, 20, 20, 0, 0, 0,
        5, -5, -10, 0, 0, -10, -5, 5,
        5, 10, 10, -20, -20, 10, 10, 5,
        0, 0, 0, 0, 0, 0, 0, 0
      ],
    ],
    [
      "n",
      [
        -50, -40, -30, -30, -30, -30, -40, -50,
        -40, -20, 0, 0, 0, 0, -20, -40,
        -30, 0, 10, 15, 15, 10, 0, -30,
        -30, 5, 15, 20, 20, 15, 5, -30,
        -30, 0, 15, 20, 20, 15, 0, -30,
        -30, 5, 10, 15, 15, 10, 5, -30,
        -40, -20, 0, 5, 5, 0, -20, -40,
        -50, -40, -30, -30, -30, -30, -40, -50
      ],
    ],
    [
      "b",
      [
        -20, -10, -10, -10, -10, -10, -10, -20,
        -10, 0, 0, 0, 0, 0, 0, -10,
        -10, 0, 5, 10, 10, 5, 0, -10,
        -10, 5, 5, 10, 10, 5, 5, -10,
        -10, 0, 10, 10, 10, 10, 0, -10,
        -10, 10, 10, 10, 10, 10, 10, -10,
        -10, 5, 0, 0, 0, 0, 5, -10,
        -20, -10, -10, -10, -10, -10, -10, -20,
      ],
    ],
    [
      "r",
      [
        0, 0, 0, 0, 0, 0, 0, 0,
        5, 10, 10, 10, 10, 10, 10, 5,
        -5, 0, 0, 0, 0, 0, 0, -5,
        -5, 0, 0, 0, 0, 0, 0, -5,
        -5, 0, 0, 0, 0, 0, 0, -5,
        -5, 0, 0, 0, 0, 0, 0, -5,
        -5, 0, 0, 0, 0, 0, 0, -5,
        0, 0, 0, 5, 5, 0, 0, 0
      ],
    ],
    [
      "q",
      [
        -20, -10, -10, -5, -5, -10, -10, -20,
        -10, 0, 0, 0, 0, 0, 0, -10,
        -10, 0, 5, 5, 5, 5, 0, -10,
        -5, 0, 5, 5, 5, 5, 0, 0,
        0, 0, 5, 5, 5, 5, 0, -5,
        -10, 0, 5, 5, 5, 5, 0, -10,
        -10, 5, 0, 0, 0, 0, 0, -10,
        -20, -10, -10, -5, -5, -10, -10, -20
      ],
    ],

    [
      "k",
      [
        20, 30, 10, 0, 0, 10, 30, 20,
        -30, -40, -40, -50, -50, -40, -40, -30,
        -30, -40, -40, -50, -50, -40, -40, -30,
        -30, -40, -40, -50, -50, -40, -40, -30,
        -30, -40, -40, -50, -50, -40, -40, -30,
        -10, -20, -20, -20, -20, -20, -20, -10,
        20, 20, 0, 0, 0, 0, 20, 20,
        20, 30, 10, 0, 0, 10, 30, 20
      ],
    ],
  ]);

  readonly types: string[] = ["p", "n", "k", "q", "b", "r"];
  readonly colors: string[] = ["w", "b"];
  readonly pieceWeights: Map<string, number> = new Map([
    ["p", 100],
    ["n", 320],
    ["b", 330],
    ["r", 500],
    ["q", 900],
  ]);

  readonly minimaxSearchDepth: number = 3;
  chess: Chess;

  constructor() {
    this.chess = new Chess();
  }

  switchSide(rank: string, file: string): string[] {
    const newRank: string = (9 - parseInt(rank)).toString();
    const newFile: string = (7 - (file.charCodeAt(0) - 97) + 97).toString();

    return [newRank, newFile];
  }
  /**
   * This function find the position of all chess piece on the current chessboard
   * @param chessBoard
   * @returns countRecord: {'chessPieceName': Piece[]}
   */
  examineBoard(chessBoard: any[][]): Map<string, Piece[]> {
    let countRecord = new Map<string, Piece[]>();
    chessBoard.forEach((row, rank) => {
      row.forEach((square, file) => {
        const curType = square?.type;
        const curColor = square?.color;
        if (curType === undefined || curColor === undefined) return;
        const curPieceCode: string = curType + curColor;
        if (!countRecord.has(curPieceCode)) countRecord.set(curPieceCode, []);

        let curPiece: Piece;
        if (curColor === "w") {
          curPiece = {
            rank: rank.toString(),
            file: String.fromCharCode(file + 97),
          };
        } else {
          // const [newRank, newFile] = this.switchSide(
          //   rank.toString(),
          //   String.fromCharCode(file + 97)
          // );
          // curPiece = {
          //   rank: newRank,
          //   file: newFile,
          // };
          curPiece = {
            rank: rank.toString(),
            file: String.fromCharCode(file + 97),
          };
        }
        countRecord.get(curPieceCode)?.push(curPiece);
      });
    });

    return countRecord;
  }


  calcPostionScore(type: string, piecesInfo: Map<string, Piece[]>): number {
    //Remember that notation flips when different side
    // const sumTable = piecesInfo.get(type + "w")!.reduce((curSum: number, piece) => {
    //   const curIdx = parseInt(piece.rank) * 8 + (piece.file.charCodeAt(0) - 97);
    //   curSum += this.pieceTables.get(type)![curIdx];
    // }, [])

    let curSum = 0;

    if (piecesInfo.has(type + "w")) {
      for (let curPiece of piecesInfo.get(type + "w")!) {
        const curIdx =
          parseInt(curPiece.rank) * 8 + (curPiece.file.charCodeAt(0) - 97);
        curSum += this.pieceTables.get(type)![curIdx];
      }
    }

    if (piecesInfo.has(type + "b")) {
      for (let curPiece of piecesInfo.get(type + "b")!) {
        const curIdx =
          parseInt(curPiece.rank) * 8 + (curPiece.file.charCodeAt(0) - 97);
        curSum -= this.pieceTables.get(type)![curIdx];
      }
    }
    return curSum;
  }
  /**
   * This function return the evaluation score of a specific board
   * @returns evaluation score: number
   */
  calcEvaluationScore(chessBoard: any[][]): number {
    const piecesInfo: Map<string, Piece[]> = this.examineBoard(chessBoard);
    let material = 0;
    let positionScore = 0;
    for (let type of this.types) {
      let pieceNumberDifference: number = 0;
      if (piecesInfo.has(type + "w")) {
        pieceNumberDifference += piecesInfo.get(type + "w")!.length;
      }

      if (piecesInfo.has(type + "b")) {
        pieceNumberDifference -= piecesInfo.get(type + "b")!.length;
      }

      material += this.pieceWeights.get(type)! * pieceNumberDifference;

      positionScore += this.calcPostionScore(type, piecesInfo);
    }
    return this.chess.turn() === "w"
      ? material + positionScore
      : -material - positionScore;
  }

  quiesce(alpha: number, beta: number): number {
    const standPat = this.calcEvaluationScore(this.chess.board());

    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    for (let move of this.chess.moves({ verbose: true })) {
      if (!move.flags.includes("c")) continue;
      this.chess.move(move);
      let score = -this.quiesce(-beta, -alpha);
      this.chess.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  alphabeta(alpha: number, beta: number, depth: number): number {
    if (depth === 0) return this.quiesce(alpha, beta);
    // return -alpha;
    let bestScore = -9999;
    for (let move of this.chess.moves()) {
      this.chess.move(move);
      let score = -this.alphabeta(-beta, -alpha, depth - 1);
      this.chess.undo();
      if (score >= beta) return score;
      if (score > bestScore) bestScore = score;
      if (score > alpha) alpha = score;
    }

    return bestScore;
  }
  findBestMove(depth: number): string {
    let bestMove: string = "";
    let bestScore = -999999;
    let alpha = -100000;
    let beta = 100000;
    for (let move of this.chess.moves()) {
      this.chess.move(move);
      let boardScore = -this.alphabeta(-beta, -alpha, depth - 1);

      if (boardScore >= bestScore) {
        bestScore = boardScore;
        bestMove = move;
      }
      if (boardScore > alpha) alpha = boardScore;

      this.chess.undo();
    }

    return bestMove;
  }

  /**
   * Computer will analyze and make the best move.
   * @returns the move that computer just made
   */
  computerMakingMove(): string {
    let bestMove: string = this.findBestMove(this.minimaxSearchDepth);
    this.chess.move(bestMove);
    return bestMove;
  }

  updatePlayerMove(playerMoveFrom: string, playerMoveTo: string): void {
    this.chess.move({
      from: playerMoveFrom,
      to: playerMoveTo,
      promotion: "q",
    });
  }
}

export default ChessAIEngine;
