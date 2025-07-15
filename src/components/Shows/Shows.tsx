import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getShows } from "../../util/api";
import styles from "./Shows.module.css";
import { useLocation } from "react-router-dom";

type Venue = {
  name: string;
  city: string;
  country: string;
};

type Offer = {
  type: string;
  url: string;
};

type Event = {
  id: string;
  datetime: string;
  venue: Venue;
  offers: Offer[];
};

export default function Shows({
  scrollPos,
  setOption,
  setLocation,
}: {
  scrollPos: number;
  setOption: (
    arg0: "navigate" | "playSong" | "playVideo" | "toggleImageState"
  ) => void;
  setLocation: (arg0: string) => void;
}) {
  const [shows, setShows] = useState<Event[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    async function fetchShows() {
      setLoading(true);
      const res = await getShows();

      if (typeof res === "string") {
        setErrorMessage(res);
        setShows(null);
      } else if (Array.isArray(res)) {
        setShows(res.reverse());
        setErrorMessage(null);
      } else {
        setErrorMessage("No data received.");
        setShows(null);
      }
      setLoading(false);
    }

    fetchShows();
  }, []);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const previousScrollPos = useRef(scrollPos);

  const containerRef = useRef<HTMLUListElement>(null);
  const location = useLocation();

  useEffect(() => {
    const scrollingDown = scrollPos > previousScrollPos.current;
    const scrollingUp = scrollPos < previousScrollPos.current;

    if (!shows) return;

    if (scrollingDown && selectedIndex < shows.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    } else if (scrollingUp && selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    } else if (scrollingUp && selectedIndex === 0) {
      const lastIndex = shows.length - 1;
      setSelectedIndex(lastIndex);
    } else if (scrollingDown && selectedIndex === shows.length - 1) {
      setSelectedIndex(0);
    }

    previousScrollPos.current = scrollPos;
  }, [scrollPos]);

  useEffect(() => {
    if (!shows) return;
    setLocation(shows[selectedIndex]?.offers?.[0]?.url ?? "");
    const container = containerRef.current;
    if (container) {
      const item = container.children[selectedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ behavior: "auto", block: "nearest" });
      }
    }
  }, [selectedIndex, shows, setLocation]);

  useEffect(() => {
    if (!shows) return;
    setLocation(shows[0]?.offers?.[0]?.url ?? "");
    setOption("navigate");
  }, [shows, setLocation, setOption]);

  useEffect(() => {
    previousScrollPos.current = scrollPos;
  }, [scrollPos]);

  if (loading)
    return (
      <div className={styles.shows}>
        <p className={styles.loading}>Loading shows...</p>
      </div>
    );

  if (errorMessage) return <div className={styles.shows}>{errorMessage}</div>;

  if (!shows || shows.length === 0)
    return (
      <div className={styles.shows}>
        <p className={styles.loading}>No upcoming shows.</p>
      </div>
    );

  return (
    <div className={styles.shows}>
      <ul ref={containerRef} className={styles.list}>
        {shows.map((event, index) => (
          <li
            className={`${styles.event} ${
              selectedIndex === index && styles.active
            }`}
            key={event.id}
          >
            <strong>{event.venue.name}</strong> — {event.venue.city},{" "}
            {event.venue.country}
            <br />
            Date:{" "}
            {new Date(event.datetime).toLocaleString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
            <br />
          </li>
        ))}
      </ul>
    </div>
  );
}
