import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import Bootstrap from "./components/bootstrap.tsx";
import { Layout } from "./layout.tsx";
import { lazy, useEffect, useState } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import useLoad from "./hooks/useLoad.ts";
import { ScreenContext, ScreenData } from "./screen.context.ts";
import "./App.css";

const OverviewScreen = lazy(() => import("./components/app.tsx"));
const SettingsScreen = lazy(() => import("./components/settings.tsx"));
const CreditsScreen = lazy(() => import("./components/credits.tsx"));

const Root = () => {
  useLoad();
  let [screenData, setScreenData] = useState<ScreenData>({
    version: "1.0.0",
    current: "Overview",
  });

  useEffect(() => {
    const unlisten: Array<Promise<UnlistenFn>> = [];
    const cargo_ver = listen("app_version", (ev) => {
      sessionStorage.setItem("version", ev.payload as string);
      setScreenData((data) => {
        return {
          ...data,
          version: ev.payload as string,
        };
      });
    });

    unlisten.push(cargo_ver);
    return () => {
      unlisten.forEach(async (v) => v.then((cleanup) => cleanup()));
    };
  }, []);

  return (
    <BrowserRouter>
      <ScreenContext
        value={{
          ...screenData,
          setData: setScreenData,
        }}
      >
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<OverviewScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/credits" element={<CreditsScreen />} />
          </Route>
          <Route path="/bootstrap" element={<Bootstrap />} />
        </Routes>
      </ScreenContext>
    </BrowserRouter>
  );
};
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    <Root />
  </>,
);
