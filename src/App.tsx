import { useEffect } from "react";
import "./App.css";
import useLoad from "./hooks/useLoad";
import { listen } from "@tauri-apps/api/event";
import logo from "./assets/logo.png";
import { AiOutlineDashboard } from "react-icons/ai";
import { IoSettingsOutline } from "react-icons/io5";
import { FaRegQuestionCircle } from "react-icons/fa";

function App() {
  useLoad();
  useEffect(() => {
    listen("activity", console.log);
  });
  return (
    <div className="flex w-screen h-screen bg-[#1E1E2E]">
      <div className="bg-[#2A2A45] w-60 h-full p-5 border-r border-[#808080]/40">
        {/*logo*/}
        <div className="flex items-center gap-2">
          <img src={logo} />
          <h2 className="text-[24px] font-bold">ProxyBeast</h2>
        </div>
        {/*end*/}

        {/*version*/}
        <p className="text-xs text-white/40 mt-2">v0.1-dev</p>
        {/*end*/}

        {/*items*/}
        <div className="flex flex-col gap-y-4 mt-10">
          <a href="/">
            <div className="cursor-pointer flex  items-center gap-x-2 px-2 py-1.5 bg-[#0A84FF] rounded-lg font-inter text-[13px] text-left">
              <AiOutlineDashboard size={20} />
              Overview
            </div>
          </a>
          <a href="/settings">
            <div className="cursor-pointer flex  items-center gap-x-2 px-2 py-1.5 text-white/40  rounded-lg font-inter text-[13px] text-left">
              <IoSettingsOutline size={20} />
              Settings
            </div>
          </a>
          <a href="/credits">
            <div className="cursor-pointer flex  items-center gap-x-2 px-2 py-1.5 text-white/40 rounded-lg font-inter text-[13px] text-left">
              <AiOutlineDashboard size={20} />
              Credits
            </div>
          </a>
        </div>
        {/*end*/}

        <div className="mt-84 flex w-full h-[0.2px] bg-white/20"></div>
        <div className="mt-5 cursor-pointer flex justify-center items-center gap-x-2 px-2 py-1.5 bg-[#0A84FF] rounded-lg font-inter text-[13px] text-center">
          Check Proxies
        </div>
        <p className="flex items-center justify-center gap-x-1 text-center text-[12px] text-white/40 mt-2">
          <FaRegQuestionCircle />
          Support
        </p>
      </div>
      <main className="flex flex-col w-full h-full">
        <div className="bg-[#2A2A45] w-full h-10 p-3 font-inter text-[13px] text-white/80 border-b border-[#808080]/40">
          Overview
        </div>
      </main>
    </div>
  );
}

export default App;
