import { useContext, useEffect, useState } from "react";
import "./ControlBox.css";
import { ChessContext } from "../ContextProvider/ChessContextProvider";

function HistoryBox() {
  const { moveHistory } = useContext(ChessContext);
  const [moveHistoryProcessed, setMoveHistoryProcessed] = useState([]);

  useEffect(() => {
    // console.log(moveHistory)
    console.log("move history:");
    console.log(moveHistory);
    let temp = [];
    for (let idx = 0; idx < moveHistory.length; idx++) {
      if (idx % 2 === 0) temp.push(`${moveHistory[idx].san}`);
      else
        temp[temp.length - 1] = `${temp[temp.length - 1]} ${
          moveHistory[idx].san
        }`;
    }
    setMoveHistoryProcessed(temp);
  }, [moveHistory]);

  useEffect(() => {
    console.log(moveHistoryProcessed);
  }, [moveHistoryProcessed]);
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
  return (
    <div className="control-box">
      <div className="history-box">
        <HistoryBox />
      </div>
      <div className="button-box">
        <button type="button" className="btn btn-warning undo-btn">
          Undo
        </button>
        <button type="button" className="btn btn-danger new-game-btn">
          New Game
        </button>
      </div>
    </div>
  );
}
