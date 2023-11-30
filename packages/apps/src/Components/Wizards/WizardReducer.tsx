
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

import { trace, context, diag, DiagConsoleLogger, DiagLogLevel, SpanKind, propagation } from '@opentelemetry/api';




const wizardReducer: Reducer<IWizardState, IWizardAction> = (state, action) => {
    console.log('WizardReducer: ' + action.action, [state, action]);
    switch (action.action) {
        case "setTab": return {
            ...state,
            tabName: action.tabName
        }
        case "setWizard":
            {
                if (state.spanResolve) {
                    state.spanResolve();
                }
                const wizard = action.wizard?.[1];
                if (!wizard)
                    return {
                        expressions: ResolveFeature("WizardExpressionsProvider")({})
                    };

                // Get the active trace provider  
                const tracerProvider = trace.getTracerProvider();

                // Use the tracer provider to get a tracer  
                const tracer = tracerProvider.getTracer('eavfw-wizard');


                const wizardPromise = new Promise<any>((resolve, reject) => {
                    state.spanResolve = resolve;
                    state.spanReject = reject;
                });
 
                const parentContext = context.active();
                const span = tracer.startSpan('eavfw-wizard-start', undefined, parentContext);
                const contextWithSpanSet = trace.setSpan(parentContext, span);

                // context.with(contextWithSpanSet, () => {
                //    await wizardPromise;
                //}, undefined, span);

                //const monitorMe = async () => {
                //    await tracer.startActiveSpan("eavfw-wizard-start", async (span) => {
                //        try {
                //            state.span = span;
                //            span.setAttribute('wizard', wizard[0]);
                //            const fooResult = await wizardPromise; // this or some inner function my create child spans
                //           // span.setAttribute("fooResult", fooResult);
                //         //   const barResult = await bar(); // this or some inner function my create child spans
                //         //   span.setAttribute("barResult", barResult);
                //            // ...
                //        } catch (e) {
                //            //@ts-ignore
                //            span.recordException(e);
                //        } finally {
                //            span.end();
                //        }
                //    });
                //}
                //monitorMe();

               // console.log('WizardReducer', [JSON.stringify(rootSpan.spanContext()), trace.getSpan(context.active())?.spanContext()])

                // const activeContext = context.active();


                // Assume "input" is an object with 'traceparent' & 'tracestate' keys
                //  const input = {};

                // Extracts the 'traceparent' and 'tracestate' data into a context object.
                //
                // You can then treat this context as the active context for your
                // traces.
                let activeContext = context.active(); // propagation.extract(context.active(), input);

                // let tracer = trace.getTracer('app-name');

                //let span = tracer.startSpan(
                //    'eavfw-wizard-start',
                //    {
                //        attributes: {},
                //    },
                //    context.active(),
                //);

                // Set the created span as active in the deserialized context.
               // trace.setSpan(activeContext, rootSpan);

                // Use the tracer to create a new span  
                // const span = tracer.startSpan('eavfw-wizard-start', {}, context.active());



                // trace.setSpan(activeContext, span),

                //   const newContext = context.with();  
                console.log("WizardReducer", [parentContext, activeContext, contextWithSpanSet, span, state.span, trace.getSpan(activeContext), trace.getSpan(activeContext)?.spanContext(), trace.getActiveSpan(), trace.getActiveSpan()?.spanContext()!]);
                let tabName = Object.keys(wizard?.tabs ?? {})[0];
                let transitionIn = wizard.tabs[tabName].onTransitionIn;
                return {
                    ...state,
                    ...getTransitionProps(transitionIn, action.action, state),
                    tracer: tracer,
                    otelContext: contextWithSpanSet,
                    wizard: wizard,
                    wizardKey: action.wizard?.[0],
                    tabName: tabName

                }
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
                expressions: (action.expressionsProvider ?? ResolveFeature("WizardExpressionsProvider"))(values),
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
            return context.with(state.otelContext!, () => {

                const spanContext = trace.getSpan(context.active())?.spanContext()!;
                console.log("WizardReducer moveNext", [state.otelContext, context.active(), trace.getSpan(context.active()), `00-${spanContext.traceId}-${spanContext.spanId}-0${spanContext.traceFlags}`]);

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
                        ...getTransitionProps(transitionIn, action.trigger, state),
                        tabName: nextTab,
                        

                    }
                } else {
                    return {

                    }
                }


                 
            });


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

function getTransitionProps(transitionIn: { message: IWizardMessage; workflow: string; } | undefined, trigger: string, state: IWizardState) {
    return {
        messages: getTransitionMessages(transitionIn),
        isTransitioning: transitionIn ? true : false,
        transition: getTransitionWorker(transitionIn, trigger, state)
    };
}

function getTransitionWorker(transitionIn: { message: IWizardMessage; workflow: string; } | undefined, trigger:string, state: IWizardState) {
    return transitionIn ? new Promise(async (resolve, reject) => {
        if (transitionIn) {


            let rsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${transitionIn.workflow}/runs`, {
                method: "POST",
                body: JSON.stringify({ trigger: trigger, values: state.values }),
                credentials: "include",
                //headers: {
                //    'traceparent': `00-${spanContext.traceId}-${spanContext.spanId}-0${spanContext.traceFlags}`
                //}
            });

            let id = await rsp.json().then(x => x.id);

            let completed = false;

            while (!completed) {
                let statusRsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${transitionIn.workflow}/runs/${id}/status`, {
                    //headers: {
                    //    'traceparent': `00-${spanContext.traceId}-${spanContext.spanId}-0${spanContext.traceFlags}`
                    //},
                    credentials: "include"
                });

                let status = await statusRsp.json();
                completed = status.completed;

                await new Promise((resolve) => setTimeout(resolve, 5000));
            }

            let stateRsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${transitionIn.workflow}/runs/${id}`, {
                //headers: {
                //    'traceparent': `00-${spanContext.traceId}-${spanContext.spanId}-0${spanContext.traceFlags}`
                //},
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

    }) : undefined;
}

function getTransitionMessages(transitionIn: { message: IWizardMessage; workflow: string; } | undefined) {
    return transitionIn?.message ? { "TransitionIn": { intent: "info", message: "Working.", title: "Moving Next", ...(transitionIn.message as Partial<IWizardMessage>) } } :
        transitionIn ? { "TransitionIn": { intent: "info", message: "Working.", title: "Moving Next" } } : { };
}
