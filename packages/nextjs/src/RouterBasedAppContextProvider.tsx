import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { AppInfoProvider, AppNavigationContextProps, AppNavigationContextProvider } from "@eavfw/apps";

export const RouterBasedAppContextProvider: React.FC = ({ children }) => {

     const router = useRouter();

    const navigationModel = useMemo<AppNavigationContextProps>(() => ({
        currentAppName: router.query.appname as string,
        currentAreaName: router.query.area as string,
        currentRecordId: router.query.recordId as string,
        currentEntityName: router.query.entityName as string
    }), [router.query.appname, router.query.area, router.query.recordId, router.query.entityName]);



    return (

        <AppNavigationContextProvider navModel={navigationModel}>
            <AppInfoProvider>
                {children}
            </AppInfoProvider>
        </AppNavigationContextProvider>

    )
}

