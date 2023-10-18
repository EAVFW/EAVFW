
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
