import { createContext } from "react";


export type AppInfoContext = {
    title: string
}

export const AppInfoContext = createContext<AppInfoContext | undefined>(undefined);