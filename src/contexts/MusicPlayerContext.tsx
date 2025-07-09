import { createContext, useEffect, useRef, useState } from "react";
import { SNOEY_MUSIC } from "../constants/songs";

type MusicPlayerProviderProps = {
  children: React.ReactNode;
};

type MusicPlayerContextType = {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (arg0: number) => void;
  currentTime: number;
  duration: number;
  songInfo: SongInfo;
  selectSong: (arg0: SongInfo) => void;
  playerState: "playing" | "paused";
  setPlaybackRate: (arg0: number) => void;
  playlist: SongInfo[];
  setPlaylist: (arg0: SongInfo[]) => void;
  fwd: () => void;
  rwd: () => void;
  playerVolume: number;
  setPlayerVolume: (arg0: number) => void;
  ffwd: () => void;
  rrwd: () => void;
};

const defaultContext: MusicPlayerContextType = {
  play: () => {},
  pause: () => {},
  stop: () => {},
  seek: () => {},
  duration: 0,
  songInfo: {
    title: "",
    artist: "",
    album: "",
    art: "",
    url: "",
  },
  currentTime: 0,
  selectSong: () => {},
  playerState: "playing",
  setPlaybackRate: () => {},
  playlist: [],
  setPlaylist: () => {},
  fwd: () => {},
  rwd: () => {},
  playerVolume: 1,
  setPlayerVolume: () => {},
  ffwd: () => {},
  rrwd: () => {},
};

export const MusicPlayerContext =
  createContext<MusicPlayerContextType>(defaultContext);

export default function MusicPlayerProvider({
  children,
}: MusicPlayerProviderProps) {
  const [songInfo, setSongInfo] = useState<SongInfo>({
    title: "",
    artist: "",
    album: "",
    art: "",
    url: "",
  });
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playerState, setPlayerState] = useState<"playing" | "paused">(
    "paused"
  );
  const playerRef = useRef<HTMLAudioElement>(null);
  const [playlist, setPlaylist] = useState<SongInfo[]>([]);
  const [playerVolume, setPlayerVolume] = useState<number>(1);

  function selectSong({ title, artist, album, art, url }: SongInfo) {
    setSongInfo({
      title: title,
      artist: artist,
      album: album,
      art: art,
      url: url,
    });
    setPlaylist(SNOEY_MUSIC); // this sucks!!! fix this later
  }

  function autoPlay() {
    const currentIndex = playlist.findIndex(
      (song) => song.url === songInfo.url
    );
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      const nextSong = playlist[currentIndex + 1];
      setSongInfo(nextSong);
    } else {
      stop();
      setPlaylist([]);
    }
  }
  function fwd() {
    const currentIndex = playlist.findIndex(
      (song) => song.url === songInfo.url
    );
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      setSongInfo(playlist[currentIndex + 1]);
    } else {
      setSongInfo(playlist[0]);
    }
  }

  function setVolume(volume: number) {
    if (volume > 1 || volume < 0) return;
    if (playerRef.current) playerRef.current.volume = volume;
  }

  function rwd() {
    const currentIndex = playlist.findIndex(
      (song) => song.url === songInfo.url
    );
    if (currentIndex > 0) {
      setSongInfo(playlist[currentIndex - 1]);
    } else {
      setSongInfo(playlist[playlist.length - 1]);
    }
  }

  function play() {
    if (playerRef.current && songInfo.url) playerRef.current.play();
  }

  function pause() {
    if (playerRef.current && songInfo.url) playerRef.current.pause();
  }

  function stop() {
    setDuration(0);
    setCurrentTime(0);
    setPlaybackRate(1);
    setSongInfo({ title: "", artist: "", album: "", art: "", url: "" });

    if (playerRef.current) playerRef.current.src = "";
  }

  function setPlaybackRate(rate: number) {
    if (rate < 0 && rate > 2) return;
    if (playerRef.current) playerRef.current.playbackRate = rate;
  }

  function seek(newTime: number) {
    if (playerRef.current) {
      setCurrentTime(newTime);
      playerRef.current.currentTime = newTime;
    }
  }

  function ffwd() {
    if (!playerRef.current) return;
    if (playerRef.current.currentTime + 2 < duration)
      seek(playerRef.current.currentTime + 2);
    else fwd();
  }

  function rrwd() {
    if (!playerRef.current) return;
    if (playerRef.current.currentTime - 2 > 0)
      seek(playerRef.current.currentTime - 2);
    else rwd();
  }

  useEffect(() => {
    if (playerRef.current && songInfo.url) {
      setDuration(playerRef.current.duration);
      playerRef.current.preservesPitch = false;
    }
  }, [songInfo.url, playerRef]);

  useEffect(() => {
    if (playerRef.current) setVolume(playerVolume);
  }, [playerVolume]);

  return (
    <MusicPlayerContext.Provider
      value={{
        play,
        pause,
        seek,
        stop,
        currentTime,
        duration,
        songInfo,
        selectSong,
        playerState,
        setPlaybackRate,
        playlist,
        setPlaylist,
        fwd,
        playerVolume,
        setPlayerVolume,
        rwd,
        ffwd,
        rrwd,
      }}
    >
      {children}
      <audio
        onTimeUpdate={() => {
          if (playerRef.current) setCurrentTime(playerRef.current.currentTime);
        }}
        onPlay={() => {
          setPlayerState("playing");
        }}
        onPause={() => {
          setPlayerState("paused");
        }}
        onEnded={() => {
          autoPlay();
          setPlayerState("paused");
          setDuration(0);
          setCurrentTime(0);
        }}
        onLoadedData={() => {
          play();
          if (playerRef.current) setDuration(playerRef.current.duration);
        }}
        ref={playerRef}
        src={songInfo.url}
      />
    </MusicPlayerContext.Provider>
  );
}
