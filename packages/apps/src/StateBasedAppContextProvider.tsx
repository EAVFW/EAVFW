import React, { useState } from "react";
import { EAVApp } from "./EAVApp";
import { ModelDrivenApp } from "./ModelDrivenApp";

export const StateBasedAppContextProvider: React.FC<{ model: ModelDrivenApp }> = ({ children, model }) => {

    const [currentAppName, setcurrentAppName] = useState("");
    const [currentAreaName, setcurrentAreaName] = useState("");
    const [currentEntityName, setcurrentEntityName] = useState("");
    const [currentRecordId, setcurrentRecordId] = useState("");




    return (
        <EAVApp model= { model } >
        <AppNavigationContext.Provider value={
            {
                currentAppName,
                    currentAreaName,
                    currentRecordId,
                    currentEntityName,
            }
    }>
        <AppInfoProvider>
        { children }
        < /AppInfoProvider>
        < /AppNavigationContext.Provider>
        < /EAVApp>
    )
}