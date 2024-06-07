import React from "react";
import ReactDOM from "react-dom/client";
import "./fonts.css";
import "./index.css";
import { App } from "./views/App/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
