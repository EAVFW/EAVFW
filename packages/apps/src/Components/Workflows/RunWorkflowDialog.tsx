

import { useSWRFetch } from "@eavfw/manifest";
import {
    Button,
    Dialog, DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Spinner
} from "@fluentui/react-components";
import { useBoolean } from "@fluentui/react-hooks";
import { Form } from "@rjsf/fluentui-rc";
import type DefaultForm from "@rjsf/core"
import { WidgetRegister } from "../Forms/AutoForm/ControlsComponent";
import { React9FieldTemplate } from "../Forms/AutoForm/Templates/React9FieldTemplate";
import { React9BaseInputTemplate } from "../Forms/AutoForm/Widgets/BaseInputTemplate";
import validator from '@rjsf/validator-ajv8';
import { RegistereRibbonButton, useRibbon } from "../Ribbon";
import { useAppInfo } from "../../useAppInfo";
import { useModelDrivenViewContext } from "../Views";
import { useModelDrivenApp } from "../../useModelDrivenApp";
import { createRef, useEffect, useState } from "react";
import { WorkflowState } from "@eavfw/utils";
import { useFormChangeHandlerProvider } from "../Forms";
export type WorkFlowDialogProps = {
    ribbonkey: string,
    text?: string,
    title?: string,
    iconProps?: { iconName?: string }
    workflow: string;

}
export const WorkFlowDialog = ({ ribbonkey, ...props }: WorkFlowDialogProps) => {

    const { registerButton, events } = useRibbon();
    const { currentEntityName, currentRecordId } = useAppInfo();

    const { mutate:mutateView } = useModelDrivenViewContext();
    const { mutate: mutateForm } = useFormChangeHandlerProvider();
    const mutate = () => { mutateView(); mutateForm(); }
    const app = useModelDrivenApp();
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
    const [isLoading, { toggle: startLoading }] = useBoolean(false);
    const [isValid, setIsValid] = useState(false);
    const { data, error } = useSWRFetch(`/workflows/${props.workflow}/metadata`, !hideDialog);

    const [payload, setPayload] = useState({} as any);

    registerButton({
        key: ribbonkey,
        text: props.text ?? "Sync RankedIn",
        iconProps: props.iconProps ?? { iconName: 'Send' },
        title: props.title ?? props.text ?? "Sync RankedIn",
        disabled: false,
        onClick: () => {


            toggleHideDialog();

           
          

        }
    });

    const onSubmit = () => {

    }

    const formRef = createRef<DefaultForm>();
    useEffect(() => {
        console.log("Form Is Valid?", [!!formRef.current && formRef.current.validateForm()]);
            setIsValid(!!formRef.current && formRef.current.validateForm());

    }, [payload, hideDialog, formRef.current, data])


    return (
        <Dialog open={!hideDialog}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>{props.title}</DialogTitle>
                    <DialogContent>
                        {data && <Form ref={formRef} formData={payload} onChange={(d, i) => setPayload(d.formData)} idPrefix="workflow" widgets={WidgetRegister} validator={validator} templates={{ BaseInputTemplate: React9BaseInputTemplate, FieldTemplate: React9FieldTemplate, }} {...data} ><></></Form>}
                    </DialogContent>
                    <DialogActions fluid>
                        <Button
                            appearance="primary"
                            disabled={!isValid || isLoading}
                            onClick={async () => {
                                startLoading();
                                let rsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${app.getEntity(currentEntityName).collectionSchemaName}/records/${currentRecordId}/workflows/${props.workflow}/runs`, {
                                    method: "POST",
                                    body: JSON.stringify(payload),
                                    credentials: "include"
                                });
                                let id = await rsp.json().then(x => x.id);

                                let completed = false;

                                while (!completed) {
                                    let statusRsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${props.workflow}/runs/${id}/status`, {
                                        credentials: "include"
                                    });

                                    let status = await statusRsp.json();
                                    completed = status.completed;

                                   
                                    await new Promise((resolve) => setTimeout(resolve, 1000));


                                }

                                let stateRsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows/${props.workflow}/runs/${id}`, {
                                    //headers: {
                                    //    'traceparent': `00-${spanContext.traceId}-${spanContext.spanId}-0${spanContext.traceFlags}`
                                    //},
                                    credentials: "include"
                                });

                                let result = await stateRsp.json() as WorkflowState;

                                if (result.status.toLowerCase() === "failed") {

                                    return;
                                }
                                 

                                mutate();
                                toggleHideDialog();
                            }}>
                            {isLoading || error ? <Spinner size="small"  /> : 'Start'}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    )
}

const defaultProps = {
    text: "Run Workflow", title: "Run Workflow", iconProps: { iconName: "Send" }
};
export const RegisterWorkflowRibbonButton = (ribbonkey: string, propsDefaults: Omit<WorkFlowDialogProps, "ribbonkey">) => RegistereRibbonButton(ribbonkey, ({ key, ...props }) => {

    const appliedProps = { ...defaultProps, ...propsDefaults, ...props };
    return <WorkFlowDialog key={key} ribbonkey={key} {...appliedProps} />
});