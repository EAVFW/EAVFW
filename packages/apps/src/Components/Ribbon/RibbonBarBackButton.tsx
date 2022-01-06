import {  CommandButton, IButtonStyles, IIconProps } from "@fluentui/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";


const emojiIcon: IIconProps = { iconName: 'Back' };
const commandback: IButtonStyles = {
    root: {
        padding: 2,
        margin: 2,
        width: 40,

    },
    flexContainer: {
        justifyContent: "center"
    }
};




export const RibbonBarBackButton: React.FC = ({ }) => {
    const router = useRouter();

    return <CommandButton styles={commandback} iconProps={emojiIcon}
        onClick={(e) => router.back()} />
}



