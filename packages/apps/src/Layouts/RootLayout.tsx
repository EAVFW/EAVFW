import { ThemeProvider } from "@fluentui/react";
import React, { Fragment } from "react";
import { ResolveFeature } from "../FeatureFlags";



export const RootLayout: React.FC<{id?: string, layout?:string}> = (props) => {
    console.log(props);
    
    
    if (props.layout === "EmptyLayout")
        return <Fragment>{props.children}</Fragment> ;

    const defaultTheme = ResolveFeature("defaultTheme");

    return <ThemeProvider theme={defaultTheme} {...props} id="web-container" />
}
