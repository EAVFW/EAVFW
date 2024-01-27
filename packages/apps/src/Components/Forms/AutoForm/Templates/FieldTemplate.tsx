import React, { createContext, useContext, useMemo, useState } from "react";
import { FieldTemplateProps } from "@rjsf/utils";
import { Callout, FontWeights, getTheme, IButtonStyles, IconButton, IIconProps, IStackStyles, IStackTokens, ITheme, Label, mergeStyleSets, Stack, Text, ThemeContext } from "@fluentui/react";
import { List } from "@fluentui/react";
import { useExpressionParser } from "@eavfw/expressions";
import { JSONSchema7 } from "json-schema";

import { useBoolean, useId } from "@fluentui/react-hooks";
import { warn } from "console";
import { useWarnings, WarningContextProvider } from "./WarningContext";
import { EAVFWLabel } from "./EAVFWLabel";
import { Field } from "@fluentui/react-components";




export const FieldTemplate = ({
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
    console.log("Field Template:", [id, displayLabel,rawErrors, rawHelp, rawDescription, classNames, hidden, description]);


    const parentwarnings = useWarnings();
    const warnings = useMemo(() => {


        const resultWarnings = schema.type === "object" ? parentwarnings.map(p => ({ warning: p.warning, logicalName:id+"_"+ p.logicalName })) : parentwarnings.filter(w => id == w.logicalName);
        console.log("Filtering Warnings:", [id, schema.type,schema, parentwarnings, resultWarnings]);
        return resultWarnings;
    }, [parentwarnings]);


    // TODO: do this better by not returning the form-group class from master.
    classNames = "ms-Grid-col ms-sm12 " + classNames?.replace("form-group", "");
    return (
        <WarningContextProvider value={warnings}>
            <div
            className={classNames}
                style={{ marginBottom: schema.type === "object" ? 0 : 15, display: hidden ? "none" : undefined }}>

                <Field aria-disabled={disabled}  label={displayLabel ? ({ children: (_:any, p:any) => <EAVFWLabel id={id} disabled={disabled} required={required} label={label ?? schema.title} description={rawDescription} /> }) : undefined}>
                    {children}
                </Field>
            {/*{rawDescription && <Text>{rawDescription}</Text>}*/}
            {rawErrors.length > 0 && <List items={rawErrors} />}
            {rawHelp && <Text id={id}>{rawHelp}</Text>}
            </div>
        </WarningContextProvider>
    );
};



export default FieldTemplate;