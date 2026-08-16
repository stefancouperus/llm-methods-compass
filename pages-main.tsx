import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/source-sans-3";
import "@fontsource-variable/source-serif-4";
import Home from "./app/page";
import "./app/globals.css";

const root = document.getElementById("root");

if (!root) throw new Error("Dashboard root element is missing");

createRoot(root).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
