import React from "react";
import ReactDOM from "react-dom/client";
import "./fonts.css";
import "./index.css";
import { Root } from "./views/Root/Root";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
