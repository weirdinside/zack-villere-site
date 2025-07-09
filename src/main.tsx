import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import MusicPlayerProvider from "./contexts/MusicPlayerContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MusicPlayerProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MusicPlayerProvider>
  </StrictMode>
);
