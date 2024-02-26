import { useState } from "react";
import { StartScreen, PlayScreen, SelectScreen, StatsScreen } from "./Screens";

function App() {
  const [gameState, setGameState] = useState("start");
  const [gameMode, setGameMode] = useState("singlePlayer");
  const [difficulty, setDifficulty] = useState(null)
  const playerList = ["blue", "red"];
  const [redStart, setRedStart] = useState(false)
  const [winner, setWinner] = useState(0)

  switch (gameState) {
    case "start":
      return <StartScreen start={() => setTimeout(setGameState("select"), 800)}></StartScreen>;
    case "select":
      return (
        <SelectScreen
          select={() => setGameState("play")}
          singlePlayer ={() => setGameMode("singlePlayer")}
          multiPlayer={() => setGameMode("multiPlayer")}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        ></SelectScreen>
      );
    case "play":
      if (gameMode === "singlePlayer") {
        return (
          <PlayScreen
            stats={() => setGameState("stats")}
            gameMode={gameMode}
            difficulty={difficulty}
            setWinner={setWinner}
            end={() => {setGameState("start"); setDifficulty(null)}}
          ></PlayScreen>
        );
      } else {
        return (
          <div className="flex w-fit h-screen playContainer">
            {playerList.map((item, i) => (
              <PlayScreen
                key={i}
                index={i}
                stats={() => setGameState("stats")}
                end={() => {setGameState("start"); setDifficulty(null)}}
                gameMode={gameMode}
                setWinner={setWinner}
                redStart={redStart}
                setRedStart={setRedStart}
                difficulty={difficulty}
              ></PlayScreen>
            ))}
          </div>
        );
      }
    case "stats":
      return <StatsScreen winner={winner} end={() => {setGameState("start"); setDifficulty(null)}} gameMode={gameMode} />
    default:
      throw new Error("Invalid game state " + gameState);
  }
}

export default App;
