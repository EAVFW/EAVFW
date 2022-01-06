import { ReactNode } from "react";
import { RibbonButtonProps } from "./RibbonButtonProps";
import { RibbonButtons } from "./RibbonButtons";

export function RegistereRibbonButton(name: string, render: (props: RibbonButtonProps) => ReactNode | null | void) {
    RibbonButtons[name] = (props: any) => render({ ...props, key: name });
}
