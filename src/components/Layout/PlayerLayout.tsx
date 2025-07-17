// components/Layout/PlayerLayout.tsx

import { Outlet } from "react-router-dom";
import styles from "../../App.module.css";
import { MdPause, MdPlayArrow, MdFastForward, MdFastRewind } from "react-icons/md";
import { IoBatteryHalf } from "react-icons/io5";
import Knob from "../Knob/Knob";
import { useContext } from "react";
import { Howler } from "howler";
import { MusicPlayerContext } from "../../contexts/MusicPlayerContext";

interface PlayerLayoutProps {
  scrollPos: number;
  setScrollPos: (value: number) => void;
  setOption: (option: "navigate" | "playSong" | "playVideo" | "toggleImageState") => void;
  setLocation: (location: string) => void;
  locationHook: any;
  navigate: (to: string) => void;
  pageTitle: string;
  imageState: "image" | "caption";
  setImageState: (value: "image" | "caption") => void;
  hoveredSong: any;
  hoveredVideo: any;
  handleCenterClick: ({ option, location }: { option: "navigate" | "playSong" | "playVideo" | "toggleImageState"; location: string }) => void;
  handleSeekPress: (button: "fwd" | "rwd") => void;
  handleSeekButtonLift: (button: "fwd" | "rwd") => void;
  handlePPButton: () => void;
  pressDownSoundRef: React.RefObject<Howl | null>;
  pressUpSoundRef: React.RefObject<Howl | null>;
}

export default function PlayerLayout({
  scrollPos,
  setScrollPos,
  locationHook,
  navigate,
  pageTitle,
  handleCenterClick,
  handleSeekPress,
  handleSeekButtonLift,
  handlePPButton,
  pressDownSoundRef,
  pressUpSoundRef,
}: PlayerLayoutProps) {
  const { playerState } = useContext(MusicPlayerContext);

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
            {playerState === "paused" && <MdPause className={styles.header_icon} />}
            {playerState === "playing" && <MdPlayArrow className={styles.header_icon} />}
            <div className={styles.header_icon} />
            <div className={styles.header_text}>{pageTitle}</div>
            <IoBatteryHalf className={styles.header_battery} />
          </header>
          <div className={styles.outlet}>
            <Outlet />
          </div>
        </div>

        <div className={styles.player_scrollwheel}>
          <div
            onClick={() => {
              handleCenterClick({ option: "navigate", location: locationHook.pathname });
            }}
            onPointerDown={() => pressDownSoundRef.current?.play()}
            onPointerUp={() => pressUpSoundRef.current?.play()}
            onPointerCancel={() => pressUpSoundRef.current?.play()}
            className={styles.center_button}
          />
          <div className={styles.scrollwheel}>
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
            onPointerDown={() => pressDownSoundRef.current?.play()}
            onPointerUp={() => pressUpSoundRef.current?.play()}
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
            onPointerDown={() => pressDownSoundRef.current?.play()}
            onPointerUp={() => pressUpSoundRef.current?.play()}
            onPointerCancel={() => pressUpSoundRef.current?.play()}
            onClick={() => handlePPButton()}
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
