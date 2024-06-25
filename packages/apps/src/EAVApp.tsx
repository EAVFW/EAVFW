import { PropsWithChildren, useMemo, useReducer } from "react";
import { EAVClientProvider, ManifestDefinition } from "@eavfw/manifest";
import { AppContext, AppContextType } from "./AppContext";
import {  ModelDrivenApp } from "./ModelDrivenApp";

function throwIfNull<T>(value: T, error: string) {
    return value ?? (() => { throw new Error(error) })();
}
export interface EAVAppProps {
    baseUrl?: string
}
export interface EAVAppModelProps extends EAVAppProps{
    model: ModelDrivenApp
}
export interface EAVAppManifestProps extends EAVAppProps {
    manifest: ManifestDefinition
}
export type Test = EAVAppModelProps | EAVAppManifestProps;




export type EAVAppReducerAction =
    {
        action: 'setLocale',
        locale: string
    } |
    {
        action: 'toggleNav'
    };





const EAVAppReducer = (state: AppContextType, action: EAVAppReducerAction) => {
    switch (action.action) {
        case 'setLocale':
          //  state.locale = action.locale;
            break;
        case 'toggleNav':
            return {
                ...state,
                isModelDrivenNavigationOpen: !state.isModelDrivenNavigationOpen
            }

             

    }

    return { ...state };

}



export const EAVApp: React.FC<PropsWithChildren<Test>> = ({ children, baseUrl, ...props }) => {

  //  const model = useMemo(() => "model" in props ?
  //        props.model : new ModelDrivenApp(throwIfNull(props.manifest, "Manifest or model must be given")), ["model" in props ? props.model:props.manifest]);

    const [state, dispatcher] = useReducer(EAVAppReducer, props, (arg: typeof props) => (
        {
            isModelDrivenNavigationOpen:true,
            model: "model" in arg ?
                arg.model : new ModelDrivenApp(throwIfNull(arg.manifest, "Manifest or model must be given"))
        }
    ));
    

     

    console.log("EAVAPP", [
        state, dispatcher,
        state.isModelDrivenNavigationOpen,
        state.model._id]);
  
    return (<EAVClientProvider baseUrl={baseUrl}>

        <AppContext.Provider value={[state, { toggleNav: () => dispatcher({ action: 'toggleNav' }) }]}>
            {children}
        </AppContext.Provider>
    </EAVClientProvider>
    )
}

