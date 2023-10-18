
import { createContext, useEffect, useReducer } from "react";
import { ResolveFeature } from "./../../FeatureFlags";
import { IWizardAction } from "./IWizardAction";
import { IWizardState } from "./IWizardState";
import { Reducer } from "react";
import { WorkflowState } from "./WorkflowState";
import { mergeDeep } from "@eavfw/utils";
import { IWizardMessage } from "@eavfw/manifest";
import { useEAVForm } from "@eavfw/forms";
import { WizardContext } from "./WizardContext";





const wizardReducer: Reducer<IWizardState, IWizardAction> = (state, action) => {
    switch (action.action) {
        case "setTab": return {
            ...state,
            tabName: action.tabName
        }
        case "setWizard": return {
            ...state,
            wizard: action.wizard?.[1],
            wizardKey: action.wizard?.[0],
            tabName: Object.keys(action.wizard?.[1]?.tabs ?? {})[0],

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
                    messages: transitionIn?.message ? { "TransitionIn": { intent: "info", message: "Working.", title: "Moving Next", ... (transitionIn.message as Partial<IWizardMessage>) } } : {},
                    tabName: nextTab,
                    isTransitioning: transitionIn ? true : false,
                    transition: transitionIn ? new Promise(async (resolve, reject) => {
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

export const WizardReducer: React.FC<{ data: any }> = ({ children, data }) => {

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