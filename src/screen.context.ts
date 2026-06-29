import { createContext, Dispatch, SetStateAction } from 'react';
import { VERSION } from './app.version';

export interface ScreenData {
  app_version: String
  current: String
  setData?: Dispatch<SetStateAction<ScreenData>>
}

export const ScreenContext = createContext<ScreenData>({
  app_version: VERSION,
  current: "Overview"
})
