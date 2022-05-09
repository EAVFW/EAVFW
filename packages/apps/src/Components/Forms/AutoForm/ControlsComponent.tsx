


import React, { Fragment, PropsWithChildren, useContext, useMemo, useRef } from "react";
import { FieldTemplateProps, IChangeEvent, UiSchema,  FieldValidation, AjvError } from "@rjsf/core";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import Form from "@rjsf/fluent-ui";
import { mergeDeep } from "@eavfw/utils";
import {
    Callout,
    FontWeights,
    getTheme,
    IButtonStyles,
    Icon,
    IconButton,
    IDropdownProps,
    IIconProps,
    IIconStyles,
    IStackStyles,
    IStackTokens,
    IStyleFunction,
    ITextFieldProps,
    ITextFieldStyleProps,
    ITextFieldStyles,
    ITheme,
    Label,
    mergeStyleSets,
    Stack,
    ThemeContext
} from "@fluentui/react";
import { useBoolean, useId } from "@fluentui/react-hooks";


import { useChangeDetector } from "@eavfw/hooks";

import ControlHostWidget from "../../Controls/ControlHostWidget";
import SelectWidget from "../../Controls/SelectWidget";
import { OptionsFactory } from "./OptionsFactory";
import { ControlJsonSchemaObject } from "./ControlJsonSchema";
import { FormValidation } from "../FormValidation";
import { useModelDrivenApp } from "../../../useModelDrivenApp";

declare module '@rjsf/core' {
    interface WidgetProps {
    }
}

declare module 'json-schema' {
    export interface JSONSchema7 {
        'x-widget-props'?: {
            attributeName?: string,
            entityName?: string,
            fieldName?: string,
            formName?: string
        }
    }
}

export type ControlsComponentProps<T> = {
    onFormDataChange?: (formdata: T) => void;
    schema: ControlJsonSchemaObject;
    formData: T;
    locale: string;
    factory?: OptionsFactory;
    tabName?: string;
    columnName?: string;
    sectionName?: string;
    entityName: string;
    formContext?: any;
    extraErrors?: FormValidation;
}


const ControlsComponent =
    <T extends {}>(props1: PropsWithChildren<ControlsComponentProps<T>>) => {
        const {
            schema, onFormDataChange, formData, locale, factory, tabName, entityName, formContext
            , columnName,
            sectionName,
            extraErrors = {} as FormValidation
        } = props1;
        try {
            console.group("ControlsComponent: ");

            const renderId = useRef(new Date().toISOString());
            renderId.current = new Date().toISOString();
            useChangeDetector(`ControlsComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} schema`, schema, renderId);
            useChangeDetector(`ControlsComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} onFormDataChange`, onFormDataChange, renderId);
            useChangeDetector(`ControlsComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} formData`, formData, renderId);
            useChangeDetector(`ControlsComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} locale`, locale, renderId);
            useChangeDetector(`ControlsComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} factory`, factory, renderId);

            // const currentData = React.useRef(formData);
            let order = Object.keys(schema.properties);

            if (schema.dependencies) {
                 for (let dependant of Object.keys(schema.dependencies)) {
                    //dependant = has6thvacationweek
                    //
                    let depencies = schema.dependencies[dependant];
                    if (typeof depencies === "object" && !Array.isArray(depencies)) {
                        let oneOfs = depencies.oneOf;
                        if (Array.isArray(oneOfs)) {
                            for (let oneOf of oneOfs) {

                                if (typeof oneOf === "object") {
                                    let otherProps = Object.keys(oneOf.properties ?? {}).filter(x => x !== dependant);

                                    for (let otherProp of otherProps) {

                                        if (order.indexOf(otherProp) === -1) {
                                            order.splice(order.indexOf(dependant) + 1, 0, otherProp);
                                        }
                                    }
                                }
                            }
                        } 
                    } 
                }
            }

            const uiSChema = React.useMemo(() => ({ ...getUiSchema(schema, factory, formContext), "ui:order": order }), [schema, factory, formContext]);

            console.log("Generated UISchema:", [order,schema, uiSChema]);

            // const timerRef = React.useRef(0);
            const onChange = React.useCallback((e: Partial<IChangeEvent<T>>) => {
                console.group("OnChange", [e, formData, { ...e.formData }]);
                console.log(e.formData);
                console.log(formData);
                console.groupEnd();
                // currentData.current = e.formData!;

                //  window.clearTimeout(timerRef.current);
                //  timerRef.current = window.setTimeout(() => {
                onFormDataChange?.(e.formData!);
                // }, 500);
            }, [onFormDataChange]);
            const onBlur = (id: string, value: any) => {
                console.group("onBlur")
            };

            if (!process.browser)
                return <div>"loading"</div>

            let formErrors = {} as FormValidation;
            console.log("AutoForm: ControlsComponent: ExtraErrors", extraErrors);
            for (let extraErrorsKey in Object.keys(extraErrors)) {
                let keys = extraErrorsKey.split('.');
                if (keys[0] in formErrors) {

                    console.log("Adding", extraErrors[extraErrorsKey].__errors)
                    formErrors[keys[0]] = { __errors: formErrors?.[keys[0]]?.__errors.concat(extraErrors[extraErrorsKey].__errors) } as FieldValidation;
                    console.log("After", formErrors[keys[0]])
                } else {
                    console.log("Creating", extraErrors[extraErrorsKey].__errors)
                    formErrors[keys[0]] = extraErrors[extraErrorsKey];
                }
            }

            return (
                <div style={{ padding: 20 }} suppressHydrationWarning={true}>
                    <Form

                        schema={schema as JSONSchema7}
                        onChange={onChange}
                        formContext={{
                            ...(formContext ?? {}),
                            onFormDataChange: (data: any) => onChange({ formData: { ...formData, ...data } }), // onFormDataChange,                            
                            formData: formData,
                            extraErrors: extraErrors,
                            formErrors: formErrors
                        }}
                        idPrefix={entityName}
                        formData={formData}
                        fields={{ ControlHostWidget: ControlHostWidget }}
                        widgets={{ SelectWidget: SelectWidget }}
                        uiSchema={uiSChema}
                        transformErrors={transformErrors}
                        extraErrors={formErrors} // Even though we have to manually access and add the error for custom widget ourself through formContext, we have to set the error here too, to make thure the errors is added to the overview.
                    ><Fragment /></Form></div>
            );
        } finally {
            console.groupEnd();
        }
    }

export default ControlsComponent;

function hasCustomControl(obj: JSONSchema7Definition, type: "x-widget" | "x-field"): obj is JSONSchema7 & { "x-widget": string, "x-field": string } {
    return typeof obj === "object" && type in obj;
}

const readonlyStylesFunction: (outerProps: any, props: ITextFieldStyleProps) => Partial<ITextFieldStyles> = (outerProps, props) => {

    return {
        fieldGroup: {
            backgroundColor: props.disabled || outerProps.readOnly ? props.theme.palette.neutralLight : props.theme.palette.neutralLighterAlt,
            cursor: "default"

        }
    }
}

function getControl(obj: JSONSchema7Definition, type: "widget" | "field") {
    let t = 'x-' + type as "x-widget" | "x-field";
    if (hasCustomControl(obj, t)) {

        return obj[t]
    }
}

const theme = getTheme();
const iconCloseButtonStylesFunc = (theme: ITheme) => ({
    root: {
        color: theme.palette.neutralPrimary,
        marginLeft: 'auto',
        marginTop: '4px',
        marginRight: '2px',
    },
    rootHovered: {
        color: theme.palette.neutralDark,
    },
});

const contentStylesFunc = (theme: ITheme) => mergeStyleSets({
    container: {
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'stretch',
        maxWidth: '400px'
    },
    header: [
        // eslint-disable-next-line deprecation/deprecation
        theme.fonts.xLargePlus,
        {
            flex: '1 1 auto',
            borderTop: `2px solid ${theme.palette.themePrimary}`,
            color: theme.palette.neutralPrimary,
            display: 'flex',
            alignItems: 'center',
            fontWeight: FontWeights.semibold,
            padding: '12px 12px 14px 24px',
        },
    ],
    body: {
        flex: '4 4 auto',
        padding: '0 24px 24px 24px',
        overflowY: 'hidden',

        selectors: {
            p: { margin: '14px 0' },
            'p:first-child': { marginTop: 0 },
            'p:last-child': { marginBottom: 0 },
        },
    },
});

const stackTokens: IStackTokens = {
    childrenGap: 4,
};

const labelCalloutStackStyles: Partial<IStackStyles> = { root: { padding: 20 } };
const iconButtonStyles: Partial<IButtonStyles> = { root: { marginBottom: -3 } };
const iconProps = { iconName: 'Info' };

const cancelIcon: IIconProps = { iconName: 'Cancel' };
export const CustomLabel = (props: ITextFieldProps): JSX.Element => {
    console.log("customlabel", props);
    const [isCalloutVisible, { toggle: toggleIsCalloutVisible }] = useBoolean(false);
    const descriptionId = useId('description');
    const iconButtonId = useId('iconButton');
    const titleId = useId('title');
    const _theme = useContext(ThemeContext);
    const iconCloseButtonStyles = useMemo(() => iconCloseButtonStylesFunc(_theme ?? theme), [theme]);
    const contentStyles = useMemo(() => contentStylesFunc(_theme ?? theme), [theme]);
    return (
        <>
            <Stack horizontal verticalAlign="center" tokens={stackTokens}>
                <Label htmlFor={props.id} required={props.required} disabled={props.disabled}
                >{props.label || props.title}</Label>
                {props.description && <IconButton
                    id={iconButtonId}
                    iconProps={iconProps}
                    title="Info"
                    ariaLabel="Info"
                    onClick={toggleIsCalloutVisible}
                    styles={iconButtonStyles}
                />}
            </Stack>
            {isCalloutVisible && (
                <Callout
                    target={'#' + iconButtonId}
                    setInitialFocus
                    onDismiss={toggleIsCalloutVisible}
                    ariaDescribedBy={descriptionId}
                    role="alertdialog" className={contentStyles.container}
                >
                    <div className={contentStyles.header}>
                        <span id={titleId}>{props.label}</span>
                        <IconButton
                            styles={iconCloseButtonStyles}
                            iconProps={cancelIcon}
                            ariaLabel="Close popup modal"
                            onClick={toggleIsCalloutVisible}
                        />
                    </div>

                    <div className={contentStyles.body}>
                        <Stack tokens={stackTokens} horizontalAlign="start" styles={labelCalloutStackStyles}>
                            {props.description && <span id={descriptionId} dangerouslySetInnerHTML={{ "__html": props.description }}></span>}
                            {/*  <DefaultButton onClick={toggleIsCalloutVisible}>Close</DefaultButton>*/}
                        </Stack>
                    </div>
                </Callout>
            )}
        </>
    );
};


const CustomLabelWrapper = ({ schema, textProps, formContext }: { schema: any, formContext: any, textProps: ITextFieldProps }) => {



    const app = useModelDrivenApp();
    const { attributeName, entityName, fieldName, formName
    } = schema["x-widget-props"]!;
    const { locale, descriptions } = formContext;

    const entity = app.getEntity(entityName!);
    const attribute = entity.attributes[attributeName!];
    const descriptionInfo = descriptions.filter((d: any) => d.name === attribute.logicalName && d.locale == locale)?.[0];

    console.log("CustomLabelWrapper", [descriptions, descriptionInfo])
    return <CustomLabel
        label={schema.title} description={descriptionInfo?.description ?? schema["x-description"]}  {...textProps} />

}


const emojiIcon: IIconProps = { iconName: 'Clear' };
/** Render Caret Down Icon */
const _onRenderCaretDown = (formContext: any, schema: any, props?: IDropdownProps, originalRender?: Function) => {
    //  const formdata = useFormContext();
    console.log(formContext);
    console.log(schema);
    console.log(props);
    // console.log(formdata);
    const value = formContext.formData[schema["x-logicalname"]];
    return <>
        {(value || value === 0) && !props?.disabled && <IconButton iconProps={emojiIcon} title="Clear" ariaLabel="Clear" style={{ height: 28, margin: 1 }} onClick={(e) => {
            formContext.onFormDataChange({ [schema["x-logicalname"]]: null });
            e.preventDefault();
            e.stopPropagation();
        }} />}
        {originalRender?.(props)}</>;
};
function mapUISchema(props: any, formContext: any) {

    if (typeof props === "object") {
        const entries = Object.keys(props).map((k) => [k, {
            //   "ui:label": false,
            "ui:disabled": props[k]?.["x-widget-props"]?.disabled,
            "ui:widget": getControl(props[k], "widget"),
            "ui:field": getControl(props[k], "field"),
            // "ui:FieldTemplate": CustomFieldTemplate,
            "ui:props": {
                ...props[k]["x-widget-props"] ?? {},
                styles: readonlyStylesFunction.bind(null, props[k]),  //props[k].readOnly ? readonlyStylesFunction : props[k]["x-widget-props"]?.["styles"],
                // onRenderLabel: (props: any) => null,
                onRenderLabel: (textProps: ITextFieldProps) => <CustomLabelWrapper textProps={textProps} formContext={formContext} schema={props[k]} />,
                onRenderCaretDown: _onRenderCaretDown.bind(null, formContext, props[k])
            },
            "ui:placeholder": props[k]?.["x-widget-props"]?.placeholder,
            "ui:emptyValue": null
        }]);
        console.log(entries);
        return Object.fromEntries(entries);
    }

    return {};

}
/**
 * Extracts a specialized `UiSchema` from the custom Json schema given.
 *
 * It does this by looking for the custom `x-widget` property in the json schema
 * and converts this to a `UiSchema` which says that the given widget should be
 * used for that exact property on the json schema.
 * @param jsonSchema The schema to extract the `UiSchema` from
 * @param options Options which should be given to all widgets
 */
function getUiSchema(
    jsonSchema: ControlJsonSchemaObject,
    options?: OptionsFactory, //UiSchemaOpts,
    formContext?: any
): UiSchema {
    //  console.log("jsonSchema",jsonSchema);
    const props = jsonSchema.properties;
    const deps = mergeDeep({},
        ...Object.values(jsonSchema.dependencies ?? {})
            .map((c: any) => c.oneOf.map((o: any) => mapUISchema(o.properties, formContext))).flat(), mapUISchema(props, formContext));
    return deps;
    //   console.log("jsonSchema", [jsonSchema, mapUISchema(props), deps]);

    // return mapUISchema(props);
}



const CustomFieldTemplate = (props: FieldTemplateProps) => {
    const app = useModelDrivenApp();

    const { id, classNames, label, help, required, description, errors, children, schema, formContext, hidden } = props;

    const { attributeName, entityName, fieldName, formName
    } = schema["x-widget-props"]!;
    const { locale, descriptions } = formContext;

    const entity = app.getEntity(entityName!);
    const attribute = entity.attributes[attributeName!];
    const descriptionInfo = descriptions.filter((d: any) => d.name === attribute.logicalName && d.locale == locale)?.[0];
    console.log("CustomFieldTemplate", [props, descriptionInfo]);

    const title =
        attribute?.locale?.[locale]?.displayName ??
        attribute.displayName;

    //if (schema.type === "boolean") {
    //    return (
    //        <div className={classNames} style={{ marginBottom: 15, display: hidden ? "none" : undefined }}>
    //            <CustomLabel {...props} label={title} description={descriptionInfo?.description ?? schema["x-description"]} />
    //            {children}
    //            {errors}
    //            {help}
    //        </div>
    //    );
    //}

    return (
        <div className={classNames} style={{ marginBottom: 15, display: hidden ? "none" : undefined }}>
            {/*<CustomLabel {...props} label={title} description={descriptionInfo?.description ?? schema["x-description"]} />*/}
            {children}
            {errors}
            {help}
        </div>
    );
}


/**
 * This function is used to customize error and it is used to add localization.
 * @param errors List of Error to transform
 */
function transformErrors(errors: AjvError[]) {
    return errors.map((error) => {
        console.log("Heres the error")
        console.log(error)
        if (error.name === "multipleOf") {
            let numberOfDecimals = error.params.multipleOf.toString().split('.')[1]?.length || 0;
            error.message = `Only ${numberOfDecimals} decimal${numberOfDecimals > 1 ? 's' : ''} are allowed.`;
            // TODO: Figure out how to get the Display name for the property
            error.stack = `${error.property}: ${error.message}`;
        }
        return error;
    });
}
