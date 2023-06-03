import { useContext, useEffect, useState } from "react";

import { BiUndo, BiRefresh } from "react-icons/bi";
import { FiClipboard } from "react-icons/fi";

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

function RoomLinkBox() {
  const { roomLink } = useContext(SocketContext);

  return (
    <div className="room-link-box-wrapper shadow-box">
      <h5 id="roomLinkTitle">Invite friends to this room</h5>
      <div className="room-link-box">
        <input
          type="text"
          id="roomLink"
          className="shadow-box"
          value={roomLink}
          readOnly
        />
        <div className="copy-icon-wrapper button shadow-box">
          <FiClipboard
            onClick={() => navigator.clipboard.writeText(roomLink)}
            className="copy-icon"
            title="Copy room link"
          />
        </div>
      </div>
    </div>
  );
}

export default function ControlBox() {
  const { playerUndoEmit, setNewGameEmit, setDifficultyEmit, gameStatus } =
    useContext(SocketContext);
  const { playerUndo, checkTurn, setNewGame } = useContext(ChessContext);

  //Message Box
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("normal");
  const [visibleMessageBox, setVisibleMessageBox] = useState(false);

  function difficultySelect(evt) {
    setDifficultyEmit(parseInt(evt.target.value), (succeed) => {
      if (!succeed) alert("Please try setting difficulty again");
    });
  }
  function onClickUndoButton(evt) {
    if (checkTurn() !== "w") {
      setVisibleMessageBox(true);
      setMessageType("warning");
      setMessage("Please wait until the computer finishes its turn.");
      setTimeout(() => {
        setMessage("");
        setVisibleMessageBox(false);
      }, 1600);
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

  useEffect(() => {
    console.log(gameStatus);
    switch (gameStatus) {
      case "whiteWin":
        setMessage("White wins! Please start a new game.");
        setMessageType("normal");
        setVisibleMessageBox(true);
        break;
      case "blackWin":
        setMessage("Black wins! Please start a new game.");
        setMessageType("normal");
        setVisibleMessageBox(true);
        break;
      case "draw":
        setMessage("Draw! Please start a new game.");
        setMessageType("normal");
        setVisibleMessageBox(true);
        break;
      default:
        setMessage("");
        setMessageType("normal");
        setVisibleMessageBox(false);
        break;
    }
  }, [gameStatus])
  return (
    <div className="control-box-container">
      <div className="control-box shadow-box">
        <div className="difficulty-select container-fluid">
          <div className="row">
            <div className="col-5" id="heading">
              Difficulty
            </div>
            <div className="col-7">
              <select
                className="form-select"
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
        <div className="history-box shadow-box">
          <HistoryBox />
        </div>
        <div className="button-box">
          <BiUndo
            type="button"
            size="3.5vh"
            border="circle"
            className="button circle-frame"
            onClick={onClickUndoButton}
            title="Undo"
          >
            Undo
          </BiUndo>
          <BiRefresh
            type="button"
            size="3.5vh"
            border="circle"
            className="button circle-frame"
            onClick={onClickNewGameButton}
            title="New Game"
          />
        </div>
      </div>
      <RoomLinkBox />
      {visibleMessageBox ? messageType === "normal" ? (
        <div className="message-box shadow-box white-background">{message}</div>
      ) : (
        <div className="message-box shadow-box red-background">{message}</div>
      ) : (
        <div className="message-box hidden">{message}</div>
      )}
    </div>
  );
}
