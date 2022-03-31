import React, { useContext, useState } from "react";
import { useEffect } from "react";


declare global {
    interface Window { Blazor: any; }
}
const namespace = process.env['NEXT_PUBLIC_BLAZOR_NAMESPACE'];
const blazorContext = React.createContext({ isInitialized: false });
export const useBlazor = () => useContext(blazorContext);
export const BlazorProvider: React.FC = ({ children }) => {

    const [blazor, setBlazor] = useState({ isInitialized: false });
    if (namespace) {
        useEffect(() => {
            console.log(window.Blazor);
            window.Blazor.start().then(() => {
                console.log("Blazor Has Started");
                setBlazor({ isInitialized: true });
            });

        }, [])

    }



    return <blazorContext.Provider value={blazor} >{children}</blazorContext.Provider>
}