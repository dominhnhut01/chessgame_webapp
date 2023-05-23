import { Chess } from "chess.js";
import { ChessAIEngine } from "./model/model";

class Game {
    game: Chess;
    aiEngine: ChessAIEngine;

    constructor() {
        this.game = new Chess();
        this.aiEngine = new ChessAIEngine();
    }

    takeOneTurn(): void {
        let moveList: string[] = this.game.moves();
        let playerMove = moveList[Math.floor(Math.random() * moveList.length)]
        this.game.move(playerMove);
        this.aiEngine.updatePlayerMove(playerMove);
        this.aiEngine.computerMakingMove();
    }

    getBoardAscii(): string {
        return this.game.ascii();
    }
}

export {Game};