
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
        case "setWizard":

            if (!action.wizard)
                return {};

            return {
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
           


            if (nextTab) {
                let transitionIn = wizard.tabs[nextTab].onTransitionIn;

                return {
                    ...state,
                    messages: transitionIn?.message ? { "TransitionIn": { intent: "info", message: "Working.", title: "Moving Next", ... (transitionIn.message as Partial<IWizardMessage>) } } : {},
                    tabName: nextTab,
                    isTransitioning: transitionIn ? true : false,
                    transition: transitionIn ? new Promise(async (resolve, reject) => {
                        if (transitionIn) {


                            let rsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${transitionIn.workflow}/runs`, {
                                method: "POST",
                                body: JSON.stringify({ trigger: action.trigger, values: state.values }),
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
            } else {
                return {
                     
                    }
            }


            return state;


    }
}

export const WizardReducer: React.FC = ({ children }) => {

    const onFormValuesChange = ResolveFeature("WizardExpressionsProvider");

    
    const r = useReducer(wizardReducer, {
        expressions: onFormValuesChange({})
    });

    

    return (<WizardContext.Provider value={r}>

        {children}

    </WizardContext.Provider>)
}