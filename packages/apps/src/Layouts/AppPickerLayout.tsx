import { Stack } from "@fluentui/react";
import React from "react";
import { TopBar } from "../Components/TopBar/ModelDrivenTopBar";
import { ResolveFeature } from "../FeatureFlags";
import { useSectionStyles } from "../Styles";



export function AppPickerLayout(props: any) {
    console.log("AppPickerLayout", props);
  
    const topBarTheme = ResolveFeature("topBarTheme");
    const styles = useSectionStyles();

    return (
        <Stack verticalFill  id="AppPickerLayout" >
            <TopBar theme={topBarTheme}  search={true} showMenuOpener={false } />

            <Stack.Item className={styles.section} grow style={{ overflow: "hidden" }}>
                {props.children}

            </Stack.Item>

        </Stack>

    );
}