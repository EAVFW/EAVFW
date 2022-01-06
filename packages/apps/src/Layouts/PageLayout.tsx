import { IStackStyles, Stack } from "@fluentui/react";
import React from "react";
import ModelDrivenNavigation from "../Components/Navigation/ModelDrivenNavigation";
import { TopBar } from "../Components/TopBar/ModelDrivenTopBar";
import { ResolveFeature } from "../FeatureFlags";
import { PageLayoutProps } from "./PageLayoutProps";
import { PageStackStyles } from "./PageStackStyles";

 



export function PageLayout(props: PageLayoutProps) {
    console.log(props);

    const topBarTheme = ResolveFeature("topBarTheme");

    if (!props.sitemap)
        return <div>loading</div>

    return (
        <Stack verticalFill>
            <TopBar theme={topBarTheme} title={props.title} search={true} />

            <Stack.Item grow style={{ overflow: "hidden" }}>
                <Stack styles={PageStackStyles} horizontal verticalFill>
                    <ModelDrivenNavigation sitemap={props.sitemap} theme={topBarTheme} />
                    <Stack.Item grow>
                        {props.children}
                    </Stack.Item>
                </Stack>

            </Stack.Item>

        </Stack>
    )
}