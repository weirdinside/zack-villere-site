// -------------------------- //
//           IMPORTS          //
// -------------------------- //

import { Howl } from "howler";
import { useContext, useEffect, useRef, useState } from "react";
import {
  MdFastForward,
  MdFastRewind,
  MdPause,
  MdPlayArrow,
} from "react-icons/md";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import styles from "./App.module.css";
import Contact from "./components/Contact/Contact";
import Gallery from "./components/Gallery/Gallery";
import Home from "./components/Home/Home";
import Knob from "./components/Knob/Knob";
import Music from "./components/Music/Music";
import Player from "./components/Music/Player/Player";
import Shows from "./components/Shows/Shows";
import Store from "./components/Store/Store";
import VideoPlayer from "./components/Videos/VideoPlayer/VideoPlayer";
import Videos from "./components/Videos/Videos";
import { SNOEY_MUSIC } from "./constants/songs";
import { MusicPlayerContext } from "./contexts/MusicPlayerContext";
import { VideoPlayerContext } from "./contexts/VideoPlayerContext";

import ppclick from "/images/ppclick.png";
import centerclick from "/images/centerclick.png";
import menuclick from "/images/menuclick.png";
import fwdclick from "/images/fwdclick.png";
import rwdclick from "/images/rwdclick.png";

import bottom1 from "/images/yetihand/1bottom.webp";
import bottom2 from "/images/yetihand/2bottom.webp";
import bottom3 from "/images/yetihand/3bottom.webp";
import bottom4 from "/images/yetihand/4bottom.webp";
import bottom5 from "/images/yetihand/5bottom.webp";
import bottom6 from "/images/yetihand/6bottom.webp";
import bottom7 from "/images/yetihand/7bottom.webp";
import bottom8 from "/images/yetihand/8bottom.webp";
import bottom9 from "/images/yetihand/9bottom.webp";
import clickbottom from "/images/yetihand/clickbottom.webp";
import defaultbottom from "/images/yetihand/offbottom.webp";

import top1 from "/images/yetihand/1top.webp";
import top2 from "/images/yetihand/2top.webp";
import top3 from "/images/yetihand/3top.webp";
import top4 from "/images/yetihand/4top.webp";
import top5 from "/images/yetihand/5top.webp";
import top6 from "/images/yetihand/6top.webp";
import top7 from "/images/yetihand/7top.webp";
import top8 from "/images/yetihand/8top.webp";
import top9 from "/images/yetihand/9top.webp";
import clicktop from "/images/yetihand/clicktop.webp";
import defaulttop from "/images/yetihand/offtop.webp";

import fingerprints from "./assets/fingers.png";
import scratches from "./assets/scratches.jpg";

// -------------------------- //
//       COMPONENT ENTRY      //
// -------------------------- //

export default function App() {
  // -------------------------- //
  //           STATES           //
  // -------------------------- //

  const [scrollPos, setScrollPos] = useState<number>(0);
  const [option, setOption] = useState<
    "navigate" | "playSong" | "playVideo" | "toggleImageState"
  >("navigate");
  const [location, setLocation] = useState<string>("");
  const [hoveredSong, setHoveredSong] = useState<SongInfo>();
  const [hoveredVideo, setHoveredVideo] = useState<VideoInfo>();
  const [imageState, setImageState] = useState<"image" | "caption">("image");
  const [pageTitle, setPageTitle] = useState<string>("zackvillere.com");
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [backgroundImage, setBackgroundImage] = useState<string>();

  const [yetiHandTopImage, setYetiHandTopImage] = useState<string>(defaulttop);
  const [yetiHandBottomImage, setYetiHandBottomImage] =
    useState<string>(defaultbottom);

  const yetiHandsTop = [top9, top8, top7, top6, top5, top4, top3, top2, top1];
  const yetiHandsBottom = [
    bottom9,
    bottom8,
    bottom7,
    bottom6,
    bottom5,
    bottom4,
    bottom3,
    bottom2,
    bottom1,
  ];

  const locationHook = useLocation();
  const navigate = useNavigate();

  // -------------------------- //
  //            REFS            //
  // -------------------------- //
  const tickSoundRef = useRef<Howl>(null);
  const pressDownSoundRef = useRef<Howl>(null);
  const pressUpSoundRef = useRef<Howl>(null);
  const seekIntervalRef = useRef<NodeJS.Timeout>(null);
  const seekHoldTimeoutRef = useRef<NodeJS.Timeout>(null);
  const isSeekingRef = useRef<boolean>(false);

  // -------------------------- //
  //          CONTEXTS          //
  // -------------------------- //

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

  // -------------------------- //
  //          FUNCTIONS         //
  // -------------------------- //

  function togglePlayback() {
    if (playerState === "paused") return play();
    if (playerState === "playing") return pause();
  }

  function setYetiHands(isScrolling: boolean) {
    const pos = scrollPos % 9;

    if (isScrolling) {
      setYetiHandBottomImage(yetiHandsBottom[pos]);
      return setYetiHandTopImage(yetiHandsTop[pos]);
    }

    setYetiHandBottomImage(defaultbottom);
    setYetiHandTopImage(defaulttop);
  }

  function handleCenterClick({
    option,
    location,
  }: {
    option: "navigate" | "playSong" | "playVideo" | "toggleImageState";
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

    if (option === "toggleImageState") {
      toggleImageState();
    }
  }

  function toggleVideoPlayback() {
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

  function toggleImageState() {
    if (imageState === "caption") setImageState("image");
    else setImageState("caption");
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

  // -------------------------- //
  //            HOOKS           //
  // -------------------------- //

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        const images = [
          ...yetiHandsTop,
          ...yetiHandsBottom,
          defaulttop,
          defaultbottom,
        ];
        images.forEach((src) => {
          const img = new Image();
          img.src = src;
        });
      });
    }
  }, []);

  useEffect(() => {
    if (tickSoundRef.current) {
      tickSoundRef.current.volume(playerVolume);
    }
    if (pressDownSoundRef.current)
      pressDownSoundRef.current.volume(playerVolume);
    if (pressUpSoundRef.current) pressUpSoundRef.current.volume(playerVolume);
  }, [tickSoundRef, playerVolume]);

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

    setYetiHands(isScrolling);
  }, [scrollPos]);

  // -------------------------- //
  //      COMPONENT RETURN      //
  // -------------------------- //

  return (
    <div
      onPointerUp={() => {
        Howler.ctx.resume;
      }}
      className={styles.page}
    >
      <div className={styles.page_container}>
        {yetiHandsTop.map((image) => {
          return (
            <div
              className={`${styles.yetihand_top} ${
                image === yetiHandTopImage ? styles.visible : styles.hidden
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          );
        })}
        {yetiHandsBottom.map((image) => {
          return (
            <div
              className={`${styles.yetihand_bottom} ${
                image === yetiHandBottomImage ? styles.visible : styles.hidden
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          );
        })}

        <div
          className={`${styles.yetihand_bottom} ${
                defaultbottom === yetiHandBottomImage ? styles.visible : styles.hidden
              }`}
          style={{ backgroundImage: `url(${defaultbottom})` }}
        />
        <div
          className={`${styles.yetihand_top} ${
                defaulttop === yetiHandTopImage ? styles.visible : styles.hidden
              }`}
          style={{ backgroundImage: `url(${defaulttop})` }}
        />

         <div
          className={`${styles.yetihand_bottom} ${
                clickbottom === yetiHandBottomImage ? styles.visible : styles.hidden
              }`}
          style={{ backgroundImage: `url(${clickbottom})` }}
        />
        <div
          className={`${styles.yetihand_top} ${
                clicktop === yetiHandTopImage ? styles.visible : styles.hidden
              }`}
          style={{ backgroundImage: `url(${clicktop})` }}
        />

        <div className={styles.player}>
          <div
            className={styles.player_overlay}
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className={styles.player_screen}>
            {/* <div
              className={`${styles.player_screen_overlay} ${styles.fingerprints}`}
              style={{ backgroundImage: `url(${fingerprints})` }}
            />
            <div
              className={`${styles.player_screen_overlay} ${styles.scratches}`}
              style={{ backgroundImage: `url(${scratches})` }}
            /> */}

            <header className={styles.header}>
              {playerState === "paused" && (
                <MdPause className={styles.header_icon} />
              )}
              {playerState === "playing" && (
                <MdPlayArrow className={styles.header_icon} />
              )}
              <div className={styles.header_icon} />
              <div className={styles.header_text}>{pageTitle}</div>
              <div className={styles.header_battery} />
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
                <Route
                  path="gallery"
                  element={
                    <Gallery
                      setImageState={setImageState}
                      imageState={imageState}
                      setOption={setOption}
                      scrollPos={scrollPos}
                    />
                  }
                />
                <Route
                  path="shows"
                  element={
                    <Shows
                      setLocation={setLocation}
                      setOption={setOption}
                      scrollPos={scrollPos}
                    />
                  }
                />
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
                setBackgroundImage(centerclick);
                setYetiHandBottomImage(clickbottom);
                setYetiHandTopImage(clicktop);
                pressDownSoundRef.current?.play();
              }}
              onPointerUp={() => {
                setYetiHands(false);
                setBackgroundImage("");
                pressUpSoundRef.current?.play();
              }}
              onPointerCancel={() => {
                setYetiHands(false);
                setBackgroundImage("");
                pressUpSoundRef.current?.play();
              }}
              className={styles.center_button}
            />
            <div
              onPointerDown={() => {
                setIsScrolling(true);
              }}
              onPointerUp={() => {
                setIsScrolling(false);
                setYetiHands(false);
              }}
              onPointerCancel={() => {
                setIsScrolling(false);
                setYetiHands(false);
              }}
              style={isScrolling ? { height: "200%", width: "200%" } : {}}
              className={styles.scrollwheel}
            >
              <Knob
                infinite={true}
                value={scrollPos}
                setValue={setScrollPos}
                startValue={0}
                endValue={10}
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
                setYetiHandBottomImage(bottom7);
                setYetiHandTopImage(top7);
                setBackgroundImage(menuclick);
                pressDownSoundRef.current?.play();
              }}
              onPointerUp={() => {
                setYetiHands(false);
                setBackgroundImage("");
                pressUpSoundRef.current?.play();
              }}
              onPointerCancel={() => {
                setYetiHands(false);
                setBackgroundImage("");
              }}
              className={styles.menu}
            >
              menu
            </div>
            <div className={styles.menu_outline} />
            <div
              onPointerDown={() => {
                setBackgroundImage(fwdclick);
                setYetiHandBottomImage(bottom5);
                setYetiHandTopImage(top5);
                handleSeekPress("fwd");
                pressDownSoundRef.current?.play();
              }}
              onPointerUp={() => {
                setYetiHands(false);
                handleSeekButtonLift("fwd");
                setBackgroundImage("");
                pressUpSoundRef.current?.play();
              }}
              onPointerCancel={() => {
                setYetiHands(false);
                setBackgroundImage("");
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
                setYetiHandBottomImage(bottom9);
                setYetiHandTopImage(top9);
                setBackgroundImage(rwdclick);
                pressDownSoundRef.current?.play();
              }}
              onPointerUp={() => {
                setYetiHands(false);
                handleSeekButtonLift("rwd");
                setBackgroundImage("");
                pressUpSoundRef.current?.play();
              }}
              onPointerCancel={() => {
                setYetiHands(false);
                handleSeekButtonLift("rwd");
                setBackgroundImage("");
                pressUpSoundRef.current?.play();
              }}
              className={styles.rwd}
            >
              <MdFastRewind className={styles.rwd_icon} />
            </div>
            <div className={styles.rwd_outline} />
            <div
              onPointerDown={() => {
                setBackgroundImage(ppclick);
                setYetiHandBottomImage(bottom3);
                setYetiHandTopImage(top3);
                pressDownSoundRef.current?.play();
              }}
              onPointerUp={() => {
                setYetiHands(false);
                setBackgroundImage("");
                pressUpSoundRef.current?.play();
              }}
              onPointerCancel={() => {
                setYetiHands(false);
                setBackgroundImage("");
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
    </div>
  );
}
