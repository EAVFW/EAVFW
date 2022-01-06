import { CommandBar, ContextualMenu, DialogType, ICommandBarStyleProps, ICommandBarStyles, IStackProps, IStackStyles, IStyleFunction, Stack, Theme } from "@fluentui/react";

import React, { useEffect } from "react";
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

    useEffect(() => {
        console.debug("Buttons for RibbonBar updated", buttons);
    }, [buttons]);


    return <Stack horizontal id="RibbonBar" styles={RibbonStyles} >
        {!hideBack && <RibbonBarBackButton />}
        < Stack.Item grow >
            <CommandBar id="RibbonBarCommands"
                styles={leftribbon}
                items={buttons}
                ariaLabel="Use left and right arrow keys to navigate between commands"
            />
        </Stack.Item>
    </Stack>
}
