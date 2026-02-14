/**
 * Represents the final state of a completed workflow run, including its
 * triggers, actions, and any emitted events.
 *
 * @see {@link runWorkflow}
 */
export type WorkflowState = {
  status: 'Failed' | 'Succeded';
  failedReason?: string;
  body: any;
  events: Array<{
    eventType: 'action_completed' | 'workflow_finished';
    jobId: string;
    actionKey: string;
    status: 'Failed' | string;
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

/**
 * Triggers an EAVFW workflow and polls until it completes. Optionally scoped
 * to a specific entity record.
 *
 * @param workflowNameOrId - The workflow name or identifier.
 * @param trigger - The trigger name to invoke in the workflow.
 * @param values - Payload values sent as the trigger body.
 * @param options - Optional configuration for the run.
 * @param options.currentEntityCollectionSchemaName - When provided, the
 *   workflow is run in the context of this entity's collection.
 * @param options.currentRecordId - The record identifier to scope the run to.
 * @param options.refreshInterval - Polling interval in milliseconds
 *   (default `5000`).
 * @param options.onStatusUpdated - Callback invoked after each poll with the
 *   latest status payload.
 * @param options.fullStatusPayload - When `true`, fetches the full status
 *   object instead of the summary endpoint.
 * @returns An object containing the final {@link WorkflowState} (`result`)
 *   and the initial HTTP response (`rsp`).
 *
 * @example
 * ```ts
 * const { result } = await runWorkflow('approve-entity', 'manual', {
 *   entityId: '123',
 * });
 * if (result.status === 'Succeded') {
 *   console.log('Workflow completed successfully');
 * }
 * ```
 */
export const runWorkflow = async (
  workflowNameOrId: string,
  trigger: string,
  values: any,
  options?: {
    currentEntityCollectionSchemaName?: string;
    currentRecordId?: string;
    refreshInterval?: number;
    onStatusUpdated?: (status: any) => void;
    fullStatusPayload?: boolean;
  },
) => {
  const endpoint = options?.currentEntityCollectionSchemaName
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${options?.currentEntityCollectionSchemaName}/records/${options?.currentRecordId}/workflows/${workflowNameOrId}/runs`
    : `${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${workflowNameOrId}/runs`;

  let rsp = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({ trigger: trigger, payload: values }),
    credentials: 'include',
    //headers: {
    //    'traceparent': `00-${spanContext.traceId}-${spanContext.spanId}-0${spanContext.traceFlags}`
    //}
  });

  let id = await rsp.json().then((x) => x.id);

  let completed = false;

  while (rsp.ok && !completed) {
    let statusRsp = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${workflowNameOrId}/runs/${id}${options?.fullStatusPayload ? '' : '/status'}`,
      {
        //headers: {
        //    'traceparent': `00-${spanContext.traceId}-${spanContext.spanId}-0${spanContext.traceFlags}`
        //},
        credentials: 'include',
      },
    );

    let status = await statusRsp.json();
    completed =
      status.completed || status?.events?.some((evt: any) => evt.eventType === 'workflow_finished');
    if (options?.onStatusUpdated) options.onStatusUpdated(status);
    await new Promise((resolve) => setTimeout(resolve, options?.refreshInterval ?? 5000));
  }

  let stateRsp = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${workflowNameOrId}/runs/${id}`,
    {
      //headers: {
      //    'traceparent': `00-${spanContext.traceId}-${spanContext.spanId}-0${spanContext.traceFlags}`
      //},
      credentials: 'include',
    },
  );

  let result = (await stateRsp.json()) as WorkflowState;
  return { result, rsp };
};
