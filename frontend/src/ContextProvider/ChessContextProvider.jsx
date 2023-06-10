import { createContext, useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketContextProvider";
import { Chess } from "chess.js";
import { ChessAndSocketEventEmitter } from "./ChessAndSocketEventEmitter";

const ChessContext = createContext();

const ChessContextProvider = (props) => {
  const { playerColor } = useContext(SocketContext);
  const [game, setGame] = useState(new Chess());
  const [capturedPieces, setCapturedPieces] = useState({
    black: [],
    white: [],
  });
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState("notOver");


  function safeGameMutate(modify) {
    return new Promise((resolve, reject) => {
      setGame((g) => {
        const update = { ...g };
        modify(update);
        resolve();
        return update;
      });
    });
  }

  function setNewGame() {
    setGame(new Chess());
    setCapturedPieces({
      black: [],
      white: [],
    });
    setMoveHistory([]);
  }

  function playerMakeMoveEmit(playerMoveFrom, playerMoveTo) {
    console.log("playerMakeMove: ChessContextProvider");
    console.log(`player move from ${playerMoveFrom} to ${playerMoveTo}`);
    ChessAndSocketEventEmitter.emit("playerMakeMove", {
      playerMoveFrom,
      playerMoveTo,
    });
  }

  useEffect(() => {
    ChessAndSocketEventEmitter.on("opponentMakeMove", (data) => {
      safeGameMutate(async (game) => {
        // console.log(computerMove);
        const move = await game.move({
          from: data.opponentMoveFrom,
          to: data.opponentMoveTo,
          promotion: "q",
        });
        if (!move) return;

        //Update captured pieces
        if (move.captured) {
          addCapturedPieces("white", move.captured);
        }
        //Update moveHistory
      });
    });
    ChessAndSocketEventEmitter.on("setNewGame", () => {
      setNewGame();
    });
  }, []);

  function playerMakeMove(playerMoveFrom, playerMoveTo, callback) {
    safeGameMutate(async (game) => {
      const move = await game.move({
        from: playerMoveFrom,
        to: playerMoveTo,
        promotion: "q",
      });

      if (move === null) {
        callback(false);
        return;
      }

      //Update captured pieces
      if (move.captured) {
        addCapturedPieces("black", move.captured);
      }
      //Update moveHistory
      callback(true);
    });
  }
  function addCapturedPieces(color, pieceSymbol) {
    setCapturedPieces((prevCapturedPieces) => {
      return {
        ...prevCapturedPieces,
        [color]: [...prevCapturedPieces[color], pieceSymbol],
      };
    });
  }

  function popCapturedPieces(color) {
    return new Promise((resolve, reject) => {
      setCapturedPieces((prevCapturedPieces) => {
        let newCapturedPieces =
          prevCapturedPieces[color].length > 0
            ? prevCapturedPieces[color].slice(0, -1)
            : [...prevCapturedPieces[color]];
        return {
          ...prevCapturedPieces,
          [color]: newCapturedPieces,
        };
      });

      resolve();
    });
  }

  async function chessUndo() {
    return new Promise(async (resolve, reject) => {
      await safeGameMutate((game) => {
        let captures = [];
        for (let i = 0; i < 2; i++) {
          const moveUndo = game.undo();
          captures.push(moveUndo);
        }
        resolve(captures);
      });
    });
  }

  async function playerUndo() {
    //Undo twice: computer move and playermove
    const captures = await chessUndo();
    for (const capture of captures) {
      console.log(capture.color);
      const color = capture.color === "w" ? "black" : "white";
      await popCapturedPieces(color);
    }
    //Update moveHistory
  }

  function updateMoveHistory(verbose) {
    console.log("Game History");
    console.log(game.history({ verbose: verbose }));
    setMoveHistory(game.history({ verbose: verbose }));
  }

  function checkTurn() {
    return game.turn();
  }

  function checkGameStatus() {
    const possibleMovesNumber = game.moves().length;

    if (game.in_checkmate() || possibleMovesNumber === 0)
      return game.turn() === "w" ? "blackWin" : "whiteWin";
    else if (game.in_draw()) return "draw";
    else return "notOver";
  }

  useEffect(() => {
    updateMoveHistory(true);
    setGameStatus(checkGameStatus());
  }, [game]);

  return (
    <ChessContext.Provider
      value={{
        game,
        capturedPieces,
        playerMakeMove,
        playerMakeMoveEmit,
        playerUndo,
        moveHistory,
        checkTurn,
        setNewGame,
        gameStatus
      }}
    >
      {props.children}
    </ChessContext.Provider>
  );
};

export { ChessContext, ChessContextProvider };
