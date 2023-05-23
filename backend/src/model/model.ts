import { Chess, Move, PieceSymbol, Color} from 'chess.js';

type PieceName = `${PieceSymbol}${Color}`;
type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
type File = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
type Square = {
  rank: Rank;
  file: File;
};

type Piece = {
  color: Color;
  pieceSymbol: PieceSymbol;
  pieceName: PieceName;
  position: Square;
};

class ChessAIEngine {
  readonly pieceTables = new Map([
    [
      "p",
      [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [5, 10, 10, -20, -20, 10, 10, 5],
        [5, -5, -10, 0, 0, -10, -5, 5],
        [0, 0, 0, 20, 20, 0, 0, 0],
        [5, 5, 10, 25, 25, 10, 5, 5],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
    ],
    [
      "n",
      [
        [-50, -40, -30, -30, -30, -30, -40, -50],
        [-40, -20, 0, 5, 5, 0, -20, -40],
        [-30, 5, 10, 15, 15, 10, 5, -30],
        [-30, 0, 15, 20, 20, 15, 0, -30],
        [-30, 5, 15, 20, 20, 15, 5, -30],
        [-30, 0, 10, 15, 15, 10, 0, -30],
        [-40, -20, 0, 0, 0, 0, -20, -40],
        [-50, -40, -30, -30, -30, -30, -40, -50],
      ],
    ],
    [
      "b",
      [
        [-20, -10, -10, -10, -10, -10, -10, -20],
        [-10, 5, 0, 0, 0, 0, 5, -10],
        [-10, 10, 10, 10, 10, 10, 10, -10],
        [-10, 0, 10, 10, 10, 10, 0, -10],
        [-10, 5, 5, 10, 10, 5, 5, -10],
        [-10, 0, 5, 10, 10, 5, 0, -10],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-20, -10, -10, -10, -10, -10, -10, -20],
      ],
    ],
    [
      "r",
      [
        [0, 0, 0, 5, 5, 0, 0, 0],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [5, 10, 10, 10, 10, 10, 10, 5],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
    ],
    [
      "q",
      [
        [20, 30, 10, 0, 0, 10, 30, 20],
        [20, 20, 0, 0, 0, 0, 20, 20],
        [-10, -20, -20, -20, -20, -20, -20, -10],
        [-20, -30, -30, -40, -40, -30, -30, -20],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
      ],
    ],

    [
      "k",
      [
        [20, 30, 10, 0, 0, 10, 30, 20],
        [20, 20, 0, 0, 0, 0, 20, 20],
        [-10, -20, -20, -20, -20, -20, -20, -10],
        [-20, -30, -30, -40, -40, -30, -30, -20],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
      ],
    ],
  ]);

  readonly symbols: PieceSymbol[] = ["p", "n", "k", "q", "b", "r"];
  readonly colors: Color[] = ["w", "b"];
  readonly pieceWeights: Map<PieceSymbol, number> = new Map([
    ["p", 1000],
    ["n", 3200],
    ["b", 3300],
    ["r", 5000],
    ["q", 9000],
    ["k", 20000],
  ]);
  minimaxSearchDepth: number;
  chess: Chess;
  curEvaluationScore: number;

  constructor(difficultyLevel: number) {
    this.chess = new Chess();
    this.curEvaluationScore = this.calcEvaluationScore(this.chess.board());
    this.minimaxSearchDepth = difficultyLevel * 2 + 1;

  }

  switchSide(rank: Rank, file: File): [Rank, File] {
    const newRank: Rank = (9 - parseInt(rank)).toString() as Rank;
    const newFile: File = String.fromCharCode(
      7 - (file.charCodeAt(0) - 97) + 97
    ) as File;

    return [newRank, newFile];
  }
  /**
   * This function find the position of all chess piece on the current chessboard
   * @param chessBoard
   * @returns countRecord: {'chessPieceName': Piece[]}
   */
  examineBoard(chessBoard: any[][]): Map<PieceName, Piece[]> {
    let countRecord = new Map<PieceName, Piece[]>();
    chessBoard.forEach((row) => {
      row.forEach((square) => {
        if (
          square === null ||
          square.type === undefined ||
          square.color === undefined
        )
          return;
        const rank: Rank = square.square.charAt(1);
        const file: File = square.square.charAt(0);
        const curSymbol = square.type;
        const curColor = square.color;
        const curPieceName: PieceName = curSymbol + curColor;
        if (!countRecord.has(curPieceName)) countRecord.set(curPieceName, []);

        let curPiece: Piece;

        if (square.color === "w") {
          const position: Square = {
            rank: rank,
            file: file,
          };
          curPiece = {
            position: position,
            pieceName: curPieceName,
            color: curColor,
            pieceSymbol: curSymbol,
          };
        } else {
          const [newRank, newFile] = this.switchSide(
            rank,
            file
          );
          const position: Square = {
            rank: newRank,
            file: newFile,
          };
          curPiece = {
            position: position,
            pieceName: curPieceName,
            color: curColor,
            pieceSymbol: curSymbol,
          };
        }
        countRecord.get(curPieceName)?.push(curPiece);
      });
    });

    return countRecord;
  }
  /**
   * Calculate the position score of one single piece
   * @param curPiece
   * @returns
   */
  calcPositionScore(curPiece: Piece) {
    const rankDecode: number = parseInt(curPiece.position.rank) - 1;
    const fileDecode: number = curPiece.position.file.charCodeAt(0) - 97;
    return this.pieceTables.get(curPiece.pieceSymbol)![rankDecode][fileDecode];
  }

  calcTotalPostionScore(
    symbol: PieceSymbol,
    piecesInfo: Map<string, Piece[]>
  ): number {
    //Remember that notation flips when different side
    // const sumTable = piecesInfo.get(symbol + "w")!.reduce((curSum: number, piece) => {
    //   const curIdx = parseInt(piece.rank) * 8 + (piece.file.charCodeAt(0) - 97);
    //   curSum += this.pieceTables.get(symbol)![curIdx];
    // }, [])

    let curSum = 0;
    if (piecesInfo.has(symbol + "w")) {
      for (let curPiece of piecesInfo.get(symbol + "w")!) {
        curSum += this.calcPositionScore(curPiece);
      }
    }

    if (piecesInfo.has(symbol + "b")) {
      for (let curPiece of piecesInfo.get(symbol + "b")!) {
        curSum -= this.calcPositionScore(curPiece);
      }
    }

    return curSum;
  }
  /**
   * This function return the evaluation score of a specific board
   * @returns evaluation score: number
   */
  calcEvaluationScore(chessBoard: any[][]): number {
    const piecesInfo: Map<PieceName, Piece[]> = this.examineBoard(chessBoard);
    let material = 0;
    let positionScore = 0;
    for (let symbol of this.symbols) {
      let pieceNumberDifference: number = 0;
      if (piecesInfo.has(`${symbol}b`)) {
        pieceNumberDifference -= piecesInfo.get(`${symbol}b`)!.length;
      }

      if (piecesInfo.has(`${symbol}w`)) {
        pieceNumberDifference += piecesInfo.get(`${symbol}w`)!.length;
      }

      material += this.pieceWeights.get(symbol)! * pieceNumberDifference;

      positionScore += this.calcTotalPostionScore(symbol, piecesInfo);
    }

    return this.chess.turn() !== "w"
      ? material + positionScore
      : -material - positionScore;
  }

  calcNextEvaluationScore(moveHistory: Move[], scoreHistory: number[]): number {
    let score = -this.curEvaluationScore;
    const refScore = this.calcEvaluationScore(this.chess.board());
    let scores_log: number[] = [];
    for (let idx = 0; idx < moveHistory.length; idx++) {
      score = -score
      let move = moveHistory[idx];
      //Update position score
      let rankFrom = move.from.charAt(1) as Rank;
      let fileFrom = move.from.charAt(0) as File;
      let rankTo = move.to.charAt(1) as Rank;
      let fileTo = move.to.charAt(0) as File;
      if (move.color === "b") {
        [rankFrom, fileFrom] = this.switchSide(rankFrom, fileFrom);
        [rankTo, fileTo] = this.switchSide(rankTo, fileTo);
      }

      const pieceFrom: Piece = {
        color: move.color,
        pieceSymbol: move.piece,
        pieceName: `${move.piece}${move.color}`,
        position: {
          rank: rankFrom,
          file: fileFrom,
        },
      };
      const pieceTo: Piece = {
        color: move.color,
        pieceSymbol: move.piece,
        pieceName: `${move.piece}${move.color}`,
        position: {
          rank: rankTo,
          file: fileTo,
        },
      };
      const sign = move.color === "b" ? -1 : 1;
      score +=
        sign *
        (-this.calcPositionScore(pieceFrom) + this.calcPositionScore(pieceTo));

      //Update material score if there is a capture
      if (move.flags.includes("c") || move.flags.includes("e")) {
        const capturedPieceSymbol = move.captured;
        const capturedPieceWeight = this.pieceWeights.get(capturedPieceSymbol);
        score += sign * capturedPieceWeight;
      }
      score = -score;
      scores_log.push(score);
    }
    // score = -score;
    return score;
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

  alphabeta(
    alpha: number,
    beta: number,
    depth: number,
    moveHistory: Move[],
    scoreHistory: number[]
  ): number {
    // if (depth === 0) return this.quiesce(alpha, beta);
    if (depth === 0)
      return this.calcNextEvaluationScore(moveHistory, scoreHistory);
    // return -alpha;
    let bestScore = -9999;
    for (let move of this.chess.moves()) {
      const next_move = this.chess.move(move);
      scoreHistory.push(this.calcEvaluationScore(this.chess.board()));
      moveHistory.push(next_move);
      let score = -this.alphabeta(
        -beta,
        -alpha,
        depth - 1,
        moveHistory,
        scoreHistory
      );
      this.chess.undo();
      scoreHistory.pop();
      moveHistory.pop();
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
      const next_move = this.chess.move(move);
      let boardScore = -this.alphabeta(
        -beta,
        -alpha,
        depth - 1,
        [next_move],
        [this.calcEvaluationScore(this.chess.board())]
      );

      if (boardScore >= bestScore) {
        bestScore = boardScore;
        bestMove = move;
      }
      if (boardScore > alpha) alpha = boardScore;

      this.chess.undo();
    }

    this.curEvaluationScore = bestScore;
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
    let scoreHistory = [this.calcEvaluationScore(this.chess.board())];
    this.chess.move({
      from: playerMoveFrom,
      to: playerMoveTo,
      promotion: "q",
    });

    this.curEvaluationScore = -this.calcNextEvaluationScore(
      [this.chess.history({ verbose: true }).pop()],
      scoreHistory
    );
  }
}

export default ChessAIEngine;
