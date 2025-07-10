import { useState, useRef, useEffect } from "react";
import AutoscrollText from "../Autoscroll";
import styles from "./Contact.module.css";

const CONTACT_ITEMS = [
  {
    name: "Instagram",
    link: "https://instagram.com/zackvillere",
  },
  {
    name: "Email",
    link: "mailto:zackvillere@gmail.com",
  },
];

export default function Contact({
  setOption,
  scrollPos,
  setLocation,
}: {
  setOption: (arg0: "navigate" | "playSong" | "playVideo") => void;
  scrollPos: number;
  setLocation: (arg0: string) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const previousScrollPos = useRef(scrollPos);

  const containerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const scrollingDown = scrollPos > previousScrollPos.current;
    const scrollingUp = scrollPos < previousScrollPos.current;

    if (scrollingDown && selectedIndex < CONTACT_ITEMS.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    } else if (scrollingUp && selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    } else if (scrollingUp && selectedIndex === 0) {
      const lastIndex = CONTACT_ITEMS.length - 1;
      setSelectedIndex(lastIndex);
    } else if (scrollingDown && selectedIndex === CONTACT_ITEMS.length - 1) {
      setSelectedIndex(0);
    }

    previousScrollPos.current = scrollPos;
  }, [scrollPos]);

  useEffect(() => {
    setLocation(CONTACT_ITEMS[selectedIndex].link);
  }, [selectedIndex]);

  useEffect(() => {
    setLocation(CONTACT_ITEMS[0].link);
    setOption("navigate");
  }, [location]);

  return (
    <div className={styles.music}>
      <ul ref={containerRef} className={styles.list}>
        {CONTACT_ITEMS.map((item, index) => (
          <li
            key={item.name}
            className={`${styles.list_item} ${
              selectedIndex === index ? styles.selected : ""
            }`}
          >
            <AutoscrollText align="left" trigger={selectedIndex === index}>
              {item.name}
            </AutoscrollText>
          </li>
        ))}
      </ul>
    </div>
  );
}
