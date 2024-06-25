import { useContext, useMemo } from "react";
import { FieldTemplateProps } from "@rjsf/utils";
import { useWarnings, WarningContextProvider } from "./WarningContext";
import {  Field, Text} from "@fluentui/react-components" 
import { List } from "@fluentui/react";
import { EAVFWLabel } from "./EAVFWLabel";

export const React9FieldTemplate = ({
    id,
    children,
    rawErrors = [],
    rawHelp,
    rawDescription,
    classNames,
    hidden,
    description,
    displayLabel,
    required, label, schema, disabled,
    formContext,
}: FieldTemplateProps) => {
    console.log("Field Template:", [id, displayLabel, rawErrors, rawHelp, rawDescription, classNames, hidden, description]);


    const parentwarnings = useWarnings();
    const warnings = useMemo(() => {


        const resultWarnings = schema.type === "object" ? parentwarnings.map(p => ({ warning: p.warning, logicalName: id + "_" + p.logicalName })) : parentwarnings.filter(w => id == w.logicalName);
        console.log("Filtering Warnings:", [id, schema.type, schema, parentwarnings, resultWarnings]);
        return resultWarnings;
    }, [parentwarnings]);


    // TODO: do this better by not returning the form-group class from master.
    classNames = "ms-Grid-col ms-sm12 " + classNames?.replace("form-group", "");
    return (
        <WarningContextProvider value={warnings}>
            <div
                className={classNames}
                style={{ marginBottom: schema.type ==="object" ? 0 :15, display: hidden ? "none" : undefined }}>


                <Field aria-disabled={disabled}  label={displayLabel ? <EAVFWLabel id={id} disabled={disabled} required={required} label={label ?? schema.title} description={rawDescription} /> : undefined}>
                    {children}
                </Field>
                {/*{rawDescription && <Text>{rawDescription}</Text>}*/}
                {rawErrors.length > 0 && <List items={rawErrors} />}
                {rawHelp && <Text id={id}>{rawHelp}</Text>}
            </div>
        </WarningContextProvider>
    );
};


