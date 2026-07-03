import { useContext, useEffect } from "react";
import { ScreenContext } from "../screen.context";
import { Badge } from "./ui/badge";
import { PiGithubLogoDuotone } from "react-icons/pi";
import { motion } from "motion/react";
import { Avatar, AvatarBadge, AvatarImage } from "./ui/avatar";
import { MdVerified } from "react-icons/md";
import { GrGroup } from "react-icons/gr";
import { openUrl } from "@tauri-apps/plugin-opener";
import z3ntl3Pfp from "@/assets/img/z3ntl3.png";
import filipPfp from "@/assets/img/filip.png";
import { FaSquareXTwitter } from "react-icons/fa6";

export default function Credits() {
  let screen = useContext(ScreenContext);
  useEffect(() => {
    if (typeof screen.setData !== "undefined") {
      screen.setData((screen_) => {
        return {
          ...screen_,
          current: "Credits",
        };
      });
    }
  }, [screen.current !== "Credits"]);

  return (
    <div className="flex flex-col p-5 mx-8 mt-10">
      <h1 className="text-2xl">Contributors</h1>
      <p className="text-md text-gray-400">
        These are the people behind ProxyBeast.
      </p>

      <div className="grid grid-cols-2 justify-center mt-10 gap-x-8 gap-y-10">
        <div className="flex flex-col p-5 bg-[#2A2A45] border border-white/15 min-h-50 h-fit rounded-md">
          <div className="flex items-start gap-x-5 h-fit w-fit">
            <Avatar size={"lg"} className="mt-5">
              <AvatarImage src={z3ntl3Pfp} alt="@z3ntl3" />
              <AvatarBadge>
                <MdVerified />
              </AvatarBadge>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-x-2 mt-3">
                <h2 className="font-semibold text-xl">z3ntl3</h2>
                <Badge className="text-xs">Lead Maintainer</Badge>
              </div>
              <p className="text-white/60 font-light text-md">
                A passionate allround software engineer with deep passion for
                computer science. Admires the art of reading. He is the
                mastermind behind the complete ProxyBeast ecosystem.
              </p>

              <motion.div
                onClick={() => openUrl("https://github.com/z3ntl3")}
                whileHover={{
                  scaleX: 1.04,
                }}
                className="mt-3 bg-[#2A2A3D] items-center gap-x-2 text-[14px] w-fit px-10 text-left flex justify-start py-1 rounded-lg border border-white/15 cursor-pointer"
              >
                <PiGithubLogoDuotone /> Github
              </motion.div>
            </div>
          </div>
        </div>
        <div className="flex flex-col p-5 bg-[#2A2A45] border border-white/15 min-h-50 h-fit rounded-md">
          <div className="flex items-start gap-x-5 h-fit w-fit">
            <Avatar size={"lg"} className="mt-5">
              <AvatarImage
                src={filipPfp}
                className="grayscale"
                alt="@terzicdsgn"
              />
              <AvatarBadge>
                <MdVerified />
              </AvatarBadge>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-x-2 mt-3">
                <h2 className="font-semibold text-xl">terzicdsgn</h2>
                <Badge className="text-xs">Lead Designer</Badge>
              </div>
              <p className="text-white/60 font-light text-md">
                Talented UI/UX youngster. Focused on elevating creative designs
                to higher levels of profound designs. Contributed to the GUI and
                our product landing website.
              </p>

              <motion.div
                onClick={() => openUrl("https://x.com/terzicdsgn")}
                whileHover={{
                  scaleX: 1.04,
                }}
                className="mt-3 bg-[#2A2A3D] items-center gap-x-2 text-[14px] w-fit px-10 text-left flex justify-start py-1 rounded-lg border border-white/15 cursor-pointer"
              >
                <FaSquareXTwitter /> Twitter
              </motion.div>
            </div>
          </div>
        </div>

        <div className="col-span-full justify-self-center  items-center w-160 flex flex-col p-5 bg-[#2A2A45] border border-white/15 min-h-50 h-fit rounded-md">
          <GrGroup size={28} className="text-[#0A84FF]" />
          <h2 className="font-semibold text-[20px]">Star us on Github</h2>
          <p className="text-center text-white/60 text-md">
            By starring our Github repository you would highly motivate our
            maintainers and show your respect for their efforts.
          </p>

          <div
            onClick={() => openUrl("https://github.com/Z3NTL3/ProxyBeast-v2")}
            className="mt-2 font-semibold bg-[#0A84FF] px-16 py-1 rounded-md hover:shadow-[1px_1px_30px_0.1px_rgba(53,120,236,0.4)] cursor-pointer"
          >
            Repository
          </div>
        </div>
      </div>
    </div>
  );
}
