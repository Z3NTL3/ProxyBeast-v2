import { useContext, useEffect } from "react"
import { ScreenContext } from "../screen.context"

export default function Credits() {
  let screen = useContext(ScreenContext)
  useEffect(() => {
    screen?.setScreen("Credits")
  }, [screen])

  return (
    <h1>credits</h1>
  )
}
