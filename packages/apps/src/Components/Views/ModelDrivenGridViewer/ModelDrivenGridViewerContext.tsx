import {
    PropsWithChildren, createContext, useContext,
} from "react";
import { DefaultPrimaryFieldRender, DefaultPrimaryFieldRenderProps } from "./Components/DefaultPrimaryFieldRender";

const ModelDrivenGridViewerContext = createContext<ModelDrivenGridViewerContextProps>({ onRenderPrimaryField: DefaultPrimaryFieldRender });

export type ModelDrivenGridViewerContextProps = {
    onRenderPrimaryField: React.FC<DefaultPrimaryFieldRenderProps>;
}

export function useModelDrivenGridViewerContext<T>() {
    return useContext<ModelDrivenGridViewerContextProps>(
        ModelDrivenGridViewerContext
    ) as ModelDrivenGridViewerContextProps & T;
}
export function ModelDrivenGridViewerContextProvider<T>({
    children,
    ...props
}: PropsWithChildren<ModelDrivenGridViewerContextProps & T>) {
    return (
        <ModelDrivenGridViewerContext.Provider value={props}>
            {children}
        </ModelDrivenGridViewerContext.Provider>
    );
}