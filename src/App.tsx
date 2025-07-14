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
import Videos from "./components/Videos/Videos";
import Contact from "./components/Contact/Contact";
import VideoPlayer from "./components/Videos/VideoPlayer/VideoPlayer";
import { VideoPlayerContext } from "./contexts/VideoPlayerContext";
import Shows from "./components/Shows/Shows";

function App() {
  const [scrollPos, setScrollPos] = useState<number>(0);

  const [option, setOption] = useState<"navigate" | "playSong" | "playVideo">(
    "navigate"
  );
  const [location, setLocation] = useState<string>("");
  const [hoveredSong, setHoveredSong] = useState<SongInfo>();
  const [hoveredVideo, setHoveredVideo] = useState<VideoInfo>();

  const [pageTitle, setPageTitle] = useState<string>("zackvillere.com");

  const locationHook = useLocation();

  const tickSoundRef = useRef<Howl>(null);

  const pressDownSoundRef = useRef<Howl>(null);
  const pressUpSoundRef = useRef<Howl>(null);

  const seekIntervalRef = useRef<number>(null);
  const seekHoldTimeoutRef = useRef<number>(null);
  const isSeekingRef = useRef<boolean>(false);

  const navigate = useNavigate();

  const { playVideo, pauseVideo, stopVideo, seekVideo, videoPlayerState } =
    useContext(VideoPlayerContext);

  const {
    play,
    pause,
    stop,
    playerState,
    selectSong,
    songInfo,
    setPlaylist,
    fwd,
    rwd,
    ffwd,
    rrwd,
    playerVolume,
  } = useContext(MusicPlayerContext);

  function togglePlayback() {
    if (playerState === "paused") return play();
    if (playerState === "playing") return pause();
  }

  function handleCenterClick({
    option,
    location,
  }: {
    option: "navigate" | "playSong" | "playVideo";
    location: string;
  }) {
    if (option === "navigate") {
      if (location.includes("https://") && typeof window !== "undefined") {
        const newWindow = window.open(location, "_blank");
        if (newWindow) return newWindow.focus();
      } else if (location.startsWith("mailto:")) {
        const newWindow = window.open(location, "_blank");
        if (newWindow) return newWindow.focus();
      } else if (locationHook.pathname === "/videos/player") {
      } else if (locationHook.pathname === "/music/player") {
        pause();
      } else {
        return navigate(location);
      }
    }

    if (option === "playSong" && hoveredSong) {
      selectSong(hoveredSong);
      navigate("music/player");
      if (songInfo.title === hoveredSong.title) play();
    }

    if (option === "playVideo" && hoveredVideo) {
      stop();
      navigate("videos/player");
    }
  }

  function toggleVideoPlayback() {
    console.log(videoPlayerState);
    if (videoPlayerState === "paused") playVideo();
    if (videoPlayerState === "playing") pauseVideo();
  }

  function handlePPButton() {
    if (locationHook.pathname === "/videos/player") {
      toggleVideoPlayback();
    } else {
      togglePlayback();
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

  useEffect(()=>{
    if(tickSoundRef.current){
      tickSoundRef.current.volume(playerVolume)
    }
  }, [tickSoundRef, playerVolume])

  useEffect(() => {
    Howler.autoUnlock = true;

    tickSoundRef.current = new Howl({
      src: ["click.m4a", "click.ogg", "click.mp3"],
      volume: playerVolume,
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
                path="videos"
                element={
                  <Videos
                    setHoveredVideo={setHoveredVideo}
                    scrollPos={scrollPos}
                    setOption={setOption}
                  />
                }
              />
              <Route path="shows" element={<Shows />} />
              <Route
                path="contact"
                element={
                  <Contact
                    setLocation={setLocation}
                    scrollPos={scrollPos}
                    setOption={setOption}
                  />
                }
              />
              <Route
                path="music/player"
                element={<Player scrollPos={scrollPos} />}
              />
              <Route
                path="videos/player"
                element={
                  <VideoPlayer video={hoveredVideo} scrollPos={scrollPos} />
                }
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
            onClick={() => {
              handlePPButton();
            }}
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
