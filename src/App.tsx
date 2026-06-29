import { memo, useEffect, useState } from "react";
import "./App.css";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { open } from "@tauri-apps/plugin-dialog";
import { TiMediaPlayOutline } from "react-icons/ti";
import { PiDownloadSimple } from "react-icons/pi";
import { invoke, Channel } from "@tauri-apps/api/core";
import { FaStop } from "react-icons/fa";
import { motion, useAnimate } from "motion/react";
import moment from "moment";

function App() {
  let [logs, setLogs] = useState<Array<String>>([]);
  let [didStart, setDidStart] = useState(false);
  let [scope, animate] = useAnimate();

  useEffect(() => {
    const unlisten: Array<Promise<UnlistenFn>> = [];
    const activity = listen("activity", (ev) => {
      setLogs((log_) => [...log_, ev.payload as string]);
    });

    let id = setInterval(() => {
      let log_pane = document.getElementById("pane");
      log_pane?.lastElementChild?.scrollIntoView(false);
    }, 24);

    unlisten.push(activity);
    return () => {
      unlisten.forEach(async (v) => v.then((cleanup) => cleanup()));
      clearInterval(id);
    };
  }, []);

  const startChecker = async () => {
    animate("#checker-btn", {
      rotate: [0, 360],
    });

    if (didStart) {
      await invoke("stop_check");
      return;
    }

    const channel = new Channel<string>();
    channel.onmessage = (message) => {
      switch (true) {
        case message === "proxy-checker:end":
          console.log("stop");
          setDidStart((_) => false);
          setLogs((logs) => [
            ...logs,
            `[${moment().format("HH:mm:ss")}] Proxy checker terminated`,
          ]);
          break;
        case message === "proxy-checker:start":
          console.log("start");
          setDidStart((_) => true);
          setLogs((logs) => [
            ...logs,
            `[${moment().format("HH:mm:ss")}] Proxy checker initialized`,
          ]);
          break;
        case message.includes("proxy|good"): {
          let ack = message
            .split("proxy|good|")[1]
            .split("|")
            .filter((v) => v !== "");
          console.log("ack", ack);

          let proxy = ack[0];
          let latency = ack[2];

          setLogs((logs) => [
            ...logs,
            `[${moment().format("HH:mm:ss")}] live: ${proxy} - latency ${latency}ms`,
          ]);
          break;
        }
        case message.includes("proxy|bad"): {
          let proxy = message.split("proxy|bad|")[1];
          if (proxy.length === 0) return;

          setLogs((logs) => [
            ...logs,
            `[${moment().format("HH:mm:ss")}] dead: ${proxy}`,
          ]);
          break;
        }
      }
    };

    invoke("check_proxy_list", {
      chan: channel,
    });
  };

  return (
    <div className="w-full h-full overflow-hidden" ref={scope}>
      <div className="flex p-4 w-full h-fit">
        <div
          onClick={() => {
            open({
              multiple: false,
              directory: false,
              filters: [
                {
                  name: "(txt) Proxy file",
                  extensions: ["txt"],
                },
              ],
            }).then((path) => {
              if (typeof path === "string" && path.length > 1) {
                invoke("read_file", { path });
              }
            });
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

          <div
            onClick={startChecker}
            className={`${!didStart ? "hover:shadow-[1px_1px_30px_0.1px_rgba(53,120,236,0.4)]" + " bg-[#0A84FF]" : "hover:shadow-[1px_1px_30px_0.1px_rgba(255,68,2,0.3)]" + " bg-red-500"} cursor-pointer flex items-center gap-x-1 text-sm justify-center w-full ml-2 rounded-lg p-4 mt-5 text-center font-semibold`}
          >
            <motion.div
              id="checker-btn"
              whileInView={{ rotate: [0, 360] }}
              layout
            >
              {!didStart ? (
                <TiMediaPlayOutline size={20} />
              ) : (
                <FaStop size={20} />
              )}
            </motion.div>
            {!didStart ? "Start Check" : "Stop Check"}
          </div>

          <div className="hover:shadow-[1px_1px_30px_0.1px_rgba(255,255,255,0.02)] cursor-pointer flex flex-col gap-y-1 items-center justify-center border border-white/10 text-center rounded-lg ml-2 mt-4 p-2 text-white/40 text-xs">
            <PiDownloadSimple className="text-white/70 font-bold" size={18} />
            Export Proxies
          </div>
        </div>
      </div>

      <div className="flex flex-col w-[76%] p-2 rounded-md mx-4 h-fit overflow-hidden mb-5 bg-[#2A2A45] border border-white/10 mt-2">
        <div className="flex items-center w-full h-fit">
          <h2 className="font-semibold font-inter">Live Logs</h2>

          <div className="flex grow justify-end items-center mr-2">
            <div className="bg-blue-500 rounded-full w-1 h-1 animate-pulse"></div>
          </div>
        </div>

        <div
          id="pane"
          className="w-full h-20 overflow-y-scroll flex flex-col scrollbar-thumb-gray-800 resize-y  "
        >
          {logs.map((log, i) => (
            <div key={`logview-item-${i}`} className="flex">
              <p className="text-[13px] text-white/40">
                {log.includes("live") || log.includes("dead") ? (
                  <span
                    className={`text-xs ${log.includes("live") ? "text-green-300" : "text-red-400"}`}
                  >
                    {log}
                  </span>
                ) : (
                  log
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default memo(App);
