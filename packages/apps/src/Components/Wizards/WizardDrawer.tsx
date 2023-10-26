

import { EAVForm, useEAVForm } from "@eavfw/forms";
import { mergeDeep } from "@eavfw/utils";
import {
    Button, Divider, mergeClasses, ProgressBar, SelectTabEventHandler
} from "@fluentui/react-components";
import {
    Drawer, DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle, DrawerProps
} from "@fluentui/react-components/unstable";


import { Dismiss24Regular } from "@fluentui/react-icons";

import React, { useContext, useEffect, useState } from "react";
import { ResolveFeature } from "../../FeatureFlags";
import { useStackStyles } from "../useStackStyles";
import { useWizard, useWizardOpener } from "./useWizard";
import { WizardContext } from "./WizardContext";
import { WizardFooter } from "./WizardFooter";
import { WizardMessages } from "./WizardMessages";
import { WizardTabs } from "./WizardTabs";
import { WizardToaster } from "./WizardToaster";


const Wizard: React.FC = ({ children }) => {

    //const onFormValuesChange = ResolveFeature("WizardExpressionsProvider");

    const [data, { onChange, updateState }] = useEAVForm(x => x.formValues, undefined, 'Wizard');
    const r = useContext(WizardContext)!;

    /*
     * When data is updated, we set the internal data.
     */
    useEffect(() => {
        console.log('WizardReducer: Setting Wizard FormValues', [data]);
        r[1]({ action: "setValues", values: data })
    }, [data]);

    /**
     * Reset data when the wizardkey is altered
     */
    useEffect(() => {
        console.log('WizardReducer: Clearing EAV FormValues', [r[0].wizardKey]);
        updateState((p, c) => { p.formValues = {}; c.replaceState = true });
    }, [r[0].wizardKey])

    /*
     * Handle the transition promise when set as part of transition into a new tab.
     */
    useEffect(() => {

        let p = r[0].transition;
        console.log("Transition Monitor", p);
        const dispatch = r[1];

        if (p) {
            let isCurrent = true;
            let t5 = setTimeout(() => {
                console.log("Transition Monitor 5000");
                dispatch({ action: "updateMessage", messageKey: "TransitionIn", "message": "Still working." });
            }, 5000);
            let t11 = setTimeout(() => {
                console.log("Transition Monitor 11000");
                dispatch({ action: "updateMessage", messageKey: "TransitionIn", "message": "Sorry, its taking longer than expected." });
            }, 11000);
            let t18 = setTimeout(() => {
                console.log("Transition Monitor 18000");
                dispatch({ action: "updateMessage", messageKey: "TransitionIn", "message": "Still working, sorry for keeping you wait." });
            }, 18000);

            p.then(result => {
                clearTimeout(t5);
                clearTimeout(t11);
                clearTimeout(t18);


                if (result.status.toLowerCase() === "failed") {

                    dispatch({
                        action: "setMessages", messages: {
                            "WorkflowFailed": {
                                "intent": "error",
                                "title": "Workflow Failed",
                                "message": "Pleaes reload, and try again",
                                "detailedMessage": result.failedReason
                            }
                        }
                    });

                    return;
                }


                for (let action of Object.values(result.actions)) {
                    if (action.type === "UpdateWizardContext") {


                        if (action.body?.values) {
                            // dispatch({ action: "setValues", values: action.body?.values, expressionsProvider: onFormValuesChange, merge: true })
                            onChange(props => {
                                dispatch({ action: "setValues", values: mergeDeep(props, result.body) });
                            });
                        }

                        if (action.body?.messages) {
                            dispatch({ action: "setMessages", messages: action.body?.messages });

                        }

                    }
                }
                onChange(props => {
                    dispatch({ action: "setValues", values: mergeDeep(props, result.body) });
                });
                //  dispatch({ action: "setValues", values: result.body, expressionsProvider: onFormValuesChange, merge: true });


                if (isCurrent) {
                    r[1]({ action: "setTransition", transition: false });
                }
            });

            return () => {
                isCurrent = false;
                clearTimeout(t5);
                clearTimeout(t11);
                clearTimeout(t18);

                console.log("Transition Monitor Cleared");
            }
        } else if (r[0].isTransitioning) {
            r[1]({ action: "setTransition", transition: false });
        }





    }, [r[0].transition]);


    const stack = useStackStyles();

    //  const [selectedTab, setSelectedTab] = useState(Object.keys(wizard?.tabs ?? {})[0]);
    //const selectedTab = useWizardTab() ?? Object.keys(wizard?.tabs ?? {})[0];
    const [{ tabName, wizard, isTransitioning }, { setSelectedTab }] = useWizard();
    const { closeWizard } = useWizardOpener();

    const [detailedError, setDetailedError] = useState<string>();
    if (!tabName)
        return null;

    const onTabSelect: SelectTabEventHandler = (event, data) => {
        console.log("selected tab", data);
        setSelectedTab(data.value as string);
    };





    return (<Drawer position="end" size="large"
        type="overlay"
        separator
        open={typeof wizard !== "undefined"}
        onOpenChange={(_, { open }) => closeWizard()}
    >
        <ProgressBar shape="square" thickness="large" style={{ visibility: isTransitioning ? "visible" : "hidden" }} />
        <DrawerHeader>
            <DrawerHeaderTitle
                action={
                    <Button
                        appearance="subtle"
                        aria-label="Close"
                        icon={<Dismiss24Regular />}
                        onClick={closeWizard}
                    />
                }
            >
                {wizard?.title}
            </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
            {detailedError && <div dangerouslySetInnerHTML={{ __html: detailedError }}></div>}
            <div className={mergeClasses(stack.root, stack.verticalFill)}>
                <WizardToaster />
                <WizardMessages setDetailedError={setDetailedError} />
                <WizardTabs tabs={wizard?.tabs} className={stack.itemGrow} onTabSelect={onTabSelect} selectedTab={tabName} />
                <Divider className={stack.itemShrink} />
                <WizardFooter />
            </div>
        </DrawerBody>
    </Drawer>)
}


export const WizardDrawer: React.FC = ({ }) => {









    return (
        <EAVForm purpose="drawer" onChange={(data, ctx) => {
            console.log("WziardData", data, ctx);

        }}><Wizard />
        </EAVForm>
    )
}