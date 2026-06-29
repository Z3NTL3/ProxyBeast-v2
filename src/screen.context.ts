import { createContext, Dispatch, SetStateAction } from 'react';

interface ScreenData {
  current: String
  setScreen: Dispatch<SetStateAction<String>>
}

export const ScreenContext = createContext<ScreenData | null>(null)
