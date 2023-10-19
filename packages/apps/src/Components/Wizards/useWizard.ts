import { useEAVForm } from "@eavfw/forms";
import { IWizardMessages, WizardsDefinition } from "@eavfw/manifest";
import { mergeDeep } from "@eavfw/utils";
import { useContext } from "react";
import { IWizardState } from "./IWizardState";
import { WizardContext } from "./WizardContext";
import { WorkflowState } from "./WorkflowState";



export const useWizard = () => {

    const [state, dispatch] = useContext(WizardContext)!;
    let [values, { onChange }] = useEAVForm(x => x.formValues, undefined,'useWizard');

    const moveNext = async (action:string) => {
        const wizard = state.wizard;
        const tabName = state.tabName!;

        let transition = wizard?.tabs[tabName].onTransitionOut;
        if (transition) {

            dispatch({ action: "setTransition", transition: true });

            let rsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${transition.workflow}/runs`, {
                method: "POST",
                body: JSON.stringify({ trigger: action, values }),
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
                dispatch({ action: "moveNext", trigger: action });

                for (let action of Object.values(result.actions)) {
                    if (action.type === "UpdateWizardContext") {

                        if (action.body?.messages) {
                            dispatch({ action: "setMessages", messages: action.body?.messages });

                        }
                    }
                }
            }, 0);
        } else {
            dispatch({ action: "moveNext", trigger: action });
        }


    };


    let actions = {
        closeWizard: () => dispatch({ action: "setWizard", wizard: undefined }),
        openWizard: (wizard: [string, WizardsDefinition]) => dispatch({ action: "setWizard", wizard }),
        startTransitioning: () => dispatch({ action: "setTransition", transition: true }),
        endTransition: () => dispatch({ action: "setTransition", transition: false }),
        moveNext: moveNext,
        setMessages: (messages: IWizardMessages) => dispatch({ action: "setMessages", messages }),
        setSelectedTab: (tabName: string) => dispatch({ action: "setTab", tabName: tabName })
    };
    return [state, actions] as [IWizardState, typeof actions];
}