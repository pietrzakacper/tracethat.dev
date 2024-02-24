import React from "react";
import ReactDOM from "react-dom/client";
import "./fonts.css";
import "./index.css";
import { Root } from "./views/Root/Root";
import { ThemeProvider } from "./components/ui/theme-provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark">
      <Root />
    </ThemeProvider>
  </React.StrictMode>,
);
