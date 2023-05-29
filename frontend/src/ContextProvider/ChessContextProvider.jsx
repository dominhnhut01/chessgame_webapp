import { createContext, useContext, useState } from "react";
import { SocketContext } from "./SocketContextProvider";
import { Chess } from "chess.js";

const ChessContext = createContext();

const ChessContextProvider = (props) => {
  const { playerMakeMoveEmit } = useContext(SocketContext);
  const [game, setGame] = useState(new Chess());
  const [capturedPieces, setCapturedPieces] = useState({
    black: [],
    white: [],
  });
  const [moveHistory, setMoveHistory] = useState([]);

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
    updateMoveHistory(true);
  }

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
          updateCapturedPieces("white", move.captured);
        }
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
        updateCapturedPieces("black", move.captured);
      }

      callback(true);
    });
  }
  function updateCapturedPieces(color, pieceSymbol) {
    setCapturedPieces((prevCapturedPieces) => {
      return {
        ...prevCapturedPieces,
        [color]: [...prevCapturedPieces[color], pieceSymbol],
      };
    });
  }

  function updateMoveHistory(verbose) {
    setMoveHistory(game.history({verbose: verbose}));
  }

  return (
    <ChessContext.Provider
      value={{ game, capturedPieces, computerMakeMove, playerMakeMove, moveHistory }}
    >
      {props.children}
    </ChessContext.Provider>
  );
};

export { ChessContext, ChessContextProvider };
