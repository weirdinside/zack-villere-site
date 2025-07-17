import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import MusicPlayerProvider from "./contexts/MusicPlayerContext.tsx";
import VideoPlayerProvider from "./contexts/VideoPlayerContext.tsx";
import SettingsContextProvider from "./contexts/SettingsContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SettingsContextProvider>
      <MusicPlayerProvider>
        <VideoPlayerProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </VideoPlayerProvider>
      </MusicPlayerProvider>
    </SettingsContextProvider>
  </StrictMode>
);
