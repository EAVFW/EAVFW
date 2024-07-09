

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
import { WorkflowState, runWorkflow } from "@eavfw/utils";
import { useFormChangeHandlerProvider } from "../Forms";
import { useSelectionContext } from "../Selection";
import { JSONSchema7 } from "json-schema";

export type WorkFlowDialogProps = {
    ribbonkey: string,
    text?: string,
    title?: string,
    iconProps?: { iconName?: string }
    workflow?: string;

    disabledHook?: () => boolean;

}
type workflowmetadata = {
    schema: JSONSchema7,
    uiSchema:any
}
export const WorkFlowDialog = ({ ribbonkey, workflow, disabledHook = () => false, ...props }: WorkFlowDialogProps) => {

    if (!workflow) throw new Error("Workflow is required");
   


    const { registerButton, events } = useRibbon();
    const app = useModelDrivenApp();
    const { currentEntityName, currentRecordId } = useAppInfo();
    const currentEntityCollectionSchemaName = app.getEntity(currentEntityName).collectionSchemaName;
   

    const { mutate:mutateView } = useModelDrivenViewContext();
    const { mutate: mutateForm } = useFormChangeHandlerProvider();
    const mutate = () => { mutateView(); mutateForm(); }
   
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
    const [isLoading, { toggle: startLoading }] = useBoolean(false);
    const [isValid, setIsValid] = useState(false);
    const { data: rjsfProps, error, isLoading: isLoadingMetadata } = useSWRFetch<workflowmetadata>(`/workflows/${workflow}/metadata`, !hideDialog);

    const [payload, setPayload] = useState({} as any);

    const { selection, selectionDetails } = useSelectionContext();

    const disabled = disabledHook();


    registerButton({
        key: ribbonkey,
        text: props.text ?? "Sync RankedIn",
        iconProps: props.iconProps ?? { iconName: 'Send' },
        title: props.title ?? props.text ?? "Sync RankedIn",
        disabled: disabled ,
        onClick: () => {           
            toggleHideDialog(); 
        }
    }, [disabled]);

    useEffect(() => {

        if (rjsfProps && selection.count === 1) {
            const props = rjsfProps?.schema?.properties ?? {};
            setPayload(Object.fromEntries(Object.entries({ ...selection.getSelection()[0] }).filter(([p, v]) => p in props)));
        }

    }, [rjsfProps, selection.count])

    const onSubmit = () => {

    }

    const formRef = createRef<DefaultForm>();
    //useEffect(() => {
    //    console.log("Form Is Valid?", [!!formRef.current && formRef.current.validateForm()]);
    //        setIsValid(!!formRef.current && formRef.current.validateForm());

    //}, [payload, hideDialog, formRef.current, rjsfProps])


    return (
        <Dialog open={!hideDialog}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>{props.title}</DialogTitle>
                    <DialogContent>
                        {rjsfProps && <Form ref={formRef} formData={payload} onChange={(d, i) => { setPayload(d.formData); setIsValid(!!formRef.current && formRef.current.validateForm()); }} idPrefix="workflow" widgets={WidgetRegister} validator={validator} templates={{ BaseInputTemplate: React9BaseInputTemplate, FieldTemplate: React9FieldTemplate, }} {...rjsfProps} ><></></Form>}
                    </DialogContent>
                    <DialogActions fluid>
                        <Button
                            appearance="primary"
                            disabled={!isValid || isLoading}
                            onClick={async () => {
                                startLoading();

                                let { result, rsp } = await runWorkflow(workflow, "Manual",
                                    {
                                        ...payload,
                                        selection: selection.getSelection().map(x => ({ id: x.id, ["$type"]: x.entityName }))
                                    },
                                    { currentEntityCollectionSchemaName, currentRecordId });
                                 

                                if (result.status.toLowerCase() === "failed") {

                                    return;
                                }
                                 

                                mutate();
                                toggleHideDialog();
                                //TODO - mutate is not implemented properly, dirty fix now
                                location.reload();
                            }}>
                            {isLoading || error || isLoadingMetadata ? <Spinner size="small"  /> : 'Start'}
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
export const RegisterWorkflowRibbonButton = (ribbonkey: string, propsDefaults: Omit<WorkFlowDialogProps, "ribbonkey">={}) => RegistereRibbonButton(ribbonkey, ({ key, ...props }) => {

    const appliedProps = { ...defaultProps, ...propsDefaults, ...props };
    return <WorkFlowDialog key={key} ribbonkey={key} {...appliedProps} />
});