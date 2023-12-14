import { PropsWithChildren, createContext, useContext, useMemo } from "react";


const ModelDrivenViewContext = createContext({ mutate: () => { } });

export const useModelDrivenViewContext = () => useContext(ModelDrivenViewContext);

export const ModelDrivenViewContextProvider: React.FC<PropsWithChildren<{ mutate: () => void }>> = ({ mutate, children }) => {
    const value = useMemo(() => ({ mutate }), [mutate]);
    return <ModelDrivenViewContext.Provider value={value} >{children }</ModelDrivenViewContext.Provider>
}