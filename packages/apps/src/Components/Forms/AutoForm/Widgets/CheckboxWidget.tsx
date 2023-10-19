import React, { useCallback } from "react";
import { Checkbox } from "@fluentui/react";
import { WidgetProps } from "@rjsf/utils";
import { usePick } from "./usePick";
 
// Keys of ICheckboxProps from @fluentui/react
export const allowedProps = [
    "ariaDescribedBy",
    "ariaLabel",
    "ariaPositionInSet",
    "ariaSetSize",
    "boxSide",
    "checked",
    "checkmarkIconProps",
    "className",
    "componentRef",
    "defaultChecked",
    "defaultIndeterminate",
    "disabled",
    "indeterminate",
    "inputProps",
    "keytipProps",
    "label",
    "onChange",
    "onRenderLabel",
    "styles",
    "theme"
];

const CheckboxWidget = (props: WidgetProps) => {
    const {
        id,
        value,
        // required,
        disabled,
        readonly,
        label,
        schema,
        autofocus,
        onChange,
        onBlur,
        onFocus,
        options,
    } = props;

    const _onChange = useCallback(({ }, checked?: boolean): void => {
        onChange(checked);
    }, []);

    const _onBlur = useCallback(({ target: { value } }: React.FocusEvent<HTMLInputElement>) =>
        onBlur(id, value), [onblur]);
    const _onFocus = useCallback(({
        target: { value },
    }: React.FocusEvent<HTMLInputElement>) => onFocus(id, value), [onFocus]);

    const uiProps = usePick(options || {}, allowedProps);

    return (
        <>
            <Checkbox
                id={id}
                label={label || schema.title}
                disabled={disabled || readonly}
                autoFocus={autofocus}
                onBlur={_onBlur}
                onFocus={_onFocus}
                checked={typeof value === "undefined" ? false : value}
                onChange={_onChange}
                {...uiProps}
            />
        </>
    );
};

export default CheckboxWidget;