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
type GameStatus = "playerWin" | "aiWin" | "draw" | "notOver";

class ChessAIEngine {
  private readonly pieceTables = new Map([
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

  private readonly symbols: PieceSymbol[] = ["p", "n", "k", "q", "b", "r"];
  private readonly colors: Color[] = ["w", "b"];
  private readonly pieceWeights: Map<PieceSymbol, number> = new Map([
    ["p", 100],
    ["n", 320],
    ["b", 330],
    ["r", 500],
    ["q", 900],
    ["k", 800],
  ]);

  private readonly openingMovesMap: Map<string, MoveSAN[]> = new Map([
    ['italian_game', ['e5', 'Nf6', 'Bc5'].reverse()],
    ['guy_lopez', ['d5', 'Nc6', 'Bg4'].reverse()],
    ['vienna_game', ['e5', 'c5'].reverse()],
    ['queen_gambit', ['d5', 'c5'].reverse()],
    ['london_opening', ['e5', 'Nf6', 'Bc5'].reverse()],
    ['catalan_opening', ['d5', 'c5', 'g6'].reverse()],
  ])
  private minimaxSearchDepth: number;
  private chess: Chess;
  private curEvaluationScore: number;
  private openingMoves: MoveSAN[];
  private endOpeningMoves: boolean = false;

  constructor(difficultyLevel: number, openingStrategy: string = "italian_game") {
    this.chess = new Chess();
    this.curEvaluationScore = 10000 + this.calcEvaluationScore(this.chess.board());
    this.minimaxSearchDepth = difficultyLevel * 2 + 1;

    if (openingStrategy === 'random') {
      let openingMovesList = Array.from(this.openingMovesMap.values());
      this.openingMoves = openingMovesList[Math.floor(Math.random()*openingMovesList.length)];
    } else {
      this.openingMoves = this.openingMovesMap.get(openingStrategy);
    }
  }

  private switchSide(rank: Rank, file: File): [Rank, File] {
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
  private examineBoard(chessBoard: any[][]): Map<PieceName, Piece[]> {
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
          const [newRank, newFile] = this.switchSide(rank, file);
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
  private calcPositionScore(curPiece: Piece) {
    const rankDecode: number = parseInt(curPiece.position.rank) - 1;
    const fileDecode: number = curPiece.position.file.charCodeAt(0) - 97;
    return this.pieceTables.get(curPiece.pieceSymbol)![rankDecode][fileDecode];
  }

  private calcTotalPostionScore(
    symbol: PieceSymbol,
    piecesInfo: Map<string, Piece[]>
  ): number {
    //Remember that notation flips when different side

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
  private calcEvaluationScore(chessBoard: any[][]): number {
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

  private configMove(move: Move) {
    move.promotion = "q";
  }

  private calcNextEvaluationScore(nextMove: Move): number {
    let curScore = 0;

    let rankFrom = nextMove.from.charAt(1) as Rank;
    let fileFrom = nextMove.from.charAt(0) as File;
    let rankTo = nextMove.to.charAt(1) as Rank;
    let fileTo = nextMove.to.charAt(0) as File;
    if (nextMove.color === "b") {
      [rankFrom, fileFrom] = this.switchSide(rankFrom, fileFrom);
      [rankTo, fileTo] = this.switchSide(rankTo, fileTo);
    }

    const pieceFrom: Piece = {
      color: nextMove.color,
      pieceSymbol: nextMove.piece,
      pieceName: `${nextMove.piece}${nextMove.color}`,
      position: {
        rank: rankFrom,
        file: fileFrom,
      },
    };
    const pieceTo: Piece = {
      color: nextMove.color,
      pieceSymbol: nextMove.piece,
      pieceName: `${nextMove.piece}${nextMove.color}`,
      position: {
        rank: rankTo,
        file: fileTo,
      },
    };
    curScore +=
      (-this.calcPositionScore(pieceFrom) + this.calcPositionScore(pieceTo));

    //Update material curScore if there is a capture
    if (nextMove.flags.includes("c") || nextMove.flags.includes("e")) {
      const capturedPieceSymbol = nextMove.captured;
      const capturedPieceWeight = this.pieceWeights.get(capturedPieceSymbol);
      curScore += capturedPieceWeight;
    }

    return curScore;
  }

  private sortPotentialMoves(moves: Move[]) {
    const boolToNumber = (value: boolean) => {
      return value ? 1 : 0;
    };
    moves = moves.sort((a, b) => {
      return (
        boolToNumber(b.flags.includes("c")) +
        2 * boolToNumber(b.flags.includes("p")) -
        (boolToNumber(a.flags.includes("c")) +
          2 * boolToNumber(a.flags.includes("p")))
      );
    });

    return moves;
  }

  private minimaxWithAlphaBeta(
    curScore: number,
    alpha: number,
    beta: number,
    depth: number,
    prevMove: Move,
  ): [number, Move] {
    let bestScore = -99999;
    let bestMove: Move;

    if (this.chess.isCheckmate())
      return [99999, prevMove];

    if (depth === 0) return [curScore, prevMove];

    let potential_moves = this.chess.moves({ verbose: true });
    if (depth >= 2) potential_moves = this.sortPotentialMoves(potential_moves);

    for (let move of potential_moves) {
      this.configMove(move);
      let curScoreCopy = curScore;
      curScoreCopy += this.calcNextEvaluationScore(move);

      let nextMove = this.chess.move(move);
      let _ : Move;
      [curScoreCopy, _] = this.minimaxWithAlphaBeta(
        -curScoreCopy,
        -beta,
        -alpha,
        depth - 1,
        nextMove,
      );
      curScoreCopy = -curScoreCopy;

      this.chess.undo();
      if (alpha >= beta) return [alpha, bestMove];
      if (curScoreCopy > bestScore) {
        bestScore = curScoreCopy;
        bestMove = move;
      }
      if (curScoreCopy > alpha) alpha = curScoreCopy;
    }

    return [bestScore, bestMove];
  }


  private findBestMove(depth: number): Move {
    let [bestScore, bestMove] = this.minimaxWithAlphaBeta(
      -this.curEvaluationScore,
      -100000,
      100000,
      depth,
      null,
    );

    return bestMove;
  }
  /**
   * Computer will analyze and make the best move.
   * @returns the move that computer just made
   */
  computerMakingMove(): {[key: string]: string} {
    let bestMove: Move;
    //Perform opening move
    if (this.openingMoves.length > 0) {
      bestMove = this.chess.move(this.openingMoves.pop());

    } else {
      this.endOpeningMoves = true;
      bestMove = this.findBestMove(this.minimaxSearchDepth);
      this.chess.move(bestMove);
    }

    //Update score
    this.curEvaluationScore = -(-this.curEvaluationScore + this.calcNextEvaluationScore(bestMove));

    console.log(this.curEvaluationScore);
    return {from: bestMove.from, to :bestMove.to};
  }

  updatePlayerMove(playerMoveFrom: string, playerMoveTo: string): void {
    this.chess.move({
      from: playerMoveFrom,
      to: playerMoveTo,
      promotion: "q",
    });

    this.curEvaluationScore += this.calcNextEvaluationScore(
      this.chess.history({ verbose: true }).pop()
    );
    
    console.log(this.curEvaluationScore);
  }

  checkGameStatus() : GameStatus {
    const possibleMovesNumber = this.chess.moves().length;


    if (this.chess.isCheckmate() || possibleMovesNumber === 0)
      return this.chess.turn() === 'w' ? 'aiWin' : 'playerWin';

    else if (this.chess.isDraw())
      return "draw";
    else 
      return "notOver";
  }

  setMinimaxSearchDepth(difficulty: number) {
    this.minimaxSearchDepth = difficulty * 2 + 1;
  }

  playerUndo(): boolean {
    //Undo computer move and player move
    try {
      let moveUndo = this.chess.undo();
      if (!this.endOpeningMoves)
        this.openingMoves.push(moveUndo.san);
      console.log('undo')
      if (this.chess.turn() !== 'w') {
        this.chess.undo();
        console.log('undo')
      }
      this.curEvaluationScore = 10000 + this.calcEvaluationScore(this.chess.board());
    }
    catch (e: any) {
      console.log(e);
      return false;
    }
    return true;

  }
}

export {ChessAIEngine, GameStatus };
