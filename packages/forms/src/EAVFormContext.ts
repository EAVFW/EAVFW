import { createContext } from "react";
import { EAVFormContextProps } from "./EAVFormContextProps";


export const EAVFormContext = createContext<EAVFormContextProps<any>>({
    actions: {
        addVisited: (id) => { },
        onChange: () => { }
    },
    state: {
        formDefinition: {} as any,
        errors: {},
        formValues: {},
        visited: [],
        editedFields: {},
    },
    etag: new Date().toISOString()
});