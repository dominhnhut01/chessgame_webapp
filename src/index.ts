import { Game } from "./game";

let game = new Game();
for (let i=0; i<=7; i++) {
    game.takeOneTurn();
    console.log(game.getBoardAscii());
}

