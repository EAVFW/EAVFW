import { ThemeProvider } from "@fluentui/react";
import { FluentProvider, Theme } from "@fluentui/react-components";
import React, { Fragment, PropsWithChildren } from "react";
import { ResolveFeature } from "../FeatureFlags";




export const RootLayout: React.FC<PropsWithChildren<{ id?: string, layout?: string }>> = (props) => {
    console.log(props);


    if (props.layout === "EmptyLayout")
        return <Fragment>{props.children}</Fragment>;

    const defaultV2Theme: Theme = ResolveFeature("defaultV2Theme", false);
    const defaultTheme = ResolveFeature("defaultTheme");


    return (
        <FluentProvider theme={defaultV2Theme}>
            <ThemeProvider theme={defaultTheme} {...props} id="web-container" />
        </FluentProvider>
    )
}
