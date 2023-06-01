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
    console.log("Move history: ");
    console.log(moveHistory);
  }, [moveHistory]);

  return (
    <div className="move-items">
      {moveHistoryProcessed.map((move, idx) => (
        <div
          className={idx % 2 === 0 ? "move-item even" : "move-item odd"}
          key={idx}
        >
          {idx + 1}. {move}
        </div>
      ))}
    </div>
  );
}

export default function ControlBox() {
  const { playerUndoEmit, setNewGameEmit, setDifficultyEmit } =
    useContext(SocketContext);
  const { playerUndo, checkTurn, setNewGame } = useContext(ChessContext);
  const [message, setMessage] = useState("");

  function difficultySelect(evt) {
    setDifficultyEmit(parseInt(evt.target.value), (succeed) => {
      if (!succeed) alert("Please try setting difficulty again");
    });
  }
  function onClickUndoButton(evt) {
    if (checkTurn() !== "w") {
      setMessage("Please wait until the computer finishes its turn");
      setTimeout(setMessage, 1000, "");
      return;
    }
    playerUndoEmit((succeed) => {
      if (succeed) {
        playerUndo();
      }
    });
  }

  function onClickNewGameButton(evt) {
    setNewGameEmit((succeed) => {
      if (succeed) {
        setNewGame();
      }
    });
  }
  return (
    <div className="control-box">
      <div className="difficulty-select container-fluid">
        <div className="row">
          <div className="col-5" id="heading">
            Difficulty
          </div>
          <div className="col-7">
            <select
              class="form-select"
              aria-label="difficulty-select"
              onChange={difficultySelect}
            >
              <option value="0">Easy</option>
              <option selected value="1">
                Medium
              </option>
            </select>
          </div>
        </div>
      </div>
      <h6 id="move-history-heading">Move History</h6>
      <div className="history-box scrollable-content">
        <HistoryBox />
      </div>
      <div className="button-box">
        <button
          type="button"
          className="btn btn-warning undo-btn"
          onClick={onClickUndoButton}
        >
          Undo
        </button>
        <button
          type="button"
          className="btn btn-danger new-game-btn"
          onClick={onClickNewGameButton}
        >
          New Game
        </button>
      </div>
      <div className="message-box">{message}</div>
    </div>
  );
}
