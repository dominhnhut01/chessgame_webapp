import "./App.css";
import { SocketContextProvider } from "./ContextProvider/SocketContextProvider";
import ControlBox from "./components/ControlBox";
import { ChessContextProvider } from "./ContextProvider/ChessContextProvider";
import GameContainer from "./components/GameContainer";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      {["/", "/:roomID"].map((path, idx) => {
        return (
          <Route
            path={path}
            element={
              <SocketContextProvider>
                <ChessContextProvider>
                  <div className="app container-fluid">
                    <div className="row">
                      <div className="col-lg-8 col-md-10 col-sm-12">
                        <GameContainer />
                      </div>
                      <div className="col-lg-4 col-md-2 col-sm-12">
                        <ControlBox />
                      </div>
                    </div>
                  </div>
                </ChessContextProvider>
              </SocketContextProvider>
            }
            key={idx}
          />
        );
      })}
    </Routes>
  );
}

export default App;
