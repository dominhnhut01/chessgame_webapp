import { Move } from "chess.js";
import ChessAIModelInterface from "./ChessAIModelInterface";
import { ChessEngine } from "./ChessModel";
import { Engine } from "node-uci";

class ChessStockfishModel extends ChessEngine implements ChessAIModelInterface {
  private stockfishEngine: Engine;
  private searchDepth = 8;
  private constructor(stockfishEngine: Engine, difficulty: number) {
    super();
    this.searchDepth = 8 + difficulty
    this.stockfishEngine = stockfishEngine;
  }

  public static async loadStockfishEngine(difficulty: number): Promise<ChessStockfishModel> {
    const stockfishEngine: Engine = new Engine(
      "/home/dominhnhut01/work/personal_project/web_development/chessgame_webapp/backend/src/model/stockfish_15.1_linux_x64/stockfish-ubuntu-20.04-x86-64"
    );
    await stockfishEngine.init();
    await stockfishEngine.isready();

    return new ChessStockfishModel(stockfishEngine, difficulty);
  }

  updatePlayerMove(playerMoveFrom: string, playerMoveTo: string): void {
    this.chess.move({
      from: playerMoveFrom,
      to: playerMoveTo,
      promotion: "q",
    });

    this.stockfishEngine.position(this.chess.fen());
  }
  async computerMakingMove(): Promise<string[]> {
    const stockfishMoveSAN = await this.loadStockfishMove();
    const computerMove = this.chess.move(stockfishMoveSAN);
    return [computerMove.from as string, computerMove.to as string];
  }


  async loadStockfishMove(): Promise<string> {
    return new Promise<string>(async (resolve) => {
      const stockfishMove = await this.stockfishEngine.go({depth: this.searchDepth});
      resolve(stockfishMove.bestmove);
    })
  }

  setSearchDepth(difficulty: number): void {
      this.searchDepth = 8 + difficulty;
  }

  playerUndo(): void {
      this.chess.undo();
      this.chess.undo();
  }
}

export default ChessStockfishModel;
