import { mergeClasses } from "@fluentui/react-components";
import { useStackStyles } from "../useStackStyles";
import { WizardNextButton } from "./WizardNextButton";


export const WizardFooter = () => {
    const stack = useStackStyles();

    return (
        <div className={mergeClasses(stack.root, stack.horizontal)} style={{ justifyContent: "end", "margin": "10px" }}>
            <WizardNextButton />
        </div>
    )
}