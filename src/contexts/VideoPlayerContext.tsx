import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { MusicPlayerContext } from "./MusicPlayerContext";

type VideoPlayerContextProviderProps = {
  children: React.ReactNode;
};

type VideoPlayerContextType = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  videoPlayerRef: RefObject<HTMLVideoElement | null>;
  videoInfo: VideoInfo | null;
  currentTime: number;
  duration: number;
  handleUpdateVideoTime: () => void;
  seekVideo: (arg0: number) => void;
  videoPlayerState: "playing" | "paused";
};

const dummyRef = { current: null } as unknown as RefObject<HTMLVideoElement>;

const defaultContext: VideoPlayerContextType = {
  playVideo: () => {},
  pauseVideo: () => {},
  stopVideo: () => {},
  videoInfo: {
    link: "",
    name: "",
  },
  videoPlayerRef: dummyRef,
  currentTime: 0,
  duration: 0,
  handleUpdateVideoTime: () => {},
  seekVideo: () => {},
  videoPlayerState: "paused",
};

export const VideoPlayerContext =
  createContext<VideoPlayerContextType>(defaultContext);

export default function VideoPlayerProvider({
  children,
}: VideoPlayerContextProviderProps) {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [videoPlayerState, setVideoPlayerState] = useState<
    "playing" | "paused"
  >("playing");

  const { playerVolume } = useContext(MusicPlayerContext);

  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  function playVideo() {
    if (videoPlayerRef.current) {
      setVideoPlayerState("playing");
      videoPlayerRef.current.play();
    }
  }

  function pauseVideo() {
    if (videoPlayerRef.current) {
      setVideoPlayerState("paused");
      videoPlayerRef.current.pause();
    }
  }

  function stopVideo() {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause();
      setVideoInfo(null);
      setDuration(0);
      setCurrentTime(0);
    }
  }

  function seekVideo(newTime: number) {
    if (videoPlayerRef.current) {
      setCurrentTime(newTime);
      videoPlayerRef.current.currentTime = newTime;
    }
  }

  function handleUpdateVideoTime() {
    if (videoPlayerRef.current)
      setCurrentTime(videoPlayerRef.current.currentTime);
  }

  useEffect(() => {
    if (videoPlayerRef.current) {
      setDuration(videoPlayerRef.current.duration);
    }
  }, [videoPlayerRef]);

  useEffect(() => {
    if (videoPlayerRef.current && playerVolume) {
      videoPlayerRef.current.volume = playerVolume;
    }
  }, [playerVolume, videoPlayerRef]);

  return (
    <VideoPlayerContext.Provider
      value={{
        playVideo,
        pauseVideo,
        stopVideo,
        videoInfo,
        currentTime,
        duration,
        videoPlayerRef,
        handleUpdateVideoTime,
        seekVideo,
        videoPlayerState,
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
}
