import { useContext, useEffect } from "react"
import { ScreenContext } from "../screen.context"
import { LuSettings2 } from "react-icons/lu";
import { Switch } from "@/components/ui/switch"
import { SiTraefikproxy } from "react-icons/si";
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import URI_Tooltip from "./uri-tooltip";
import { MdTimer } from "react-icons/md";

export default function Settings() {
  let screen = useContext(ScreenContext)
  useEffect(() => {
    if (typeof screen.setData !== "undefined") {
      screen.setData({...screen, current: "Settings"})
    }
  }, [screen])

  return (
    <div className="flex flex-col p-5 mx-8 mt-10">
      <h1 className="text-2xl">Settings</h1>
      <p className="text-xs text-gray-400">
        Configure your applications settings.
      </p>


      {/* settings pane */}
      <div className="grid grid-cols-2 gap-x-10 items-start justify-center mt-14">

        {/* pane item */}
        <div className="flex flex-col bg-[#2A2A45] w-[350px] h-fit rounded-md p-4 border border-white/20">
          <div className="flex items-center gap-x-1 mb-2">
            <LuSettings2 size={22} color="#4D6AF0" />
            <h2 className="text-[18px]">General</h2>
          </div>

          {/* sub item */}
          <div className="flex mt-2">
            <div className="flex flex-col">
              <h3 className="text-[14px] text-gray-300">Auto-Retry</h3>
              <p className="text-[12px] text-gray-400">Retry failed connections automatically.</p>
            </div>
            <div className="flex grow  justify-end items-center">
              <Switch />
            </div>
          </div>
          {/* end */}

          {/* sub item */}
          <div className="flex mt-2">
            <div className="flex w-full flex-col">
              <h3 className="text-[14px] text-gray-300">Pool Size</h3>
              <p className="text-[12px] text-gray-400">Customize the worker pool size.</p>

              <div className="flex grow w-full justify-end items-end">
                <Badge className="text-[#0058BC] bg-[#D8E2FF] text-[12px]">
                  1000
                </Badge>
              </div>
              <Slider className="mt-2" defaultValue={[1000]} max={10_000} step={10} />
            </div>
          </div>
          {/* end */}
        </div>
        {/* end */}

        {/* pane item */}
        <div className="flex flex-col bg-[#2A2A45] w-[350px] h-fit rounded-md p-4 border border-white/20">
          <div className="flex items-center gap-x-1 mb-2">
            <SiTraefikproxy size={22} color="#4D6AF0" />
            <h2 className="text-[18px]">Connection</h2>
          </div>

          {/* sub item */}
          <div className="flex mt-2">
            <div className="flex flex-col w-full">
              <h3 className="text-[14px] text-gray-300">Timeout</h3>
              <p className="text-[12px] text-gray-400">Ignore proxies with higher latency than.</p>
              <div className="flex grow w-full justify-end items-end">
                <Badge className="text-[#0058BC] bg-[#D8E2FF] text-[12px]">
                  5000ms
                </Badge>
              </div>
            </div>
          </div>
          <Slider className="mt-2" defaultValue={[5]} max={30} step={1} />
          <p className="mt-5 text-gray-400 text-[12px]">
            Our proxy checker uses <URI_Tooltip/> schemes to detect multi protocol proxies. Your file must contain proxies in <URI_Tooltip/> format.
          </p>
          {/* end */}
        </div>
        {/* end */}


      </div>
      {/* end */}
    </div>
  )
}
