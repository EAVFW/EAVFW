import { useContext, useMemo } from "react";
import { AppInfoContext } from "./AppInfoContext";
import { AppNavigationContext } from "./AppNavigationContext";
import { useModelDrivenApp } from "./useModelDrivenApp";

export const AppInfoProvider: React.FC = ({ children }) => {

    const modelapp = useModelDrivenApp();
    const { currentAppName } = useContext(AppNavigationContext)!;

    const title = useMemo(() => {
        const app = modelapp.getApp(currentAppName);

        return app?.title ?? currentAppName ?? modelapp.getApps()[0][0] ?? "No Name";
    }, [currentAppName]);


    return (
        <AppInfoContext.Provider value={{ title }}>
            {children}
        </AppInfoContext.Provider>
    )
}