import { Button, ButtonProps } from "@fluentui/react-components";
import { MouseEventHandler } from "react";
import { useWizard } from "./useWizard";


export const WizardButton: React.FC<{ action:string,workflow?: string } & ButtonProps> = ({ children,action, workflow, ...buttonProps }) => {
    const [{ isTransitioning }, { moveNext }] = useWizard();

    return <Button shape="square"  {...buttonProps} disabled={isTransitioning} onClick={((e) => { moveNext(action); }) as MouseEventHandler}>{children}</Button>;
}
