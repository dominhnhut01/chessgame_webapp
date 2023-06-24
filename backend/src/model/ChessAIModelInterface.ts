import { Move } from "chess.js";
import { ChessEngine } from "./ChessModel";
interface ChessAIModelInterface {
    computerMakingMove(): Promise<string[]>;
    updatePlayerMove(playerMoveFrom: string, playerMoveTo: string): void;
    setSearchDepth(difficulty: number): void;
    playerUndo(): void;
    getFen(): string;
}

export default ChessAIModelInterface;