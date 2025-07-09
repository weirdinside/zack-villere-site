import { Howl } from "howler";
import { useContext, useEffect, useRef, useState } from "react";
import { IoBatteryHalf } from "react-icons/io5";
import {
  MdFastForward,
  MdFastRewind,
  MdPause,
  MdPlayArrow,
} from "react-icons/md";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import styles from "./App.module.css";
import Home from "./components/Home/Home";
import Knob from "./components/Knob/Knob";
import Music from "./components/Music/Music";
import Player from "./components/Music/Player/Player";
import { SNOEY_MUSIC } from "./constants/songs";
import { MusicPlayerContext } from "./contexts/MusicPlayerContext";
import Store from "./components/Store/Store";

function App() {
  const [scrollPos, setScrollPos] = useState<number>(0);

  const [option, setOption] = useState<"navigate" | "play">("navigate");
  const [location, setLocation] = useState<string>("");
  const [hoveredSong, setHoveredSong] = useState<SongInfo>();

  const [tickVolume, setTickVolume] = useState<number>(1);

  const [pageTitle, setPageTitle] = useState<string>("zackvillere.com");

  const locationHook = useLocation();

  const tickSoundRef = useRef<Howl>(null);

  const pressDownSoundRef = useRef<Howl>(null);
  const pressUpSoundRef = useRef<Howl>(null);

  const seekIntervalRef = useRef<number>(null);
  const seekHoldTimeoutRef = useRef<number>(null);
  const isSeekingRef = useRef<boolean>(false);

  const navigate = useNavigate();

  const {
    play,
    pause,
    playerState,
    selectSong,
    songInfo,
    setPlaylist,
    fwd,
    rwd,
    ffwd,
    rrwd,
  } = useContext(MusicPlayerContext);

  function togglePlayback() {
    if (playerState === "paused") return play();
    if (playerState === "playing") return pause();
  }

  function handleCenterClick({
    option,
    location,
  }: {
    option: "navigate" | "play";
    location: string;
  }) {
    if (option === "navigate") {
      if (location.includes("https://") && typeof window !== "undefined") {
        const newWindow = window.open(location, "_blank");
        if (newWindow) return newWindow.focus();
      } else {
        return navigate(location);
      }
    }

    if (option === "play" && hoveredSong) {
      selectSong(hoveredSong);
      navigate("music/player");
      if (songInfo.title === hoveredSong.title) play();
    }
  }

  function handleSeekPress(button: "fwd" | "rwd") {
    seekHoldTimeoutRef.current = setTimeout(() => {
      isSeekingRef.current = true;
      seekIntervalRef.current = setInterval(() => {
        button === "fwd" ? ffwd() : rrwd();
      }, 200);
    }, 500);
  }

  function handleSeekButtonLift(button: "fwd" | "rwd") {
    if (isSeekingRef.current) {
      isSeekingRef.current = false;
    } else {
      button === "fwd" ? fwd() : rwd();
    }

    if (seekIntervalRef.current) {
      clearInterval(seekIntervalRef.current);
    }

    if (seekHoldTimeoutRef.current) {
      clearTimeout(seekHoldTimeoutRef.current);
    }
  }
  useEffect(() => {
    Howler.autoUnlock = true;

    tickSoundRef.current = new Howl({
      src: ["click.m4a", "click.ogg", "click.mp3"],
      volume: tickVolume,
      format: ["ogg", "m4a", "mp3"],
    });

    pressDownSoundRef.current = new Howl({
      src: ["pressdown.m4a"],
      volume: 1,
    });

    pressUpSoundRef.current = new Howl({
      src: ["pressup.m4a"],
      volume: 1,
    });

    setPlaylist(SNOEY_MUSIC);
  }, []);

  useEffect(() => {
    if (tickSoundRef.current) {
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        Howler.ctx.resume();
      }
      tickSoundRef.current.play();
    }
  }, [scrollPos]);

  return (
    <div
      onPointerUp={() => {
        Howler.ctx.resume;
      }}
      className={styles.page}
    >
      <div className={styles.player}>
        <div className={styles.player_screen}>
          <header className={styles.header}>
            {playerState === "paused" && (
              <MdPause className={styles.header_icon} />
            )}
            {playerState === "playing" && (
              <MdPlayArrow className={styles.header_icon} />
            )}
            <div className={styles.header_icon} />
            <div className={styles.header_text}>{pageTitle}</div>
            <IoBatteryHalf className={styles.header_battery} />
          </header>
          <div className={styles.outlet}>
            <Routes>
              <Route
                path="*"
                element={
                  <Home
                    setOption={setOption}
                    setLocation={setLocation}
                    scrollPos={scrollPos}
                  />
                }
              />
              <Route
                path="music"
                element={
                  <Music
                    setHoveredSong={setHoveredSong}
                    scrollPos={scrollPos}
                    setOption={setOption}
                  />
                }
              />
              <Route
                path="music/player"
                element={<Player scrollPos={scrollPos} />}
              />
              <Route path="store" element={<Store />} />
            </Routes>
          </div>
        </div>
        <div className={styles.player_scrollwheel}>
          <div
            onClick={() => {
              handleCenterClick({ option, location });
            }}
            onPointerDown={() => {
              pressDownSoundRef.current?.play();
            }}
            onPointerUp={() => {
              pressUpSoundRef.current?.play();
            }}
            onPointerCancel={() => {
              pressUpSoundRef.current?.play();
            }}
            className={styles.center_button}
          />
          <div
            // onPointerDown={() => {
            //   pressDownSoundRef.current?.play();
            // }}
            // onPointerUp={() => {
            //   pressUpSoundRef.current?.play();
            // }}
            // onPointerCancel={() => {
            //   pressUpSoundRef.current?.play();
            // }}
            className={styles.scrollwheel}
          >
            <Knob
              infinite={true}
              value={scrollPos}
              setValue={setScrollPos}
              startValue={0}
              endValue={12}
              snap={true}
              step={1}
            />
          </div>
          <div
            onClick={() => {
              const isHome = locationHook.pathname.split("/").at(-1) === "";
              if (!isHome) {
                const previousPath = locationHook.pathname
                  .split("/")
                  .slice(0, -1)
                  .join("/");
                return navigate(previousPath);
              }
            }}
            onPointerDown={() => {
              pressDownSoundRef.current?.play();
            }}
            onPointerUp={() => {
              pressUpSoundRef.current?.play();
            }}
            className={styles.menu}
          >
            menu
          </div>
          <div className={styles.menu_outline} />
          <div
            onPointerDown={() => {
              handleSeekPress("fwd");
              pressDownSoundRef.current?.play();
            }}
            onPointerUp={() => {
              handleSeekButtonLift("fwd");
              pressUpSoundRef.current?.play();
            }}
            onPointerCancel={() => {
              handleSeekButtonLift("fwd");
              pressUpSoundRef.current?.play();
            }}
            className={styles.fwd}
          >
            <MdFastForward className={styles.fwd_icon} />
          </div>
          <div className={styles.fwd_outline} />
          <div
            onPointerDown={() => {
              handleSeekPress("rwd");
              pressDownSoundRef.current?.play();
            }}
            onPointerUp={() => {
              handleSeekButtonLift("rwd");
              pressUpSoundRef.current?.play();
            }}
            onPointerCancel={() => {
              handleSeekButtonLift("rwd");
              pressUpSoundRef.current?.play();
            }}
            className={styles.rwd}
          >
            <MdFastRewind className={styles.rwd_icon} />
          </div>
          <div className={styles.rwd_outline} />
          <div
            onPointerDown={() => {
              pressDownSoundRef.current?.play();
            }}
            onPointerUp={() => {
              pressUpSoundRef.current?.play();
            }}
            onPointerCancel={() => {
              pressUpSoundRef.current?.play();
            }}
            onClick={togglePlayback}
            className={styles.pp}
          >
            <div className={styles.pp_icons}>
              <MdPlayArrow className={styles.pp_icon} />
              <MdPause className={styles.pp_icon} />
            </div>
          </div>
          <div className={styles.pp_outline} />
        </div>
      </div>
    </div>
  );
}

export default App;
