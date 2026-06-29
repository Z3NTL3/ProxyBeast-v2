import { useContext, useEffect } from "react"
import { ScreenContext } from "../screen.context"

export default function Settings() {
  let screen = useContext(ScreenContext)
  useEffect(() => {
    screen?.setScreen("Settings")
  }, [screen])

  return (
    <h1>settings</h1>
  )
}
