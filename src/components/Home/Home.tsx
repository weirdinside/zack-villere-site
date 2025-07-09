import React, { useEffect, useRef, useState } from "react";
import styles from "./Home.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
    { name: "Store", link: "store" },
    { name: "Contact", link: "" },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const previousScrollPos = useRef(scrollPos);

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
  }, [selectedIndex]);

  useEffect(() => {
    setLocation(navItems[0].link);
    setOption("navigate");
  }, [location]);

  return (
    <div className={styles.home}>
      <ul className={styles.list}>
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
