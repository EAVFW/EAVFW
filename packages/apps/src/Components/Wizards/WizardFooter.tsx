import { Button, ButtonProps, mergeClasses } from "@fluentui/react-components";
import { useStackStyles } from "../useStackStyles";
import { useWizard } from "./useWizard";
import { WizardButton } from "./WizardButton";
import { WizardNextButton } from "./WizardNextButton";



export const WizardFooter = () => {
    const stack = useStackStyles();

    const [{ wizard, tabName }] = useWizard();
    const actions = wizard?.tabs[tabName!].actions
    if (actions && Object.entries(actions).length > 0) {

        return (
            <div className={mergeClasses(stack.root, stack.horizontal)} style={{ justifyContent: "end", "margin": "10px" }}>
                {Object.entries(actions).map(([k, a]) => (<WizardButton key={k} action={k} workflow={a.workflow}>{a.text}</WizardButton>))}
            </div>
        )

    }

    return (
        <div className={mergeClasses(stack.root, stack.horizontal)} style={{ justifyContent: "end", "margin": "10px" }}>
            <WizardNextButton />
        </div>
    )
}