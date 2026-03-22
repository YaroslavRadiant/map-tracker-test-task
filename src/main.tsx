import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { StoreProvider } from "./providers/StoreProvider";

import { CssBaseline } from "@mui/material";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <CssBaseline />
        <App />
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
