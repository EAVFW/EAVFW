import { CommandBar, ContextualMenu, DialogType, ICommandBarItemProps, ICommandBarStyleProps, ICommandBarStyles, IStackProps, IStackStyles, IStyleFunction, Stack, Theme } from "@fluentui/react";

import React, { useEffect, useState } from "react";
import { RibbonBarBackButton } from "./RibbonBarBackButton";
import { useRibbon } from "./useRibbon";






const RibbonStyles = (props: IStackProps, theme: Theme) => ({
    root: {
        overflow: 'hidden',
        width: `100%`,//
        borderBottom: `solid 0.5px ${theme.palette.neutralLight}`
    }
} as Partial<IStackStyles>);

const leftribbon: IStyleFunction<ICommandBarStyleProps, ICommandBarStyles> = (props) => ({
    root: {
        padding: 0,
        margin: 0,
        borderLeft: `solid 1px ${props.theme?.palette.neutralLight}`,
    },
});

export const RibbonBar: React.FC<{ hideBack?: boolean }> = ({ hideBack }) => {

    const { buttons } = useRibbon();

    console.log("RibbonBar", [buttons.map(c => c.key).join(",")]);

    const [copy, setCopy] = useState<ICommandBarItemProps[]>([]);

    useEffect(() => { //https://github.com/microsoft/fluentui/issues/23502
       const t= setTimeout(() => setCopy(buttons), 100);
        console.log("Copy Buttons: ", buttons.map(c => c.key).join(","));
        return () => {
            clearTimeout(t);
        }
    }, [buttons]);
     
    return <Stack horizontal id="RibbonBar" styles={RibbonStyles} >
        {!hideBack && <RibbonBarBackButton />}
        <Stack.Item grow >
            <CommandBar id="RibbonBarCommands"
                styles={leftribbon}
                items={copy}
                ariaLabel="Use left and right arrow keys to navigate between commands"
            />
        </Stack.Item>
    </Stack>
}
