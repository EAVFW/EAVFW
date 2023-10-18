import { Button } from "@fluentui/react-components";
import { useWizard } from "./useWizard";

export const WizardNextButton = () => {
    const [{isTransitioning }, {moveNext }] = useWizard();

    return <Button disabled={isTransitioning} onClick={moveNext}>Next</Button>;
}