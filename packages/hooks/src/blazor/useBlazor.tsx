import React, { useContext, useMemo, useState } from "react";
import { useEffect } from "react";


declare global {
    interface Window { Blazor: any; }
}


const namespace = process.env['NEXT_PUBLIC_BLAZOR_NAMESPACE'];
const addValidationRulesFunction = process.env['NEXT_PUBLIC_BLAZOR_ADD_VALIDATION_RULES'];
const validateValidationRulesFunction = process.env['NEXT_PUBLIC_BLAZOR_VALIDATE_VALIDATION_RULES']; 
const validateFormFunction = process.env['NEXT_PUBLIC_BLAZOR_EVAL_VALIDATION'];
const updateFormDataFunction = process.env['NEXT_PUBLIC_BLAZOR_UPDATE_FORM_DATA'];
export type DisabledBlazorContextType = {
    isEnabled: false;
    isInitialized: false,
    namespace: undefined,
    startTime: number;
}
export type EnabledBlazorContextType = {
    isInitialized: boolean;
    isEnabled: true;
    namespace: string;
    init_time?: string;
    startTime: number;
    addValidationRulesFunction?: string;
    validateValidationRulesFunction?: string;
    validateFormFunction?: string;
    updateFormDataFunction?: string;
}


const blazorContext = React.createContext<DisabledBlazorContextType | EnabledBlazorContextType>({ isInitialized: false, isEnabled: false } as DisabledBlazorContextType);
export const useBlazor = () => useContext(blazorContext);
export const BlazorProvider: React.FC = ({ children }) => {

    const [isInitialized, setInitialized] = useState(false);
    const [initTime, setInitTime] = useState<string>();
    const startTime = useMemo(() => new Date().getTime(), []);

    if (typeof namespace !== "undefined" && window.Blazor) {
        useEffect(() => {
            console.log(window.Blazor);
            let loadedCount = 0;
            const resourcesToLoad = [];
           

            window.Blazor.start({
                loadBootResource: function (type: string, name: string, defaultUri: string, integrity: string) {
                   

                    switch (type) {
                        case 'dotnetjs':
                            return defaultUri;
                        default:

                            console.log(`Blazor Initialization: Loading '${type}', '${name}', '${defaultUri}', '${integrity}'`);

                            let fetchResources = fetch(defaultUri, {
                                cache: 'no-cache',
                                integrity: integrity,
                                headers: { 'Custom-Header': 'Custom Value' }
                            });

                            resourcesToLoad.push(fetchResources);

                            fetchResources.then(rsp => {

                                loadedCount += 1;
                                if (name == "blazor.boot.json")
                                    return;
                                const totalCount = resourcesToLoad.length;
                                const percentLoaded = 10 + Math.floor((loadedCount * 90.0) / totalCount);
                                const elapsed = new Date().getTime() - startTime;
                                const expectedTotal = elapsed / (percentLoaded) * 100;
                                const remaining = expectedTotal - elapsed;
                                console.log(`Blazor Initialization: Loading Done '${type}', '${name}', '${defaultUri}', '${integrity}' : ${percentLoaded}% done - ${remaining}ms remaining`)
                                
                            });;

                            return fetchResources;

                    }

                    //switch (type) {
                    //    case 'dotnetjs':
                    //    case 'dotnetwasm':
                    //    case 'timezonedata':
                    //        return `https://cdn.example.com/blazorwebassembly/5.0.0/${name}`;
                    //}
                   
                }
            }).then(() => {
                console.log("Blazor Has Started");

                DotNet.invokeMethodAsync(namespace, "GetSystemInfo")
                    .then((info: any) => {
                        console.log("Blazor Initialization: ", info);
                        setInitTime(info.init_time);
                        setInitialized(true);
                    });

               
            });

        }, [])

        return <blazorContext.Provider value={{
            addValidationRulesFunction,
            updateFormDataFunction,
            validateValidationRulesFunction,
            validateFormFunction,
            startTime: startTime,
            isInitialized: isInitialized,
            namespace: namespace,
            init_time: initTime,
            isEnabled: typeof namespace !== "undefined" && window.Blazor,
        }} >{children}</blazorContext.Provider>

    }


    return <blazorContext.Provider value={{ startTime, isEnabled: false, isInitialized: false, namespace: undefined }} >{children}</blazorContext.Provider>
   
}