import { Chess } from "chess.js";
import ChessAIEngine from "./model/model";
// const inquirer = require('inquirer');

class Game {
  game: Chess;
  aiEngine: ChessAIEngine;

  constructor() {
    this.game = new Chess();
    this.aiEngine = new ChessAIEngine();
  }

  takeOneTurn(): boolean {
    if (this.game.isCheck()) {
      console.log("computer is in checked");
    }
    if (this.game.isCheckmate()) {
      console.log("computer is in checkmate. Game end!");
      return false;
    }
    let computerMove: string = this.aiEngine.computerMakingMove();
    this.game.move(computerMove);
    console.log(this.game.ascii());

    if (this.game.isCheck()) {
      console.log("player is in checked");
    }
    if (this.game.isCheckmate()) {
      console.log("player is in checkmate. Game end!");
      return false;
    }

    let moveList: string[] = this.game.moves();
    let playerMove = moveList[Math.floor(Math.random() * moveList.length)]
    // inquirer.prompt(["Please make your move: "]).then((playerMove: string) => {
    //   this.game.move(playerMove);
    //   this.aiEngine.updatePlayerMove(playerMove);
    // });
    console.log(this.game.ascii());
    console.log(
      "---------------------------------------------------------------------"
    );
    return true;
  }

  getBoardAscii(): string {
    return this.game.ascii();
  }
}

export default Game;
