import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import * as icons from "react-icons/gi";
import { Tile } from "./Tile";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import backIcon from "../images/turn-up-solid.svg";
import winnerIcon from "../images/face-laugh-squint-regular.svg";
import loserIcon from "../images/face-sad-tear-regular.svg";
import user from "../images/user-solid.svg";
import group from "../images/user-group-solid.svg";
import gamePad from "../images/gamepad-solid.svg";
import info from "../images/circle-info-solid.svg";
import close from "../images/circle-xmark-regular.svg";

export const possibleTileContents = [
  icons.GiHearts,
  icons.GiWaterDrop,
  icons.GiDiceSixFacesFive,
  icons.GiUmbrella,
  icons.GiCube,
  icons.GiBeachBall,
  icons.GiDragonfly,
  icons.GiHummingbird,
  icons.GiFlowerEmblem,
  icons.GiOpenBook,
];

export function StartScreen({ start }) {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-pink-50">
      <div className="flex flex-col justify-start gap-8 items-center pt-12 bg-white rounded-lg h-72 w-80">
        <h1 className="text-2xl text-center text-pink-500 font-bold">Memory</h1>
        <p className="text-pink-600 text-center">
          Flip over tiles looking for pairs
        </p>
        <button
          onClick={start}
          className="w-28 p-1 rounded-2xl bg-gradient-to-b from-pink-400 to-pink-600 text-white shadow shadow-slate-600 hover:cursor-pointer"
        >
          Play
        </button>
      </div>
    </div>
  );
}

export function SelectScreen({
  select,
  singlePlayer,
  multiPlayer,
  difficulty,
  setDifficulty,
}) {
  const [players, setPlayers] = useState(null);
  const [showInfo, setShowInfo] = useState(0);
  const tl = useRef(null)

  // slide in animation for buttons
  useGSAP(() => {
    tl.current = gsap.timeline()
    gsap.set(".button", {y: 0, opacity: 1})

    tl.current.from(".button", {y: 50, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(0.5)"})
  }, [])

  const single = () => {
    setPlayers(1);
    singlePlayer();
  };
  const double = () => {
    setPlayers(2);
    multiPlayer();
  };
  const easy = () => {
    setDifficulty("easy");
  };
  const hard = () => {
    setDifficulty("hard");
  };

  if (players && difficulty) {
    select();
  }

  return (
    <div className="w-fullh-screen bg-green-50 px-8 py-12">
      <h1 className="font-semibold text-2xl text-blue-700 text-center mb-8 flex items-center justify-center gap-2">
        Select Your Gameplay
        <img src={gamePad} className="w-8 h-8 relative" />
      </h1>
      <div className="bg-white rounded-lg p-8 flex flex-col justify-between gap-4 shadow-md  max-w-[24rem] m-auto">
        <div className="flex flex-col items-center gap-y-2 px-4 py-4 rounded-lg bg-slate-100 shadow">
          <h2 className="font-semibold text-xl text-center text-blue-600 mb-2">
            Players
          </h2>
          <button
            onClick={single}
            className={
              players === 1
                ? "button shadow-md bg-slate-300"
                : "button shadow-md bg-white"
            }
          >
            Single Player
            <img src={user} className="w-5 h-5" />
          </button>
          <button
            onClick={double}
            className={
              players === 2
                ? "button shadow-md bg-slate-300"
                : "button shadow-md bg-white"
            }
          >
            Two Players
            <img src={group} className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-y-2 px-4 py-4 rounded-lg bg-slate-100 shadow">
          <h2 className="font-semibold text-xl text-center text-blue-600 mb-2">
            Difficulty
          </h2>
          <button
            onClick={easy}
            className={
              difficulty === "easy"
                ? "button shadow-md bg-slate-300 relative"
                : "button shadow-md bg-white relative"
            }
          >
            Easy
            {showInfo === 1 ? (
              <Info
                text={
                  "This mode is relatively easy with only 16 tiles and you get 15 tries."
                }
                setShowInfo={setShowInfo}
              />
            ) : null}
            <img
              src={info}
              className="w-5 h-5 absolute right-3 opacity-60"
              onClick={(event) => {
                event.stopPropagation();
                setShowInfo(1);
              }}
            />
          </button>
          <button
            onClick={hard}
            className={
              difficulty === "hard"
                ? "button shadow-md bg-slate-300 relative"
                : "button shadow-md bg-white relative"
            }
          >
            Hard
            {showInfo === 2 ? (
              <Info
                text={
                  "This is a real challenge. 4 extra tiles means you only get 14 tries to match 20 tiles!"
                }
                setShowInfo={setShowInfo}
              />
            ) : null}
            <img
              src={info}
              className="w-5 h-5 absolute right-3 opacity-60"
              onClick={(event) => {
                event.stopPropagation();
                setShowInfo(2);
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PlayScreen({
  stats,
  gameMode,
  index,
  setWinner,
  redStart,
  setRedStart,
  difficulty,
  end,
}) {
  const [tiles, setTiles] = useState(null);
  const [tryCount, setTryCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  let bestStreak = localStorage.getItem("bestStreak") || 0;

  const getTiles = (tileCount) => {
    // Throw error if count is not even.
    if (tileCount % 2 !== 0) {
      throw new Error("The number of tiles must be even.");
    }

    // Use the existing list if it exists.
    if (tiles) return tiles;

    const pairCount = tileCount / 2;

    // Take only the items we need from the list of possibilities.
    const usedTileContents = possibleTileContents.slice(0, pairCount);

    // Double the array and shuffle it.
    const shuffledContents = usedTileContents
      .concat(usedTileContents)
      .sort(() => Math.random() - 0.5)
      .map((content) => ({ content, state: "start" }));

    setTiles(shuffledContents);
    return shuffledContents;
  };

  // flip all tiles for each player at the start of their turn
  useEffect(
    () => {
      setTimeout(
        () => {
          setTiles((prevTiles) => {
            return prevTiles.map((tile) => ({
              ...tile,
              state: "flipped",
            }));
          });
          setTimeout(() => {
            setTiles((prevTiles) => {
              return prevTiles.map((tile) => ({
                ...tile,
                state: "start",
              }));
            });
          }, 600);
        },
        redStart == false ? 300 : 1400
      );
    },
    index === 1 ? [redStart] : []
  );

  const flip = (i) => {
    // Is the tile already flipped? We don’t allow flipping it back.
    if (tiles[i].state === "flipped") return;

    // How many tiles are currently flipped?
    const flippedTiles = tiles.filter((tile) => tile.state === "flipped");
    const flippedCount = flippedTiles.length;

    // Don't allow more than 2 tiles to be flipped at once.
    if (flippedCount === 2) return;

    // On the second flip, check if the tiles match.
    if (flippedCount === 1) {
      setTryCount((c) => c + 1);

      const alreadyFlippedTile = flippedTiles[0];
      const justFlippedTile = tiles[i];

      let newState = "start";

      if (alreadyFlippedTile.content === justFlippedTile.content) {
        confetti({
          ticks: 100,
        });
        newState = "matched";
        setStreak((a) => a + 1);
      } else {
        setStreak(0);
      }

      // Update best streak if current streak surpasses it
      if (streak >= bestStreak) {
        bestStreak = streak;
        localStorage.setItem("bestStreak", streak);
      }

      // After a delay, either flip the tiles back or mark them as matched.
      setTimeout(() => {
        setTiles((prevTiles) => {
          const newTiles = prevTiles.map((tile) => ({
            ...tile,
            state: tile.state === "flipped" ? newState : tile.state,
          }));

          //determines the start of red player's turn for multiplayer mode
          if (gameMode === "multiPlayer") {
            setRedStart(true);
          }

          //switch between players for multiplayer mode
          if (gameMode === "multiPlayer") {
            if (index === 0) {
              document.querySelector(".playContainer").classList.add("switch");
            } else {
              document
                .querySelector(".playContainer")
                .classList.remove("switch");
            }
          }

          // If all tiles are matched, the game is over.
          if (newTiles.every((tile) => tile.state === "matched")) {
            if (gameMode === "multiPlayer") {
              setWinner(index);
            }
            setTimeout(stats, 500);
          }

          // If the counter reaches the limit for the difficulty level, the game is lost. Only for singleplayer mode
          if (gameMode === "singlePlayer") {
            if (difficulty === "easy") {
              // because of the previous code, 1 means loss and 0 means win
              if (tryCount === 14) {
                setWinner(1);
                stats();
              }
            } else {
              if (tryCount === 13) {
                setWinner(1);
                stats();
              }
            }
          }

          return newTiles;
        });
      }, 690);
    }

    setTiles((prevTiles) => {
      return prevTiles.map((tile, index) => ({
        ...tile,
        state: i === index ? "flipped" : tile.state,
      }));
    });
  };

  return (
    // red theme for player two and blue theme for player one
    <div
      className={
        index === 1 ? "bg-pink-50 player-screen" : "bg-green-50 player-screen"
      }
    >
      <div
        className={
          index === 1
            ? "bg-[#fca6b150] grid-cols-4 tile-board shadow-md shadow-slate-400"
            : "bg-[#95b1ff30] grid-cols-4 tile-board shadow-md shadow-slate-400"
        }
      >
        {/* more tiles are displayed for hard mode */}
        {getTiles(difficulty === "easy" ? 16 : 20).map((tile, i) => (
          <Tile key={i} index={index} flip={() => flip(i)} {...tile} />
        ))}
      </div>
      <div className="flex justify-around items-center w-24">
        {/* show player id if it is multiplayer mode */}
        <p
          className={
            index === 1
              ? "font-semibold text-xl text-red-700"
              : "font-semibold text-xl text-blue-700"
          }
        >
          {gameMode === "singlePlayer" ? null : `Player ${index + 1}`}
        </p>
      </div>
      {gameMode === "singlePlayer" ? (
        <div className="fixed right-0 top-[3rem] py-2 px-4 bg-slate-100 border-2 border-r-0 border-slate-700 rounded-tl-full rounded-bl-full shadow-md shadow-slate-400">
          <p className="text-sm font-semibold text-slate-700">
            {difficulty === "easy" ? 15 - tryCount : 14 - tryCount} tries left
          </p>
        </div>
      ) : null}
      {/* Show streak and best streak when user consecutively matches tiles */}
      {gameMode === "singlePlayer" ? (
        <div className="fixed left-0 top-0 pt-4 pb-2 pl-4 pr-6 bg-slate-100 border-2 border-l-0 border-t-0 border-slate-700 rounded-br-xl shadow-md shadow-slate-400">
          <p className="text-md font-semibold text-slate-700 text-center">
            Streak
          </p>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Current: {streak}
            </p>
            <p className="text-sm font-semibold text-slate-700">
              Best: {bestStreak}
            </p>
          </div>
          <img
            src={info}
            className="w-5 h-5 absolute right-2 top-4 opacity-30 hover:cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              setShowInfo(true);
            }}
          />
          {showInfo ? (
            <Info
              setShowInfo={() => {
                setShowInfo(false);
              }}
              text={
                "Increase your streak as you consecutively match tiles! Beat your previous set record!"
              }
            />
          ) : null}
        </div>
      ) : null}
      <div
        onClick={end}
        className="fixed right-0 bottom-[3rem] py-2 px-4 bg-slate-100 border-2 border-r-0 border-slate-700 rounded-tl-full rounded-bl-full flex items-center gap-2 hover:cursor-pointer shadow-md shadow-slate-400"
      >
        <img src={backIcon} className="w-4 h-4 rotate-[270deg] opacity-70" />
        <p className="text-sm font-semibold text-slate-700">Return</p>
      </div>
    </div>
  );
}

export function StatsScreen({ winner, end, gameMode }) {
  // show the winner and the loser of the game
  const tlRef = useRef(null);
  useGSAP(() => {
    // animation for the stats
    tlRef.current = gsap.timeline();
    gsap.set(".stat", { x: 0 });

    tlRef.current
      .from(".stat-blue", { x: 500, duration: 0.3, ease: "back.out(1)" })
      .from(".stat-red", { x: -500, duration: 0.3, ease: "back.out(2)" });
  }, []);

  // stat screen for multiplayer and single player mode
  if (gameMode === "multiPlayer") {
    return (
      <div className="w-full h-screen flex flex-col items-center">
        <div className="h-screen divide-y-4 divide-slate-400">
          <div className="w-screen h-1/2 bg-blue-50 flex items-center justify-center stat stat-blue">
            <h1 className="text-3xl font-bold text-center text-blue-700 text-shadow">
              {winner === 0 ? "You Win" : "You Lose"}
            </h1>
            <img
              src={winner === 0 ? winnerIcon : loserIcon}
              className="w-24 h-24"
            />
          </div>
          <div className="w-screen h-1/2 bg-red-50 flex items-center justify-center stat stat-red">
            <h1 className="text-3xl font-bold text-center text-red-700 text-shadow">
              {winner === 1 ? "You Win" : "You Lose"}
            </h1>
            <img
              src={winner === 1 ? winnerIcon : loserIcon}
              className="w-24 h-24"
            />
          </div>
        </div>
        <button
          className="py-2 px-4  bg-white hover:bg-slate-200 transition duration-100 ease-in-out  text-slate-700 font-semibold text-lg rounded-xl shadow w-40 border-slate-700 border-2 absolute top-[46%]"
          onClick={end}
        >
          Return to Start
        </button>
      </div>
    );
  } else {
    return (
      <div className="w-screen h-screen bg-blue-50 flex flex-col items-center justify-center gap-8 stat stat-blue">
        <h1 className="text-3xl font-bold text-center text-blue-700 text-shadow">
          {winner === 0 ? "You Win" : "You Lose"}
        </h1>

        <img
          src={winner === 0 ? winnerIcon : loserIcon}
          className="w-24 h-24"
        />
        <button
          className="py-2 px-4  bg-white hover:bg-slate-200 transition duration-100 ease-in-out  text-slate-700 font-semibold text-lg rounded-xl shadow w-40 border-slate-700 border-2"
          onClick={end}
        >
          Return to Start
        </button>
      </div>
    );
  }
}

function Info({ text, setShowInfo }) {
  return (
    <div className="absolute right-[-1rem] top-[2rem] opacity-80 bg-slate-100 border-2 border-slate-300 rounded-xl p-2 z-10">
      <img
        src={close}
        className="w-4 h-4 float-right hover:cursor-pointer"
        onClick={(event) => {
          event.stopPropagation();
          setShowInfo(0);
        }}
      />

      <p className="text-xs text-slate-700">{text}</p>
    </div>
  );
}
