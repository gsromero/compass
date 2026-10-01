import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { LangProvider } from "./lib/lang.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LangProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LangProvider>
  </StrictMode>,
);
