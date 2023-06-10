import "./App.css";
import { SocketContextProvider } from "./ContextProvider/SocketContextProvider";
import ControlBox from "./components/ControlBox";
import { ChessContextProvider } from "./ContextProvider/ChessContextProvider";
import GameContainer from "./components/GameContainer";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MDBFooter } from "mdb-react-ui-kit";
import { VscGithub } from "react-icons/vsc";

function App() {
  return (
    <div className="app-wrapper">
      <BrowserRouter>
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
      </BrowserRouter>
      <MDBFooter bgColor="white" className="text-center text-lg-left p-t-50">
        <div
          className="text-center p-3"
          style={{ backgroundColor: "rgba(100, 100, 100, 0.05)" }}
        >
          &copy; {new Date().getFullYear()} Copyright:{" "}
          <h6>Steve Do, Duong Vo</h6>
          <h7>Find our code on Github! </h7>
          <a
            href="https://github.com/dominhnhut01/chessgame_webapp"
            target="_blank"
            rel="noreferrer"
          >
            <VscGithub size={30} style={{ margin: "4px" }} />
          </a>
        </div>
      </MDBFooter>
    </div>
  );
}

export default App;
