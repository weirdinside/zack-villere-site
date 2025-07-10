import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MusicPlayerContext } from "../../../contexts/MusicPlayerContext";
import { VideoPlayerContext } from "../../../contexts/VideoPlayerContext";
import styles from "./VideoPlayer.module.css";

export default function VideoPlayer({
  video,
  scrollPos,
}: {
  video: VideoInfo | undefined;
  scrollPos: number;
}) {
  const { playVideo, duration, currentTime, videoInfo, videoPlayerRef } =
    useContext(VideoPlayerContext);

  const { playerVolume, setPlayerVolume } = useContext(MusicPlayerContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [volumeVisible, setVolumeVisible] = useState<boolean>(false);
  const previousScrollPos = useRef<number>(scrollPos);
  const timeoutRef = useRef<number | null>(null);

  const [songTime, setSongTime] = useState<number>(0);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);

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

  return (
    <div className={styles.videoplayer}>
      <div className={styles.videoplayer_content}>
        <video
          playsInline
          className={styles.video}
          ref={videoPlayerRef}
          onLoadedData={() => {
            playVideo();
          }}
          width="100%"
          height="100%"
          controls={false}
        >
          <source src={video ? video.link : ""} type="video/mp4" />
          <div className={styles.navigator}></div>
        </video>
      </div>
    </div>
  );
}
