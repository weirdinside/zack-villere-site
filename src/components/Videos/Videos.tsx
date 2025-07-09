import { useState, useRef, useEffect } from "react";
import { SNOEY_VIDEOS } from "../../constants/videos";
import AutoscrollText from "../Autoscroll";
import styles from "./Videos.module.css";

export default function Videos({
  setOption,
  scrollPos,
  setHoveredVideo,
}: {
  setOption: (arg0: "navigate" | "playSong" | "playVideo") => void;
  scrollPos: number;
  setHoveredVideo: (arg0: VideoInfo) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const previousScrollPos = useRef(scrollPos);

  const containerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const scrollingDown = scrollPos > previousScrollPos.current;
    const scrollingUp = scrollPos < previousScrollPos.current;

    if (scrollingDown && selectedIndex < SNOEY_VIDEOS.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    } else if (scrollingUp && selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    } else if (scrollingUp && selectedIndex === 0) {
      setSelectedIndex(SNOEY_VIDEOS.length - 1);
    } else if (scrollingDown && selectedIndex === SNOEY_VIDEOS.length - 1) {
      setSelectedIndex(0);
    }

    previousScrollPos.current = scrollPos;
  }, [scrollPos]);

  useEffect(() => {
    setOption("playVideo");
    setHoveredVideo(SNOEY_VIDEOS[0]);
  }, []);

  useEffect(() => {
    setHoveredVideo(SNOEY_VIDEOS[selectedIndex]);
    const container = containerRef.current;
    if (container) {
      const item = container.children[selectedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ behavior: "instant", block: "nearest" });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={styles.music}>
      <ul ref={containerRef} className={styles.list}>
        {SNOEY_VIDEOS.map((video, index) => (
          <li
            key={video.name}
            className={`${styles.list_item} ${
              selectedIndex === index ? styles.selected : ""
            }`}
          >
            <AutoscrollText align="left" trigger={selectedIndex === index}>
              {video.name}
            </AutoscrollText>
          </li>
        ))}
      </ul>
    </div>
  );
}
