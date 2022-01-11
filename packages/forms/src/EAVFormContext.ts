import { createContext } from "react";
import { EAVFormContextProps } from "./EAVFormContextProps";


export const EAVFormContext = createContext<EAVFormContextProps<any>>({
    actions: {
        runValidation: () => false,
        addVisited: (id) => { },
        onChange: () => { },
        updateState: () => { }
    },
    state: {
        formDefinition: {} as any,
        errors: {},
        formValues: {},
        fieldMetadata: {}
    },
    etag: new Date().toISOString()
});