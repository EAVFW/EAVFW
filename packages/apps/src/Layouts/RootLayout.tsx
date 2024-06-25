import { ThemeProvider } from "@fluentui/react";
import { FluentProvider, Theme } from "@fluentui/react-components";
import React, { Fragment, PropsWithChildren } from "react";
import { ResolveFeature } from "../FeatureFlags";
import { PortalCompatProvider } from "@fluentui/react-portal-compat";




export const RootLayout: React.FC<PropsWithChildren<{ id?: string, layout?: string }>> = (props) => {
    
    const defaultV2Theme: Theme = ResolveFeature("defaultV2Theme", false);
    const defaultTheme = ResolveFeature("defaultTheme");


    return (
        <FluentProvider theme={defaultV2Theme}>
            <PortalCompatProvider>
                <ThemeProvider theme={defaultTheme} {...props} id="web-container" />
            </PortalCompatProvider>
        </FluentProvider>
    )
}
