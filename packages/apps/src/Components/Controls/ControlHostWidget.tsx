import { FieldProps, ErrorSchema, FormValidation, FieldTemplateProps, UiSchema } from "@rjsf/utils";
import React, { Component, ComponentClass } from "react"
import { JSONSchema7 } from "json-schema";
import { Label, TextField } from "@fluentui/react";
import { AttributeDefinition, EntityDefinition, FormColumnDefinition } from "@eavfw/manifest";
import { Controls } from "./ControlRegister";
import { useModelDrivenApp } from "../../useModelDrivenApp";
import ChoicesControl from "./ChoicesControl/ChoicesControl";
import LookupControl from "./LookupControl/LookupControl";
import { EAVFWLabel } from "../Forms/AutoForm/Templates/FieldTemplate";


 
 



export type ControlHostWidgetProps = {
    schema: {
        "x-widget-props"?: {
            column: AttributeDefinition,
            field: FormColumnDefinition,
            entity: EntityDefinition,
            styles?: any,
            locale: string,
            formData: any,
            onRenderLabel?: any;
            extraErrors?: FormValidation;
        }
    } & JSONSchema7
} & FieldProps

export type ControlHostWidgetState = {
    label: string
}


export const ControlHostWidgetNew: React.FC<FieldTemplateProps> = (props) => {

    const app = useModelDrivenApp();

    const { extraErrors, formErrors } = props.formContext;
    const { schema, uiSchema, required, disabled, formData, rawDescription } = props;


    const { ["x-control"]: control } = schema as any;
    const { ["ui:props"]: { styles, onRenderLabel, entityName, fieldName, attributeName, formName } } = uiSchema!;
    console.log("ControlHostWidgetNew", [props, styles, onRenderLabel, control, Controls]);

    const column = app.getEntity(entityName).forms?.[formName]?.columns[fieldName];
    const label = props.schema.title!;


    const _onChange = (data: any, es?: ErrorSchema) => {
        try {
            console.group("ControlHostWidget")

            console.log(data);

            props.onChange(data);
        } finally {
            console.groupEnd();
        }
    }

    let localExtraErrors: Partial<FormValidation> = {};

    for (let extraErrorsKey in extraErrors) {
        if (extraErrorsKey.startsWith(fieldName.toLowerCase())) {
            localExtraErrors[extraErrorsKey.substr(extraErrorsKey.indexOf('.') + 1)] = extraErrors[extraErrorsKey];
        }
    }

    let errorMessage = formErrors[fieldName.toLowerCase().replace(' ', '')]?.__errors?.join(' ');

    //const LabelTemplate = () => column?.label === false ? null : (onRenderLabel?.(props) ??
    //    <Label required={required} disabled={disabled}>{label}</Label>);

    const LabelTemplate = () => column?.label === false ? null : <EAVFWLabel id={props.id} disabled={disabled} required={required} label={label ?? schema.title}  description={rawDescription ?? schema.description} />

    //@ts-ignore
    const widgetProps = props.schema["x-widget-props"]!;

    if (control && control in Controls) {
        const CustomControl = Controls[control];
        return (
            <>
                <LabelTemplate />
                <CustomControl value={formData} {...props}
                    onChange={_onChange} {...widgetProps} />
            </>
        )
    }

    if (control === "ChoicesControl")
        return (
            <>
                <LabelTemplate />
                <ChoicesControl value={props.formData} {...props as any}
                    onChange={_onChange} {...widgetProps} />
            </>
        );
    if (control === "PercentageControl") {
        console.log("percent", props.formData);
        return <>

            <LabelTemplate />
            <TextField styles={styles} value={`${props.formData ? ((parseFloat(props.formData)) * 100)?.toString() : 0}%`}
                readOnly={props.readonly} />
        </>
    }

    return <>

        <LabelTemplate />
        <LookupControl key={props.id} value={props.formData} {...props as any}
            onChange={_onChange} {...widgetProps} {...props.uiSchema}
            extraErrors={localExtraErrors} errorMessage={errorMessage} />
    </>


}

export default ControlHostWidgetNew as any as ComponentClass<FieldProps<any>, any>;
