import { createContext } from "react";
import { EAVFormContextProps } from "./EAVFormContextProps";


export const EAVFormContext = createContext<EAVFormContextProps<any>>({
    actions: {
        onChange: () => { }
    },
    state: {
        formDefinition: {} as any,
        errors: {},
        formValues: {},
        visited: []
    },
    etag: new Date().toISOString()
});