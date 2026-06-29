import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/app.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import Bootstrap from "./components/bootstrap.tsx";
import Settings from "./components/settings.tsx";
import Credits from "./components/credits.tsx";
import { Layout } from "./layout.tsx";
import { useEffect, useState } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import useLoad from "./hooks/useLoad.ts";
import { ScreenContext, ScreenData } from "./screen.context.ts";
import "./App.css";
import { VERSION } from "./app.version.ts";

const Root = () => {
  useLoad();
  let [screenData, setScreenData] = useState<ScreenData>({
    app_version: VERSION,
    current: "Overview"
  })

  useEffect(() => {
    const unlisten: Array<Promise<UnlistenFn>> = [];
    const cargo_ver = listen("app_version", (ev) => {
      setScreenData((v) => {
        return {
          ...v,
          app_version: ev.payload as string
        }
      });
    });
    unlisten.push(cargo_ver);
    return () => {
      unlisten.forEach(async (v) => v.then((cleanup) => cleanup()));
    };
  }, [screenData.app_version]);

  return (
    <ScreenContext value={{
      ...screenData,
      setData: setScreenData
    }}>
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
    </ScreenContext>
  )
}
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root/>
  </React.StrictMode>,
);
