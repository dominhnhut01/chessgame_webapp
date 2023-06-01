import { createContext, useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketContextProvider";
import { Chess } from "chess.js";

const ChessContext = createContext();

const ChessContextProvider = (props) => {
  const { playerMakeMoveEmit, newGameTrigger } = useContext(SocketContext);
  const [game, setGame] = useState(new Chess());
  const [capturedPieces, setCapturedPieces] = useState({
    black: [],
    white: [],
  });
  const [moveHistory, setMoveHistory] = useState([]);

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
  useEffect(() => {
    setNewGame();
  }, [newGameTrigger]);

  function computerMakeMove(playerMoveFrom, playerMoveTo) {
    playerMakeMoveEmit(playerMoveFrom, playerMoveTo, (computerMove) => {
      safeGameMutate(async (game) => {
        // console.log(computerMove);
        const move = await game.move({
          from: computerMove.from,
          to: computerMove.to,
          promotion: "q",
        });

        //Update captured pieces
        if (move.captured) {
          addCapturedPieces("white", move.captured);
        }
        //Update moveHistory
        updateMoveHistory(true);
      });
    });
  }

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
      updateMoveHistory(true);
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
        let newCapturedPieces = prevCapturedPieces[color].length > 0 ? prevCapturedPieces[color].slice(0, -1) : [...prevCapturedPieces[color]];
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
      const color = capture.color === 'w' ? 'black' : 'white';
      await popCapturedPieces(color);
    }
    //Update moveHistory
    updateMoveHistory(true);
  }

  function updateMoveHistory(verbose) {
    setMoveHistory(game.history({ verbose: verbose }));
  }

  function checkTurn() {
    return game.turn();
  }

  return (
    <ChessContext.Provider
      value={{
        game,
        capturedPieces,
        computerMakeMove,
        playerMakeMove,
        playerUndo,
        moveHistory,
        checkTurn,
        setNewGame,
      }}
    >
      {props.children}
    </ChessContext.Provider>
  );
};

export { ChessContext, ChessContextProvider };
