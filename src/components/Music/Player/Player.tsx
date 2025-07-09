import {
  useContext,
  useEffect,
  useRef,
  useState,
  type PointerEventHandler,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MusicPlayerContext } from "../../../contexts/MusicPlayerContext";
import AutoscrollText from "../../Autoscroll";
import styles from "./Player.module.css";

export default function Player({ scrollPos }: { scrollPos: number }) {
  const {
    songInfo,
    duration,
    currentTime,
    playerState,
    pause,
    play,
    playerVolume,
    seek,
    setPlayerVolume,
  } = useContext(MusicPlayerContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [volumeVisible, setVolumeVisible] = useState<boolean>(false);
  const previousScrollPos = useRef<number>(scrollPos);
  const timeoutRef = useRef<number | null>(null);

  const [songTime, setSongTime] = useState<number>(0);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);

  useEffect(() => {
    if (!isSeeking) setSongTime(currentTime);
  }, [currentTime]);

  function roundVolume(num: number) {
    return Math.round(num / 0.05) * 0.05;
  }

  function showVolumeControl() {
    if (!volumeVisible) setVolumeVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setVolumeVisible(false);
    }, 2000);
  }

  useEffect(() => {
    if (location.pathname.split("/").at(-1) === "player") {
      const scrollingDown = scrollPos > previousScrollPos.current;
      const scrollingUp = scrollPos < previousScrollPos.current;
      const currentVolume = playerVolume;

      if (scrollingDown) {
        const newVolume = currentVolume + 0.05;
        if (newVolume <= 1) {
          setPlayerVolume(roundVolume(newVolume));
          showVolumeControl();
        }
      } else if (scrollingUp) {
        const newVolume = currentVolume - 0.05;
        if (newVolume >= 0) {
          setPlayerVolume(roundVolume(newVolume));
          showVolumeControl();
        }
      }
    }

    previousScrollPos.current = scrollPos;
  }, [scrollPos, location.pathname, playerVolume, setPlayerVolume]);

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.code === "Space") {
        console.log(playerState);
        if (playerState === "playing") pause();
        else if (playerState === "paused") play();
      }
    };

    window.addEventListener("keyup", handleKeyUp);

    if (!songInfo.url) navigate(-1);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [playerState, pause, play, songInfo.url, navigate]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div className={styles.player}>
      <div className={styles.player__main}>
        <div
          className={styles.artwork}
          style={{ backgroundImage: `url(${songInfo.art})` }}
        />
        {songInfo && (
          <div className={styles.songinfo}>
            <h2 className={styles.title}>
              <AutoscrollText align="right" scrollSpeed={0.5} pauseTime={500}>
                {songInfo.title}
              </AutoscrollText>
            </h2>
            <h3 className={styles.artists}>
              <AutoscrollText align="right" scrollSpeed={0.7} pauseTime={500}>
                {songInfo.artist}
              </AutoscrollText>
            </h3>
            <div className={styles.album}>
              <AutoscrollText align="right">{songInfo.album}</AutoscrollText>
            </div>
          </div>
        )}
      </div>

      {songInfo && (
        <input
          min={0}
          max={1}
          step={0.05}
          type="range"
          value={playerVolume}
          readOnly
          className={`${styles.volume} ${volumeVisible && styles.active}`}
        />
      )}

      {currentTime && duration ? (
        <div
          className={`${styles.time__controls} ${
            volumeVisible && styles.inactive
          }`}
        >
          <input
            onPointerDown={(e: React.PointerEvent<HTMLInputElement>) => {
              const input = e.target as HTMLInputElement;
              setIsSeeking(true);
              console.log(parseFloat(input.value) * duration)
              setSongTime(parseFloat(input.value) * duration);
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSongTime(parseFloat(e.target.value) * duration);
            }}
            onPointerUp={(e: React.PointerEvent<HTMLInputElement>) => {
              setIsSeeking(false);
              const value = parseFloat(e.currentTarget.value);
              seek(value * duration);
            }}
            onPointerCancel={(e: React.PointerEvent<HTMLInputElement>) => {
              setIsSeeking(false);
              const value = parseFloat(e.currentTarget.value);
              seek(value * duration);
            }}
            min={0}
            max={1}
            step={0.01}
            type="range"
            value={songTime / duration}
            className={styles.slider}
          />
          {currentTime && duration && (
            <>
              <p className={styles.time}>{`${Math.floor(
                currentTime / 60
              )}:${Math.floor(currentTime % 60)
                .toString()
                .padStart(2, "0")}`}</p>
              <p className={`${styles.time} ${styles.duration}`}>{`${Math.floor(
                duration / 60
              )}:${Math.floor(duration % 60)
                .toString()
                .padStart(2, "0")}`}</p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
