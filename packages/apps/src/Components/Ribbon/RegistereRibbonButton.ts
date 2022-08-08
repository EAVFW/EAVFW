import { ReactNode } from "react";
import { RibbonButtonProps } from "./RibbonButtonProps";
import { RibbonButtons } from "./RibbonButtons";

export interface IRibbonBuilder {
    addAlias(alias: string): IRibbonBuilder
}
class RibbonBuilder implements IRibbonBuilder {
    constructor(private name: string) {

    }

    addAlias(alias: string) {
        RibbonButtons[alias] = RibbonButtons[this.name];
        return this;
    }
}
export function RegistereRibbonButton(name: string, render: (props: RibbonButtonProps) => ReactNode | null | void) {
    RibbonButtons[name] = (props: any) => render({ ...props, key: name });

    return new RibbonBuilder(name) as IRibbonBuilder;
}
