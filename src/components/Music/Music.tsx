import { useEffect, useRef, useState } from "react";
import { SNOEY_MUSIC } from "../../constants/songs";
import styles from "./Music.module.css";
import AutoscrollText from "../Autoscroll";
import { useNavigate } from "react-router-dom";

export default function Music({
  setOption,
  scrollPos,
  setHoveredSong,
}: {
  setOption: (arg0: "navigate" | "playSong" | "playVideo") => void;
  scrollPos: number;
  setHoveredSong: (arg0: SongInfo) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const previousScrollPos = useRef(scrollPos);

  const navigate = useNavigate();
  const containerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const scrollingDown = scrollPos > previousScrollPos.current;
    const scrollingUp = scrollPos < previousScrollPos.current;

    if (scrollingDown && selectedIndex < SNOEY_MUSIC.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    } else if (scrollingUp && selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    } else if (scrollingUp && selectedIndex === 0) {
      setSelectedIndex(SNOEY_MUSIC.length - 1);
    } else if (scrollingDown && selectedIndex === SNOEY_MUSIC.length - 1) {
      setSelectedIndex(0);
    }

    previousScrollPos.current = scrollPos;
  }, [scrollPos]);

  useEffect(() => {
    setOption("playSong");
    setHoveredSong(SNOEY_MUSIC[0]);
    previousScrollPos.current = scrollPos;
  }, []);

  useEffect(() => {
    setHoveredSong(SNOEY_MUSIC[selectedIndex]);
    const container = containerRef.current;
    if (container) {
      const item = container.children[selectedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ behavior: "instant", block: "nearest" });
      }
    }
  }, [selectedIndex]);

  async function handleSelectSong(song: SongInfo) {
    setHoveredSong(song);
    setOption("playSong");
    navigate("player");
  }

  return (
    <div className={styles.music}>
      <ul ref={containerRef} className={styles.list}>
        {SNOEY_MUSIC.map((song, index) => (
          <li
            onClick={() => {handleSelectSong(song)}}
            key={song.title}
            className={`${styles.list_item} ${
              selectedIndex === index ? styles.selected : ""
            }`}
          >
            <AutoscrollText align="left" trigger={selectedIndex === index}>
              {song.title}
            </AutoscrollText>
          </li>
        ))}
      </ul>
    </div>
  );
}
