import { useContext, useEffect } from "react";
import { ScreenContext } from "../screen.context";
import { Badge } from "./ui/badge";
import { PiGithubLogoDuotone } from "react-icons/pi";
import { motion } from "motion/react";
import { Avatar, AvatarBadge, AvatarImage } from "./ui/avatar";
import { MdVerified } from "react-icons/md";

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
      <p className="text-xs text-gray-400">
        These are the people behind ProxyBeast.
      </p>

      <div className="grid grid-cols-2 justify-center mt-10 gap-x-8">
        <div className="flex flex-col p-5 bg-[#2A2A45] border border-white/15 min-h-50 h-fit rounded-md">
          <div className="flex items-start gap-x-5 h-fit w-fit">
            <Avatar size={"lg"} className="mt-5">
              <AvatarImage
                src="https://avatars.githubusercontent.com/u/48758770?v=4"
                alt="@z3ntl3"
              />
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
                open-source development. He is the mastermind behind complete
                ProxyBeast ecosystem.
              </p>

              <motion.div
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
              <AvatarImage className="grayscale" alt="@terzicdsgn" />
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
                A passionate allround software engineer with deep passion for
                open-source development. He is the mastermind behind complete
                ProxyBeast ecosystem.
              </p>

              <motion.div
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
      </div>
    </div>
  );
}
