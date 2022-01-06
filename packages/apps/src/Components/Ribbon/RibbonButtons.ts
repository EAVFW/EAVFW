import { ReactNode } from "react";
import { RibbonButtonProps } from "./RibbonButtonProps";



export const RibbonButtons: { [key: string]: (props: Partial<RibbonButtonProps>) => ReactNode | null | void } = {};
