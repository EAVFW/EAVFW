import { createContext } from "react";
import { EAVFormContextProps } from "./EAVFormContextProps";


export const EAVFormContext = createContext<EAVFormContextProps<any>>({
    actions: {
        runValidation: () => false,
        addVisited: (id) => { },
        onChange: () => { },
        updateState: () => { },
        registerCollector: (a,b) => { }
    },
    state: {
        formDefinition: {} as any,
        errors: {},
        formValues: {},
        fieldMetadata: {},
        isErrorsUpdated: false
    },
    etag: new Date().toISOString()
});