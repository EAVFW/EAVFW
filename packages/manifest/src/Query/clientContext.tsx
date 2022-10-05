import { createContext, PropsWithChildren, useContext } from "react";

const ClientContext = createContext<Partial<EAVClientProviderProps>>({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL });

export const useClientContext = () => useContext(ClientContext) as EAVClientProviderProps;

export type EAVClientProviderProps = {
    baseUrl?: string,
    onRequestInit?: (a:RequestInit)=> RequestInit
}
export const EAVClientProvider: React.FC<PropsWithChildren<EAVClientProviderProps>> = ({ children, ...props }) => <ClientContext.Provider value={props} >{children}</ClientContext.Provider>

EAVClientProvider.defaultProps = { baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }