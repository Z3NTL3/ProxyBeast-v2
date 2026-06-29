import { useContext, useEffect } from "react"
import { ScreenContext } from "../screen.context"

export default function Settings() {
  let screen = useContext(ScreenContext)
  useEffect(() => {
    if (typeof screen.setData !== "undefined") {
      screen.setData({...screen, current: "Settings"})
    }
  }, [screen])

  return (
    <h1>settings</h1>
  )
}
