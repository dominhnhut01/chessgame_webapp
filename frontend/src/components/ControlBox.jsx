import { useContext, useEffect, useState } from "react";
import "./ControlBox.css";
import { ChessContext } from "../ContextProvider/ChessContextProvider";
import { SocketContext } from "../ContextProvider/SocketContextProvider";

function HistoryBox() {
  const { moveHistory } = useContext(ChessContext);
  const [moveHistoryProcessed, setMoveHistoryProcessed] = useState([]);

  useEffect(() => {
    let temp = [];
    for (let idx = 0; idx < moveHistory.length; idx++) {
      if (idx % 2 === 0) temp.push(`${moveHistory[idx].san}`);
      else
        temp[temp.length - 1] = `${temp[temp.length - 1]} ${
          moveHistory[idx].san
        }`;
    }
    setMoveHistoryProcessed(temp);
    console.log('Move history: ');
    console.log(moveHistory);
  }, [moveHistory]);

  return (
    <div className="scrollable-content">
      {moveHistoryProcessed.map((move, idx) => (
        <div className="move-item" key={idx}>
          {idx + 1}. {move}
        </div>
      ))}
    </div>
  );
}

export default function ControlBox() {
  const {playerUndoEmit} = useContext(SocketContext);
  const {playerUndo, checkTurn} = useContext(ChessContext);
  const [message, setMessage] = useState("");
  function onClickUndoButton(evt) {
    if (checkTurn() !== 'w') {
      setMessage("Please wait until the computer finishes its turn");
      setTimeout(setMessage, 1000, "");
      return;
    }
    playerUndoEmit((succeed)=> {
      if (succeed) {
        console.log("call player undo")
        playerUndo();
      }
    })
  } 
  return (
    <div className="control-box">
      <div className="history-box">
        <HistoryBox />
      </div>
      <div className="button-box">
        <button type="button" className="btn btn-warning undo-btn" onClick={onClickUndoButton}>
          Undo
        </button>
        <button type="button" className="btn btn-danger new-game-btn">
          New Game
        </button>
      </div>
      <div className="message-box">
        {message}
      </div>
    </div>
  );
}
