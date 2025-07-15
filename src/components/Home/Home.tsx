import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Home.module.css";

type NavItemType = {
  name: string;
  link: string;
};

export default function Home({
  scrollPos,
  setOption,
  setLocation,
}: {
  scrollPos: number;
  setOption: (arg0: "navigate" | "playSong" | "playVideo") => void;
  setLocation: (arg0: string) => void;
}) {
  const navItems: NavItemType[] = [
    { name: "Music", link: "music" },
    { name: "Videos", link: "videos" },
    { name: "Gallery", link: "gallery" },
    { name: "Shows", link: "shows" },
    { name: "Store", link: "store" },
    { name: "Contact", link: "contact" },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const previousScrollPos = useRef(scrollPos);

  const containerRef = useRef<HTMLUListElement>(null);

  const location = useLocation();

  useEffect(() => {
    const scrollingDown = scrollPos > previousScrollPos.current;
    const scrollingUp = scrollPos < previousScrollPos.current;

    if (scrollingDown && selectedIndex < navItems.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    } else if (scrollingUp && selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    } else if (scrollingUp && selectedIndex === 0) {
      const lastIndex = navItems.length - 1;
      setSelectedIndex(lastIndex);
    } else if (scrollingDown && selectedIndex === navItems.length - 1) {
      setSelectedIndex(0);
    }

    previousScrollPos.current = scrollPos;
  }, [scrollPos]);

  useEffect(() => {
    setLocation(navItems[selectedIndex].link);
    const container = containerRef.current;
    if (container) {
      const item = container.children[selectedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ behavior: "instant", block: "nearest" });
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    setLocation(navItems[0].link);
    setOption("navigate");
  }, [location]);

  useEffect(() => {
    previousScrollPos.current = scrollPos;
  }, []);

  return (
    <div className={styles.home}>
      <ul ref={containerRef} className={styles.list}>
        {navItems.map((item, index) => (
          <Link
            target="_blank"
            key={item.name}
            to={item.link}
            className={`${styles.list_item} ${
              index === selectedIndex ? styles.selected : ""
            }`}
          >
            {item.name}
          </Link>
        ))}
      </ul>
    </div>
  );
}
