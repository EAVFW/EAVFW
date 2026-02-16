import {
  FieldProps,
  getUiOptions,
  ErrorSchema,
  FormValidation,
  FieldTemplateProps,
  UiSchema,
  UIOptionsType,
} from '@rjsf/utils';
import React, { Component, ComponentClass } from 'react';
import { JSONSchema7 } from 'json-schema';
import { Label, TextField } from '@fluentui/react';
import { AttributeDefinition, EntityDefinition, FormColumnDefinition } from '@eavfw/manifest';
import { Controls } from './ControlRegister';
import { useModelDrivenApp } from '../../useModelDrivenApp';
import ChoicesControl from './ChoicesControl/ChoicesControl';
import { ChoicesControlProps } from './ChoicesControl/ChoicesControlProps';
import LookupControl from './LookupControl/LookupControl';
import { EAVFWLabel } from '../Forms/AutoForm/Templates/EAVFWLabel';

export type ControlHostWidgetProps = {
  schema: {
    'x-widget-props'?: {
      column: AttributeDefinition;
      field: FormColumnDefinition;
      entity: EntityDefinition;
      styles?: Record<string, unknown>;
      locale: string;
      formData: Record<string, unknown>;
      onRenderLabel?: (props: FieldTemplateProps) => React.ReactNode;
      extraErrors?: FormValidation;
    };
  } & JSONSchema7;
} & FieldProps;

export type ControlHostWidgetState = {
  label: string;
};

export type EAVFWUIOptions = {
  entityName: string;
  formName: string;
  fieldName: string;
  styles?: Record<string, unknown>;
} & UIOptionsType;

export const ControlHostWidgetNew = (props: FieldTemplateProps) => {
  const app = useModelDrivenApp();

  const { extraErrors, formErrors } = props.formContext;
  const { schema, uiSchema, required, disabled, formData, rawDescription } = props;

  const {
    widget,
    placeholder = '',
    title: uiTitle,
    ...options
  } = getUiOptions(uiSchema) as EAVFWUIOptions;

  const { ['x-control']: control } = schema as JSONSchema7 & { 'x-control'?: string };

  const { styles, onRenderLabel, entityName, fieldName, attributeName, formName } = options!;

  const column = app.getEntity(entityName).forms?.[formName]?.columns[fieldName];
  const label = props.schema.title!;

  const _onChange = (data: unknown, es?: ErrorSchema) => {
    try {
      props.onChange(data);
    } finally {
    }
  };

  let localExtraErrors: Partial<FormValidation> = {};

  for (let extraErrorsKey in extraErrors) {
    if (extraErrorsKey.startsWith(fieldName.toLowerCase())) {
      localExtraErrors[extraErrorsKey.substr(extraErrorsKey.indexOf('.') + 1)] =
        extraErrors[extraErrorsKey];
    }
  }

  let errorMessage = formErrors[fieldName.toLowerCase().replace(' ', '')]?.__errors?.join(' ');

  //const LabelTemplate = () => column?.label === false ? null : (onRenderLabel?.(props) ??
  //    <Label required={required} disabled={disabled}>{label}</Label>);

  const LabelTemplate = () =>
    column?.label === false ? null : (
      <EAVFWLabel
        id={props.id}
        disabled={disabled}
        required={required}
        label={label ?? schema.title}
        description={rawDescription ?? schema.description}
      />
    );

  const widgetProps = props.schema['x-widget-props']!;

  if (control && control in Controls) {
    const CustomControl = Controls[control];
    return (
      <>
        <LabelTemplate />
        <CustomControl value={formData} {...props} onChange={_onChange} {...widgetProps} />
      </>
    );
  }

  if (control === 'ChoicesControl')
    return (
      <>
        <LabelTemplate />
        <ChoicesControl
          {...({
            ...props,
            ...widgetProps,
            value: props.formData,
            onChange: _onChange,
            required: required ?? false,
            disabled: disabled ?? false,
            readonly: props.readonly ?? false,
          } as unknown as ChoicesControlProps)}
        />
      </>
    );
  if (control === 'PercentageControl') {
    return (
      <>
        <LabelTemplate />
        <TextField
          styles={styles}
          value={`${props.formData ? (parseFloat(props.formData) * 100)?.toString() : 0}%`}
          readOnly={props.readonly}
        />
      </>
    );
  }

  return (
    <>
      <LabelTemplate />
      <LookupControl
        {...({
          ...props,
          ...widgetProps,
          ...props.uiSchema,
          key: props.id,
          value: props.formData,
          onChange: _onChange,
          extraErrors: localExtraErrors,
          errorMessage,
        } as unknown as FieldProps)}
      />
    </>
  );
};

/** @deprecated Use named import: `import { ControlHostWidgetNew } from '...'` instead of default import */
export default ControlHostWidgetNew as unknown as ComponentClass<FieldProps>;
