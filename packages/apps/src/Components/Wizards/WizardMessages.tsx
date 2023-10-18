import { Button } from "@fluentui/react-components";
import { MessageBar, MessageBarActions, MessageBarBody, MessageBarTitle } from "@fluentui/react-message-bar-preview";
import { useWizard } from "./useWizard";
import { Dismiss24Regular, DismissRegular } from "@fluentui/react-icons";
import { Dispatch, SetStateAction, useState } from "react";

export const WizardMessages: React.FC<{ setDetailedError: Dispatch<SetStateAction<string | undefined>> }> = ({ setDetailedError }) => {
    const [{ messages = {} }] = useWizard();
  
    return (
        <>
        {
            Object.entries(messages).map(([k, m]) => {
                return (
                    <MessageBar key={k} shape="square" intent={m.intent}>
                        <MessageBarBody>
                            <MessageBarTitle>{m.title}</MessageBarTitle>
                            {m.message}
                        </MessageBarBody>
                        {m.detailedMessage && <MessageBarActions
                            containerAction={
                                <Button
                                    aria-label="dismiss"
                                    appearance="transparent"
                                    icon={<DismissRegular />}
                                />
                            }
                        >
                            <Button onClick={() => setDetailedError(m.detailedMessage)}>See Detailed Message</Button>
                        </MessageBarActions>}
                    </MessageBar>
                )
            })
        }
        </>
    );
}