import { useContext, useEffect } from "react"
import { ScreenContext } from "../screen.context"

export default function Credits() {
  let screen = useContext(ScreenContext)
  useEffect(() => {
    if (typeof screen.setData !== "undefined") {
      screen.setData((screen_) => {
        return {
          ...screen_,
          current: "Credits"
        }
      })
    }
  }, [])

  return (
    <h1>credits</h1>
  )
}
