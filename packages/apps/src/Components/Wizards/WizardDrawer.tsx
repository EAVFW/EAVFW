

import {
    DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle,
    Drawer,
    DrawerProps
} from "@fluentui/react-components/unstable";
import {
    Button,
    Label,
    Radio,
    RadioGroup,
    makeStyles,
    shorthands,
    tokens,
    useId,
    Divider,
    SelectTabEventHandler,
    Field,
    ProgressBar,
} from "@fluentui/react-components";
import {
    MessageBar,
    MessageBarActions,
    MessageBarTitle,
    MessageBarBody,
    MessageBarIntent,
} from '@fluentui/react-message-bar-preview';

import { Dismiss24Regular, DismissRegular } from "@fluentui/react-icons";
import { IWizardMessage, IWizardMessages, WizardsDefinition } from "@eavfw/manifest";
import { WizardTabsComponent } from "./WizardTabsComponent";
import { classNames, useStackStyles } from "../useStackStyles";
import React, { createContext, Reducer, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { EAVForm, EAVFormContext, useEAVForm } from "@eavfw/forms";
import { ResolveFeature } from "../..";
import { mergeDeep } from "@eavfw/utils";
import { relative } from "path";

type DrawerType = Required<DrawerProps>["type"];

export type WorkflowState = {
    status: "Failed" |"Succeded",
    failedReason?: string;
    body:any,
    events: Array<{
        eventType: "action_completed" | "workflow_finished", jobId: string, actionKey: string
    }>,
    triggers: {
        [key: string]: {
            time: string,
            body: any
            }
    },
    actions: {
        [key: string]: {
            type: string,
            body?: {
                values: any,
                messages: any
            }

        }
    }
};


export type IWizardState = {
    tabName?: string;
    wizard?: WizardsDefinition;
    expressions?: any;
    messages?: IWizardMessages;
    isTransitioning?: boolean;
    transition?: Promise<WorkflowState>;
    values?: any;
}
export type IWizardAction =
    { action: "setTab", tabName: string } |
    { action: "setWizard", wizard?: WizardsDefinition } |
//    { action: "updateExpressions", result: any, values: any } |
    { action: "moveNext" } |
    { action: "setMessages", messages: IWizardMessages } |
    { action: "setTransition", transition: boolean } |
    { action: "updateMessage", messageKey: string, message: string } |
    { action: "setValues", values: any, expressionsProvider: (d: any) => any, merge?: boolean };



const WizardContext = createContext<[IWizardState, React.Dispatch<IWizardAction>] | undefined>(undefined);

const wizardReducer: Reducer<IWizardState, IWizardAction> = (state, action) => {
    switch (action.action) {
        case "setTab": return {
            ...state,
            tabName: action.tabName
        }
        case "setWizard": return {
            ...state,
            wizard: action.wizard,
            tabName: Object.keys(action.wizard?.tabs ?? {})[0],

        }
        //case "updateExpressions": return {
        //    ...state,
        //    values: action.values,
        //    expressions: action.result
        //}
        case "setMessages": return {
            ...state,
            messages: action.messages
        }
        case "setValues":
            let values = action.merge === true ? mergeDeep(state.values, action.values) : action.values;
            return {
                ...state,
                values,
                expressions: action.expressionsProvider(values),
            };
        case "updateMessage":
            state.messages![action.messageKey].message = action.message;
            return { ...state };
        case "setTransition":
            if (state.messages?.["TransitionIn"] && action.transition === false) {
                delete state.messages!["TransitionIn"];
            }
            return {
            ...state,
            isTransitioning: action.transition
        }
        case "moveNext":

            const expressionResults = state.expressions;
            console.log("useWizardExpressionsProvider movenext", expressionResults);
            const wizard = state.wizard!;
            const selectedTab = state.tabName!;

            let keys = Object.entries(wizard?.tabs ?? {})
                .filter(([key, value]) => typeof value.visible === "undefined" || (typeof value.visible === "boolean" && value.visible) || (typeof value.visible === "string" && expressionResults[value.visible]))
                .map(kv => kv[0]);

            let nextTab = keys[keys.indexOf(selectedTab) + 1];
            let transitionIn = wizard.tabs[nextTab].onTransitionIn;
           

            if (nextTab) {
                return {
                    ...state,
                    messages: transitionIn?.message ? { "TransitionIn": { intent: "info", message: "Working.", title : "Moving Next", ... (transitionIn.message as Partial<IWizardMessage>) } } : {},
                    tabName: nextTab,
                    isTransitioning: transitionIn ? true : false,
                    transition : transitionIn ? new Promise(async (resolve, reject) => {
                        if (transitionIn) {


                            let rsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${transitionIn.workflow}/runs`, {
                                method: "POST",
                                body: JSON.stringify(state.values),
                                credentials: "include"
                            });

                            let id = await rsp.json().then(x => x.id);

                            let completed = false;

                            while (!completed) {
                                let statusRsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${transitionIn.workflow}/runs/${id}/status`, {

                                    credentials: "include"
                                });

                                let status = await statusRsp.json();
                                completed = status.completed;

                                await new Promise((resolve) => setTimeout(resolve, 5000));
                            }

                            let stateRsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${transitionIn.workflow}/runs/${id}`, {

                                credentials: "include"
                            });

                            let result = await stateRsp.json() as WorkflowState;
                            console.log("jobstate", result);


                            if (rsp.ok) {
                                resolve(result);
                            }
                            else {
                                reject();
                            }

                        }

                    }) : undefined

                }
            }


            return state;


    }
}
export const WizardReducer: React.FC<{ wizard?: WizardsDefinition, data: any }> = ({ children, wizard, data }) => {

    const onFormValuesChange = ResolveFeature("WizardExpressionsProvider");
    const r = useReducer(wizardReducer, {
        expressions: onFormValuesChange(data)
    });
    const [_, { onChange }] = useEAVForm(x => undefined);
    /*
     * When data is updated, we set the internal data.
     */
    useEffect(() => { r[1]({ action: "setValues", expressionsProvider: onFormValuesChange, values: data }) }, [data]);

    /*
     * When the wizard model is changed, reset to first tab. 
     */
    useEffect(() => { r[1]({ action: "setWizard", wizard: wizard }) }, [wizard]);

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
                                mergeDeep(props, result.body);
                            });
                        }

                        if (action.body?.messages) {
                            dispatch({ action: "setMessages", messages: action.body?.messages });

                        }

                    }
                }
                onChange(props => {
                    mergeDeep(props, result.body);
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

    return (<WizardContext.Provider value={r}>

        {children}

    </WizardContext.Provider>)
}
export const WizardProvider: React.FC<{ wizard?: WizardsDefinition }> = ({ children, wizard }) => {


    const [defaultdata, setDefaultData] = useState(() => ({}));
   

    return (
        <EAVForm defaultData={defaultdata} onChange={(data, ctx) => {
            console.log("WziardData", data, ctx);
            setDefaultData(data); 
        }}><WizardReducer data={defaultdata} wizard={wizard }>
                {children}
            </WizardReducer>
          
        </EAVForm>

    )
}

export const useWizard = () => {

    const [state, dispatch] = useContext(WizardContext)!;
    let [values, { onChange }] = useEAVForm(x => x.formValues);

    const moveNext = async () => {
        const wizard = state.wizard;
        const tabName = state.tabName!;

        let transition = wizard?.tabs[tabName].onTransitionOut;
        if (transition) {

            dispatch({ action: "setTransition", transition: true });

            let rsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${transition.workflow}/runs`, {
                method: "POST",
                body: JSON.stringify(values),
                credentials: "include"
            });

            let id = await rsp.json().then(x => x.id);

            let completed = false;

            while (!completed) {
                let statusRsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${transition.workflow}/runs/${id}/status`, {

                    credentials: "include"
                });

                let status = await statusRsp.json();
                completed = status.completed;

                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            let stateRsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${transition.workflow}/runs/${id}`, {

                credentials: "include"
            });

            let result = await stateRsp.json() as WorkflowState;
            console.log("jobstate", result);

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
                        onChange((props, ctx) => {
                            values = mergeDeep(props, action.body?.values);
                        });
                    }

                }
            }

            /**
             * To allow the  <WizardProvider /> to get the state updated from onChange above
             * and in to next render loop, this is pushed to execution thread after the 
             * current render loop.
             * 
             * Alternative we could store a promise on state similar to transitionIn.
             * */
            setTimeout(() => {
                dispatch({ action: "moveNext" });

                for (let action of Object.values(result.actions)) {
                    if (action.type === "UpdateWizardContext") {

                        if (action.body?.messages) {
                            dispatch({ action: "setMessages", messages: action.body?.messages });

                        }
                    }
                }
            },0);
        } else {
            dispatch({ action: "moveNext" });
        }


    };


    let actions = {
        startTransitioning: () => dispatch({ action: "setTransition", transition: true }),
        endTransition: () => dispatch({ action: "setTransition", transition: false }),
        moveNext: moveNext,
        setMessages: (messages: IWizardMessages) => dispatch({ action: "setMessages", messages }),
        setSelectedTab: (tabName: string) => dispatch({ action: "setTab", tabName: tabName })
    };
    return [state, actions] as [IWizardState, typeof actions];
}
export const useWizardTab = () => {
    const [state, dispatch] = useContext(WizardContext)!;

    return state.tabName;
}


export const WizardDrawer: React.FC<{ close: () => void }> = ({ close }) => {

    const stack = useStackStyles();

    //  const [selectedTab, setSelectedTab] = useState(Object.keys(wizard?.tabs ?? {})[0]);
    //const selectedTab = useWizardTab() ?? Object.keys(wizard?.tabs ?? {})[0];
    const [{ tabName, wizard, messages = {}, isTransitioning }, { setSelectedTab, moveNext, setMessages, startTransitioning, endTransition }] = useWizard();
   
    const [detailedError, setDetailedError] = useState<string>();
    if (!tabName)
        return null;

    const onTabSelect: SelectTabEventHandler = (event, data) => {
        console.log("selected tab", data);
        setSelectedTab(data.value as string);
    };

    const DefaultNextButton = () => <Button disabled={isTransitioning} onClick={moveNext}>Next</Button>;

    return (

        <Drawer position="end" size="large"
            type="overlay"
            separator
            open={typeof wizard !== "undefined"}
            onOpenChange={(_, { open }) => close()}
        >
            <ProgressBar shape="square" thickness="large" style={{ visibility: isTransitioning ? "visible" : "hidden" }} />
            <DrawerHeader>
                <DrawerHeaderTitle
                    action={
                        <Button
                            appearance="subtle"
                            aria-label="Close"
                            icon={<Dismiss24Regular />}
                            onClick={close}
                        />
                    }
                >
                    {wizard?.title}
                </DrawerHeaderTitle>
            </DrawerHeader>
            <DrawerBody>
                {detailedError && <div dangerouslySetInnerHTML={{ __html: detailedError }}></div>}
                <div className={classNames(stack.root, stack.verticalFill)}>
                    
                    <WizardTabsComponent tabs={wizard?.tabs} className={classNames(stack.itemGrow)} onTabSelect={onTabSelect} selectedTab={tabName} />

                    {Object.entries(messages).map(([k, m]) => {
                        return (
                            <MessageBar key={k} shape="square" intent={m.intent}>
                                <MessageBarBody>
                                    <MessageBarTitle>{m.title}</MessageBarTitle>
                                    {m.message}
                                </MessageBarBody>
                                {m.detailedMessage && < MessageBarActions
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
                    })}

                    <Divider className={classNames(stack.itemShrink)} />

                    <div className={classNames(stack.root, stack.horizontal)} style={{ justifyContent: "end", "margin": "10px" }}>
                        <DefaultNextButton />
                    </div>
                </div>
            </DrawerBody>
        </Drawer>

    )
}