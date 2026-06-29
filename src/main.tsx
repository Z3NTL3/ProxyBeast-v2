import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter, Routes, Route } from "react-router";
import Bootstrap from "./components/bootstrap";
import Settings from "./components/settings";
import Credits from "./components/credits";
import { Layout } from "./layout";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<App />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/credits" element={<Credits />} />
        </Route>
        <Route path="/bootstrap" element={<Bootstrap />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
