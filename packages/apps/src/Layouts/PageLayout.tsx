import { IStackStyles, Stack } from "@fluentui/react";
import React, { useEffect } from "react";
import ModelDrivenNavigation from "../Components/Navigation/ModelDrivenNavigation";
import { TopBar } from "../Components/TopBar/ModelDrivenTopBar";
import { ResolveFeature } from "../FeatureFlags";
import { PageLayoutProps } from "./PageLayoutProps";
import { PageStackStyles } from "./PageStackStyles";

 
import {
    DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle,
    Drawer,
    DrawerProps,
} from "@fluentui/react-components/unstable";
import {
    Button,
    Label,
    Radio,
    RadioGroup,
    makeStyles,
    shorthands,
    tokens,
    useId,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";

type DrawerType = Required<DrawerProps>["type"];

export function PageLayout(props: PageLayoutProps) {
    console.log(props);

    const topBarTheme = ResolveFeature("topBarTheme");

    const [isOpen, setIsOpen] = React.useState(false);
    const [type, setType] = React.useState<DrawerType>("overlay");
    useEffect(() => {
        setTimeout(() => {
            console.log("Opening drawer");
            setIsOpen(true)
        }, 10000);

    }, [])
    if (!props.sitemap)
        return <div>loading</div>

    return (
        <Stack verticalFill>
            <TopBar theme={topBarTheme} title={props.title} search={true} />


            <Stack.Item grow style={{ overflow: "hidden" }}>
                <Stack styles={PageStackStyles} horizontal verticalFill>
                    <ModelDrivenNavigation sitemap={props.sitemap} theme={topBarTheme} />
                    <Stack.Item grow>
                        <Drawer
                            type={type}
                            separator
                            open={isOpen}
                            onOpenChange={(_, { open }) => setIsOpen(open)}
                        >
                            <DrawerHeader>
                                <DrawerHeaderTitle
                                    action={
                                        <Button
                                            appearance="subtle"
                                            aria-label="Close"
                                            icon={<Dismiss24Regular />}
                                            onClick={() => setIsOpen(false)}
                                        />
                                    }
                                >
                                    Default Drawer
                                </DrawerHeaderTitle>
                            </DrawerHeader>

                            <DrawerBody>
                                <p>Drawer content</p>
                            </DrawerBody>
                        </Drawer>
                        {props.children}
                    </Stack.Item>
                </Stack>

            </Stack.Item>

        </Stack>
    )
}