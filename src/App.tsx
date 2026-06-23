import { useEffect, useState } from "react";
import "./App.css";
import useLoad from "./hooks/useLoad";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
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
import { BsCashStack } from "react-icons/bs";
import { invoke, Channel } from "@tauri-apps/api/core";

function App() {
  let [logs, setLogs] = useState<Array<string>>([]);
  let [version, setVersion] = useState<string>("1.0.0");

  let loaded = useLoad();
  useEffect(() => {
    const unlisten: Array<Promise<UnlistenFn>> = [];
    const activity = listen("activity", (ev) => {
      setLogs((log_) => [...log_, ev.payload as string]);
    });

    const cargo_ver = listen("app_version", (ev) => {
      setVersion(ev.payload as string);
    });

    unlisten.push(activity, cargo_ver);

    return () => {
      unlisten.forEach(async (v) => v.then((cleanup) => cleanup()));
    };
  }, []);

  useEffect(() => {
    console.log("loaded", loaded);
    if (!loaded) return;

    const onEvent = new Channel<String>();
    onEvent.onmessage = (message) => {
      console.log(`got download event ${message}`);
    };

    invoke("check_proxy", {
      timeout: 6000,
      proxy_uri: "socks5://adsdadsasdqw123:adasdasdas@23.27.184.40:5641",
      chan: onEvent,
    }).then(console.info);
  }, [loaded]);

  return (
    <div className="flex w-screen h-screen bg-[#1E1E2E] overflow-hidden">
      <div className="bg-[#2A2A45] w-60 h-full p-5 border-r border-[#808080]/40">
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
          <a href="/">
            <div className="hover:shadow-[1px_1px_30px_0.1px_rgba(53,120,236,0.4)] cursor-pointer flex  items-center gap-x-2 px-2 py-1.5 bg-[#0A84FF] rounded-lg font-inter text-[13px] text-left">
              <AiOutlineDashboard size={20} />
              Overview
            </div>
          </a>
          <a href="/credits">
            <div className="hover:text-white cursor-pointer flex  items-center gap-x-2 px-2 py-1.5 text-white/40 rounded-lg font-inter text-[13px] text-left">
              <BsCashStack size={20} />
              Credits
            </div>
          </a>
          <a href="/settings">
            <div className="hover:text-white cursor-pointer flex  items-center gap-x-2 px-2 py-1.5 text-white/40  rounded-lg font-inter text-[13px] text-left">
              <IoSettingsOutline size={20} />
              Settings
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
            onClick={async () => {
              let path = await open({
                multiple: false,
                directory: false,
                filters: [
                  {
                    name: "(txt) Proxy file",
                    extensions: ["txt"],
                  },
                ],
              });

              console.log("path:", path);
              invoke("read_file", { path });
            }}
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
                <div className="flex items-center p-1">
                  <h2 className="text-xs text-white/40">Progress</h2>

                  <div className="flex w-full justify-end text-white/40 text-xs">
                    0%
                  </div>
                </div>
                <div className="border border-white/20 bg-[#2A2A45] w-full h-2 rounded-full"></div>
              </div>
            </div>

            <div className="cursor-pointer flex items-center gap-x-1 text-sm justify-center bg-[#0A84FF] w-full ml-2 rounded-lg p-4 mt-5 text-center font-semibold">
              <TiMediaPlayOutline size={20} />
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

          <div className="w-full h-20 overflow-y-scroll flex flex-col">
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
