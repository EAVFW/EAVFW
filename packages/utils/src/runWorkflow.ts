

export type WorkflowState = {
    status: "Failed" | "Succeded";
    failedReason?: string;
    body: any;
    events: Array<{
        eventType: "action_completed" | "workflow_finished"; jobId: string; actionKey: string;
    }>;
    triggers: {
        [key: string]: {
            time: string;
            body: any;
        };
    };
    actions: {
        [key: string]: {
            type: string;
            body?: {
                values: any;
                messages: any;
            };

        };
    };
};

export const runWorkflow = async (workflowNameOrId: string, trigger: string, values: any, options?: { currentEntityCollectionSchemaName?:string, currentRecordId?:string }) => {

    const endpoint = options?.currentEntityCollectionSchemaName ?
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${options?.currentEntityCollectionSchemaName}/records/${options?.currentRecordId}/workflows/${workflowNameOrId}/runs` :
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${workflowNameOrId}/runs`;

    let rsp = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ trigger: trigger, values: values }),
        credentials: "include",
        //headers: {
        //    'traceparent': `00-${spanContext.traceId}-${spanContext.spanId}-0${spanContext.traceFlags}`
        //}
    });

    let id = await rsp.json().then(x => x.id);

    let completed = false;

    while (rsp.ok && !completed) {
        let statusRsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${workflowNameOrId}/runs/${id}/status`, {
            //headers: {
            //    'traceparent': `00-${spanContext.traceId}-${spanContext.spanId}-0${spanContext.traceFlags}`
            //},
            credentials: "include"
        });

        let status = await statusRsp.json();
        completed = status.completed;

        await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    let stateRsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${workflowNameOrId}/runs/${id}`, {
        //headers: {
        //    'traceparent': `00-${spanContext.traceId}-${spanContext.spanId}-0${spanContext.traceFlags}`
        //},
        credentials: "include"
    });

    let result = await stateRsp.json() as WorkflowState;
    return { result , rsp}
}

