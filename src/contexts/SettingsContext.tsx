import { createContext, useEffect, useRef, useState } from "react";

type SettingsProviderProps = {
  children: React.ReactNode;
};

type SettingsContextType = {
  showHand: boolean;
  zoomedIn: boolean;
  toggleZoomedIn: () => void;
  toggleShowHand: () => void;
};

const getInitialShowHand = (): boolean => {
  const initialShowHand = localStorage.getItem("showHand");
  if (initialShowHand === "true") return true;
  if (initialShowHand === "false") return false;
  return true;
};

const getInitialZoomedIn = (): boolean => {
  const initialZoomedIn = localStorage.getItem("zoomedIn");
  if (initialZoomedIn === "true") return true;
  if (initialZoomedIn === "false") return false;
  return false;
};

const defaultContext: SettingsContextType = {
  showHand: true,
  zoomedIn: false,
  toggleZoomedIn: () => {},
  toggleShowHand: () => {},
};

export const SettingsContext =
  createContext<SettingsContextType>(defaultContext);

export default function SettingsContextProvider({
  children,
}: SettingsProviderProps) {
  const [showHand, setShowHand] = useState<boolean>(getInitialShowHand());
  const [zoomedIn, setZoomedIn] = useState<boolean>(getInitialZoomedIn());

  function toggleZoomedIn() {
    setZoomedIn((prev) => !prev);
  }

  function toggleShowHand() {
    setShowHand((prev) => !prev);
  }

  useEffect(
    function setShowHandToStorage() {
      localStorage.setItem("showHand", showHand.toString());
    },
    [showHand]
  );

  useEffect(
    function setZoomedInToStorage() {
      localStorage.setItem("zoomedIn", zoomedIn.toString());
    },
    [zoomedIn]
  );

  return (
    <SettingsContext.Provider
      value={{ showHand, zoomedIn, toggleZoomedIn, toggleShowHand }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
