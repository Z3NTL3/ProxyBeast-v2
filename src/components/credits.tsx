import { useContext, useEffect } from "react"
import { ScreenContext } from "../screen.context"

export default function Credits() {
  let screen = useContext(ScreenContext)
  useEffect(() => {
    if (typeof screen.setData !== "undefined") {
      screen.setData({...screen, current: "Credits"})
    }
  }, [screen])

  return (
    <h1>credits</h1>
  )
}
