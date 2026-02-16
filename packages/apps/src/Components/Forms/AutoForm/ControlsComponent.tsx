import React, {
  Fragment,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IChangeEvent, FormProps } from '@rjsf/core';
import { FieldTemplateProps, UiSchema, FieldValidation, RJSFValidationError } from '@rjsf/utils';
import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import Form from '@rjsf/fluentui-rc';
import { mergeDeep } from '@eavfw/utils';
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
  ThemeContext,
} from '@fluentui/react';
import { useBoolean, useId } from '@fluentui/react-hooks';

import { useChangeDetector } from '@eavfw/hooks';

import ControlHostWidget from '../../Controls/ControlHostWidget';
import SelectWidget from '../../Controls/SelectWidget';
import { OptionsFactory } from './OptionsFactory';
import { ControlJsonSchema, ControlJsonSchemaObject } from './ControlJsonSchema';
import { FormValidation } from '@rjsf/utils';
import { useModelDrivenApp } from '../../../useModelDrivenApp';
import { FieldTemplate } from './Templates/FieldTemplate';
import { useVisitedContext } from '../../../../../forms/src/EAVForm';
import { useAppInfo } from '../../../useAppInfo';
import TextWidget from './Widgets/TextWidget';
import CheckboxWidget from './Widgets/CheckboxWidget';

import { TextField } from '@fluentui/react';

import DateWidget from './Widgets/DateWidget';
import validator from '@rjsf/validator-ajv8';

//declare module '@rjsf/utils' {
//    interface WidgetProps {
//    }
//}

declare module 'json-schema' {
  export interface JSONSchema7 {
    'x-widget-props'?: {
      attributeName?: string;
      entityName?: string;
      fieldName?: string;
      formName?: string;
    };
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
  formContext?: Record<string, unknown>;
  extraErrors?: FormValidation;
};

function createVisitedObject(id: string) {
  let keys = id.split('_');
  let obj = {} as Record<string, unknown>;
  let root = obj;
  while (keys.length) {
    let a = keys.shift()!;
    obj[a] = keys.length === 0 ? true : {};
    obj = obj[a] as Record<string, unknown>;
  }
  return root;
}

//import DateTimeWidget from "./Widgets/DateTimeWidget";
import { React8BaseInputTemplate, React9BaseInputTemplate } from './Widgets/BaseInputTemplate';
import { TextareaWidget } from './Widgets/TextareaWidget';
import { EAVFWLabel } from './Templates/EAVFWLabel';
import { useEAVForm } from '@eavfw/forms';
import ObjectFieldTemplate from './Templates/ObjectFieldTemplate';
import { useSectionStyles } from '../../../Styles';
import { mergeClasses } from '@fluentui/react-components';
import { Controls } from '../../Controls';
import { getUiSchema, transformErrors } from './ControlsUiSchema';

export const WidgetRegister: FormProps['widgets'] = {
  SelectWidget: SelectWidget,
  CheckboxWidget: CheckboxWidget,
  // DateTimeWidget,
  DateWidget,
  TextareaWidget,
};

const ControlsComponent = <T extends {}>(props1: PropsWithChildren<ControlsComponentProps<T>>) => {
  const {
    schema,
    onFormDataChange,
    formData,
    locale,
    factory,
    tabName,
    formContext,
    columnName,
    sectionName,
    extraErrors = {} as FormValidation,
  } = props1;
  try {
    const app = useAppInfo();
    const styles = useSectionStyles();

    const renderId = useRef(new Date().toISOString());
    renderId.current = new Date().toISOString();
    useChangeDetector(
      `ControlsComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} schema`,
      schema,
      renderId,
    );
    useChangeDetector(
      `ControlsComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} onFormDataChange`,
      onFormDataChange,
      renderId,
    );
    useChangeDetector(
      `ControlsComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} formData`,
      formData,
      renderId,
    );
    useChangeDetector(
      `ControlsComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} locale`,
      locale,
      renderId,
    );
    useChangeDetector(
      `ControlsComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} factory`,
      factory,
      renderId,
    );

    const { visitedFields, setVisitedFields } = useVisitedContext();

    // const currentData = React.useRef(formData);
    let order = Object.keys(schema.properties);

    if (schema.dependencies) {
      for (let dependant of Object.keys(schema.dependencies)) {
        //dependant = has6thvacationweek
        //
        let depencies = schema.dependencies[dependant];
        if (typeof depencies === 'object' && !Array.isArray(depencies)) {
          let oneOfs = depencies.oneOf;
          if (Array.isArray(oneOfs)) {
            for (let oneOf of oneOfs) {
              if (typeof oneOf === 'object') {
                let otherProps = Object.keys(oneOf.properties ?? {}).filter((x) => x !== dependant);

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

    const uiSChema = React.useMemo(
      () => ({ ...getUiSchema(schema, factory, formContext), 'ui:order': order }),
      [schema, factory, formContext],
    );

    // const timerRef = React.useRef(0);
    const onChange = React.useCallback(
      (e: Partial<IChangeEvent<T>>) => {
        // currentData.current = e.formData!;

        //  window.clearTimeout(timerRef.current);
        //  timerRef.current = window.setTimeout(() => {
        onFormDataChange?.(e.formData!);
        // }, 500);
      },
      [onFormDataChange],
    );

    const addVisited = useCallback<Required<FormProps<any>>['onBlur']>(
      (id, value) => {
        setVisitedFields(
          id.substr(app.currentEntityName.length + 1),
          schema.type === 'array'
            ? (createVisitedObject(id.substr(app.currentEntityName.length + 1)) as Parameters<
                typeof setVisitedFields
              >[1])
            : true,
        );
      },
      [app.currentEntityName],
    );

    if (!process.browser) return <div>"loading"</div>;

    //TODO INVESTIGATE THIS. seems odd its running on each render.
    let formErrors = {} as FormValidation;
    for (let extraErrorsKey of Object.keys(extraErrors)) {
      let keys = extraErrorsKey.split('.');
      if (keys[0] in formErrors) {
        const existing = formErrors[keys[0]]?.__errors ?? [];
        const incoming = extraErrors[extraErrorsKey]?.__errors ?? [];
        // @ts-expect-error -- FieldValidation assignment to FormValidation index (pre-existing type mismatch)
        formErrors[keys[0]] = {
          __errors: existing.concat(incoming),
        } as FieldValidation;
      } else {
        formErrors[keys[0]] = extraErrors[extraErrorsKey];
      }
    }

    //  const formDataInitial = useMemo(() => formData,[]);

    //const [a, b] = useState(formData);
    //useEffect(() => {
    //    b(formData)

    //}, [formData, section.logicalName]);
    //const [formdata1] = useEAVForm(x => x.formValues);
    return (
      <Form
        tagName="div"
        className={mergeClasses('controls', sectionName, styles.element, styles.flex, styles.grow)}
        onBlur={addVisited}
        schema={schema as JSONSchema7}
        onChange={onChange}
        formContext={{
          ...(formContext ?? {}),
          onFormDataChange: (data: Record<string, unknown>) =>
            onChange({ formData: { ...formData, ...data } }), // onFormDataChange,
          formData: formData,
          extraErrors: extraErrors,
          formErrors: formErrors,
        }}
        idPrefix={app.currentEntityName}
        formData={formData}
        fields={{ ControlHostWidget: ControlHostWidget, ...Controls }}
        widgets={WidgetRegister}
        uiSchema={uiSChema}
        templates={{
          FieldTemplate: FieldTemplate,
          BaseInputTemplate: React9BaseInputTemplate,
          ObjectFieldTemplate: ObjectFieldTemplate,
        }}
        transformErrors={transformErrors}
        showErrorList={false}
        validator={validator}
        extraErrors={formErrors} // Even though we have to manually access and add the error for custom widget ourself through formContext, we have to set the error here too, to make thure the errors is added to the overview.
      >
        <Fragment />
      </Form>
    );
  } finally {
  }
};

/** @deprecated Use named import: `import { ControlsComponent } from '...'` instead of default import */
export default ControlsComponent;
export { ControlsComponent };
