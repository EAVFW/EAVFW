import { ICommandBarStyles, IStackStyles, mergeStyleSets } from "@fluentui/react";

export const RibbonStyles: IStackStyles = {
    root: {
        overflow: 'hidden',
        width: `100%`,
        borderBottom: "solid 0.5px white"
    },
};
export const leftribbon: ICommandBarStyles = {
    root: {
        padding: 0,
        margin: 0,
    },
};

export const classNames = mergeStyleSets({
    wrapper: {
        height: '80vh',
        position: 'relative',
        backgroundColor: 'white',
    },
    filter: {
        backgroundColor: 'white',
        paddingBottom: 20,
        maxWidth: 300,
    },
    header: {
        margin: 0,
        backgroundColor: 'white',
    },
    row: {
        display: 'inline-block',
    },
    cell: {
        alignSelf: "center",

    }
});