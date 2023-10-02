import React, { useCallback, useMemo } from "react";
import { TextField } from "@fluentui/react";
import { WidgetProps } from "@rjsf/utils";
import { usePick } from "./usePick";


// Keys of ITextFieldProps from @fluentui/react
const allowedProps = [
    "multiline",
    "resizable",
    "autoAdjustHeight",
    "underlined",
    "borderless",
    "label",
    "onRenderLabel",
    "description",
    "onRenderDescription",
    "prefix",
    "suffix",
    "onRenderPrefix",
    "onRenderSuffix",
    "iconProps",
    "defaultValue",
    "value",
    "disabled",
    "readOnly",
    "errorMessage",
    "onChange",
    "onNotifyValidationResult",
    "onGetErrorMessage",
    "deferredValidationTime",
    "className",
    "inputClassName",
    "ariaLabel",
    "validateOnFocusIn",
    "validateOnFocusOut",
    "validateOnLoad",
    "theme",
    "styles",
    "autoComplete",
    "mask",
    "maskChar",
    "maskFormat",
    "type",
    "list",
];

const TextWidget = ({
    id,
    placeholder,
    required,
    readonly,
    disabled,
    label,
    value,
    onChange,
    onBlur,
    onFocus,
    autofocus,
    options,
    schema,
    rawErrors,
}: WidgetProps) => {

    const _onChange = useCallback(({
        target: { value },
    }: React.ChangeEvent<HTMLInputElement>) =>
        onChange(value === "" ? options.emptyValue : value), []);

    const _onBlur = useCallback(({ target: { value } }: React.FocusEvent<HTMLInputElement>) =>
        onBlur(id, value), [onblur]);
    const _onFocus = useCallback(({
        target: { value },
    }: React.FocusEvent<HTMLInputElement>) => onFocus(id, value), [onFocus]);

    const uiProps = usePick(options.props ?? {}, allowedProps);
    const inputType = schema.type === 'string' ? 'text' : `${schema.type}`

    console.log("TextWidget", [id, placeholder, autofocus, required, disabled, readonly, inputType, value, rawErrors, uiProps]);

    return (
        <TextField
            id={id}
            placeholder={placeholder}
            autoFocus={autofocus}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            // TODO: once fluent-ui supports the name prop, we can add it back in here.
            // name={name}
            type={inputType as string}
            defaultValue={value || value === 0 ? value : ""}
           // value={value || value === 0 ? value : ""}
            onChange={_onChange as any}
            onBlur={_onBlur}
            onFocus={_onFocus}
            errorMessage={(rawErrors || []).join("\n")}
            {...uiProps}
        />
    );
};

export default TextWidget;