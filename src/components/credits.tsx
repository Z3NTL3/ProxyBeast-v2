import { useContext, useEffect } from "react";
import { ScreenContext } from "../screen.context";

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
    </div>
  );
}
