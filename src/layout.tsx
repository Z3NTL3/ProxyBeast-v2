import React, { memo, useEffect, useState } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { FaRegQuestionCircle } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import { MdMinimize } from "react-icons/md";
import { Window } from "@tauri-apps/api/window";
import { Outlet } from "react-router";
import "./App.css";
import logo from "./assets/logo.png";
import useLoad from "./hooks/useLoad";
import { motion } from "motion/react";
import { ScreenContext } from "./screen.context";
import { SCREENS } from "./screens.tsx";
import { invoke } from "@tauri-apps/api/core";

export const Layout = memo(() => {
  useLoad();
  let [version, setVersion] = useState<string>("1.0.0");
  let [screen, setScreen] = useState<String>("Overview")

  useEffect(() => {
    const unlisten: Array<Promise<UnlistenFn>> = [];
    const cargo_ver = listen("app_version", (ev) => {
      setVersion(ev.payload as string);
    });
    unlisten.push(cargo_ver);
    return () => {
      unlisten.forEach(async (v) => v.then((cleanup) => cleanup()));
    };
  }, [version]);

  return (
    <ScreenContext value={{
      current: screen,
      setScreen
    }}>
      <div
        className="flex w-screen h-screen bg-[#1E1E2E] overflow-hidden"
      >
        <motion.div layout className="bg-[#2A2A45] w-60 h-full p-5 border-r border-[#808080]/40">
          {/*logo*/}
          <div data-tauri-drag-region className="flex items-center">
            <img width={40} src={logo} />
            <h2 className="text-[24px] font-bold">ProxyBeast</h2>
          </div>
          {/*end*/}

          {/*version*/}
          <p className="text-xs text-white/40 mt-2 ml-1">v{version}</p>
          {/*end*/}

          {/*items*/}
          <div className="flex flex-col gap-y-4 mt-10">
            {SCREENS.map((screen_, i) => (
              <React.Fragment key={`screen-${i}`}>
                {
                  screen === screen_.title ?
                    <a key={`screen-${i}`} href={screen_.href} onClick={async () => {
                      await invoke("stop_check")
                      return true;
                    }}>
                      <motion.div animate={{scaleY: [0,1]}} className="hover:shadow-[1px_1px_30px_0.1px_rgba(53,120,236,0.4)] bg-[#0A84FF] cursor-pointer flex items-center gap-x-2 px-2 py-1.5 rounded-lg font-inter text-[13px] text-left">
                        {screen_.node}
                      </motion.div>
                    </a>
                    :
                    <a key={`screen-${i}`} href={screen_.href}  onClick={async () => {
                      await invoke("stop_check")
                      return true;
                    }}>
                      <div className="text-white/40 cursor-pointer flex items-center gap-x-2 px-2 py-1.5 rounded-lg font-inter text-[13px] text-left">
                        {screen_.node}
                      </div>
                    </a>
                }
              </React.Fragment>
            ))}
          </div>
          {/*end*/}

          <div className="mt-100 flex w-full h-[0.2px] bg-white/20"></div>
          <p className="mt-5 flex items-center justify-center gap-x-1 text-center text-[12px] text-white/40 hover:text-white hover:cursor-pointer">
            <FaRegQuestionCircle />
            Support
          </p>
        </motion.div>
        <main className="flex flex-col w-full h-full items-start">
          <motion.div
            layout animate={{opacity: [0, 1]}}
            data-tauri-drag-region
            className="flex bg-[#2A2A45] w-full h-10 p-3 font-inter text-[13px] text-white/80 border-b border-[#808080]/40"
          >
            Overview
            <div className="flex grow items-center justify-end gap-x-1">
              <MdMinimize
                className="font-bold"
                fontSize={18}
                onClick={() => Window.getCurrent().minimize()}
              />
              <MdOutlineClose
                className="font-bold"
                fontSize={18}
                onClick={() => Window.getCurrent().close()}
              />
            </div>
          </motion.div>

          <motion.div className="w-full h-full" layout animate={{ opacity: [0, 1] }} transition={{
            type: "keyframes",
            ease: "easeIn"
          }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </ScreenContext>
  );
})
