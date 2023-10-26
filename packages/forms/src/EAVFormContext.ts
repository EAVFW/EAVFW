import { createContext } from "react";
import { EAVFormContextProps } from "./EAVFormContextProps";




export const EAVFormContext = createContext<EAVFormContextProps<any, any>>({
    purpose:"empty",
    actions: {
        runValidation: () => false,
        addVisited: (id) => { throw new Error("EAVFormContext not created") },
        onChange: () => { throw new Error("EAVFormContext not created") },
        updateState: () => { throw new Error("EAVFormContext not created") },
        useCollector: (a) => {  throw new Error("EAVFormContext not created") }
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