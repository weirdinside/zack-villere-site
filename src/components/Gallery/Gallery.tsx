import { useLocation } from "react-router-dom";
import styles from "./Gallery.module.css";
import { useState, useRef, useEffect } from "react";
import { GALLERY_IMAGES } from "../../constants/gallery";

export default function Gallery({
  scrollPos,
  setOption,
  imageState,
  setImageState,
}: {
  scrollPos: number;
  setOption: (
    arg0: "navigate" | "playSong" | "playVideo" | "toggleImageState"
  ) => void;
  imageState: "image" | "caption";
  setImageState: (arg0: "image" | "caption") => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const previousScrollPos = useRef(scrollPos);

  const containerRef = useRef<HTMLUListElement>(null);

  const location = useLocation();

  useEffect(() => {
    setImageState("image");
    setOption("toggleImageState");
  }, []);

  useEffect(() => {
    const scrollingDown = scrollPos > previousScrollPos.current;
    const scrollingUp = scrollPos < previousScrollPos.current;

    if (scrollingDown && selectedIndex < GALLERY_IMAGES.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    } else if (scrollingUp && selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    } else if (scrollingUp && selectedIndex === 0) {
      const lastIndex = GALLERY_IMAGES.length - 1;
      setSelectedIndex(lastIndex);
    } else if (scrollingDown && selectedIndex === GALLERY_IMAGES.length - 1) {
      setSelectedIndex(0);
    }
    previousScrollPos.current = scrollPos;
  }, [scrollPos]);

  useEffect(() => {
    setImageState('image')
    const container = containerRef.current;
    if (container) {
      const item = container.children[selectedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={styles.gallery}>
      <ul ref={containerRef} className={styles.gallery_list}>
        {GALLERY_IMAGES.map((item, index) => {
          return (
            <li
              className={`${styles.list_item} ${
                selectedIndex === index && styles.active
              }`}
            >
              <img
                className={`${styles.item_image} ${
                  imageState === "image" && styles.active
                } ${selectedIndex - 1 === index && styles.before} ${
                  selectedIndex + 1 === index && styles.after
                }`}
                src={item.image}
              />
              <p
                className={`${styles.item_caption} ${
                  imageState === "caption" && styles.active
                }`}
              >
                {item.caption}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
