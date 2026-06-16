import { useEffect, useState } from "react";
import "./App.css";
import useLoad from "./hooks/useLoad";
import { listen } from "@tauri-apps/api/event";
import logo from "./assets/logo.png";
import { AiOutlineDashboard } from "react-icons/ai";
import { IoSettingsOutline } from "react-icons/io5";
import { FaRegQuestionCircle } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import { MdMinimize } from "react-icons/md";
import { Window } from "@tauri-apps/api/window";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { open } from "@tauri-apps/plugin-dialog";
import { TiMediaPlayOutline } from "react-icons/ti";
import { PiDownloadSimple } from "react-icons/pi";

function App() {
  let [logs, setLogs] = useState<Array<string>>([]);

  useLoad();
  useEffect(() => {
    listen("activity", (log) => {
      console.log(1)
      setLogs((log_) => [...log_, log.payload as string]);
    });
  });
  return (
    <div className="flex w-screen h-screen bg-[#1E1E2E] overflow-hidden">
      <div className="bg-[#2A2A45] w-60 h-full p-5 border-r border-[#808080]/40">
        {/*logo*/}
        <div data-tauri-drag-region className="flex items-center gap-2">
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
        <p className="flex items-center justify-center gap-x-1 text-center text-[12px] text-white/40 mt-2 hover:text-white hover:cursor-pointer">
          <FaRegQuestionCircle />
          Support
        </p>
      </div>
      <main className="flex flex-col w-full h-full items-start">
        <div
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
        </div>

        <div className="flex p-4 w-full h-full">
          <div
            onClick={() =>
              open({
                multiple: false,
                directory: false,
                filters: [
                  {
                    name: "(txt) Proxy file",
                    extensions: ["txt"],
                  },
                ],
              })
            }
            className="cursor-pointer rounded-md flex flex-col justify-center items-center border-white/20  border-2 border-dotted w-[78%] h-120"
          >
            <div className="p-3 bg-[#DBDBFD] rounded-full mb-5">
              <AiOutlineCloudUpload color="#4D6AF0" size={30} />
            </div>

            <h3>Drop your proxy list here</h3>
            <p className="text-[13px] text-white/50">
              You simply drag or click in this box to select your proxy list
              file
            </p>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col items-start justify-start bg-[#2A2A45] p-2 w-50 h-50 ml-2 rounded-md border border-white/10">
              <div className="flex items-center w-full text-white/40 text-xs">
                Total Loaded
                <div className="flex grow justify-end items-center mr-2">
                  <h4 className="text-white text-lg font-semibold">0</h4>
                </div>
              </div>

              <div className="flex w-full items-center gap-x-2 mt-7">
                <div className="bg-green-500 rounded-full w-2 h-2"></div>

                <p className="text-xs text-white/40">Live</p>

                <h2 className="flex grow items-center justify-end mr-1 text-green-600 font-semibold text-2xl">
                  0
                </h2>
              </div>

              <div className="flex w-full items-center gap-x-2 mt-1">
                <div className="bg-red-500 rounded-full w-2 h-2"></div>

                <p className="text-xs text-white/40">Dead</p>

                <h2 className="flex grow items-center justify-end mr-1 text-red-600 font-semibold text-2xl">
                  0
                </h2>
              </div>

              <div className="flex flex-col w-full grow justify-end">
                <div className="flex items-center">
                  <h2 className="text-xs text-white/40">Progress</h2>

                  <div className="flex w-full justify-end text-white/40 text-xs">
                    0%
                  </div>
                </div>
                <div className="border border-white/20 bg-white w-full h-2 rounded-full"></div>
              </div>
            </div>

            <div className="cursor-pointer flex items-center gap-x-1 justify-center bg-[#0A84FF] w-full ml-2 rounded-lg p-4 mt-5 text-center font-bold">
              <TiMediaPlayOutline size={24} />
              Start Check
            </div>

            <div className="cursor-pointer flex flex-col gap-y-1 items-center justify-center border border-white/10 text-center rounded-lg ml-2 mt-4 p-2 text-white/40 text-xs">
              <PiDownloadSimple className="text-white/70 font-bold" size={19} />
              Export Proxies
            </div>
          </div>
        </div>

        <div className="flex flex-col w-[76%] p-2 rounded-md mx-4 h-fit overflow-hidden mb-5 bg-[#2A2A45] border border-white/10">
          <div className="flex items-center w-full h-fit">
            <h2 className="font-semibold font-inter">Live Logs</h2>

            <div className="flex grow justify-end items-center mr-2">
              <div className="bg-blue-500 rounded-full w-1 h-1 animate-pulse"></div>
            </div>
          </div>

          <div className="w-full h-full overflow-y-scroll flex flex-col">
            {logs.map((log, i) => (
              <div key={`logview-item-${i}`} className="flex">
                <p className="text-[13px] text-white/40">{log}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
