import { Stack } from "@fluentui/react";
import React from "react";
import { TopBar } from "../Components/TopBar/ModelDrivenTopBar";
import { ResolveFeature } from "../FeatureFlags";



export function AppPickerLayout(props: any) {
    console.log("AppPickerLayout", props);
  
    const topBarTheme = ResolveFeature("topBarTheme");

    return (
        <Stack verticalFill className="test" id="AppPickerLayout" >
            <TopBar theme={topBarTheme} title={props.title} search={true} />

            <Stack.Item grow style={{ overflow: "hidden" }}>
                {props.children}

            </Stack.Item>

        </Stack>

    );
}