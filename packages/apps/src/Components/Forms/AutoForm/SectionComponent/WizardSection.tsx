import React, { Fragment, useMemo } from 'react';

import {
  AutoFormColumnsDefinition,
  AutoFormControlsDefinition,
  AutoFormJsonSchemaDefinition,
  FormDefinition,
  hasColumns,
  hasControl,
  hasFields,
  hasForm,
  hasHtml,
  hasJsonSchema,
} from '@eavfw/manifest';
import { mergeDeep } from '@eavfw/utils';
import { Stack } from '@fluentui/react';
import { Form } from '@rjsf/fluentui-rc';
import validator from '@rjsf/validator-ajv8';
import { useEAVForm } from '../../../../../../forms/src';
import { useAppInfo } from '../../../../useAppInfo';
import { useModelDrivenApp } from '../../../../useModelDrivenApp';
import { Controls } from '../../../Controls/ControlRegister';
import { useStackStyles } from '../../../useStackStyles';
import {
  FormHostContext,
  ModelDrivenForm,
  useEvaluateFormDefinition,
} from '../../ModelDrivenEntityViewer';
import ControlsComponent, { WidgetRegister } from '../ControlsComponent';
import { ControlsComponentSlim } from '../ControlsComponentSlim';
import { React9BaseInputTemplate } from '../Widgets/BaseInputTemplate';
import { React9FieldTemplate } from '../Templates/React9FieldTemplate';
import { useSchema } from './useSchema';
import { useExpressionEvaluator } from './useExpressionEvaluator';

export const WizardSection = ({
  section: sectionIn,
  sectionName,
}: {
  sectionName: string;
  section: AutoFormColumnsDefinition | AutoFormControlsDefinition;
  title?: string;
}) => {
  const styles = useStackStyles();

  const [section, isLoading] = useExpressionEvaluator(sectionIn);

  if (hasColumns(section)) {
    const columns = section.columns;
    const ui = (
      <Stack
        verticalFill
        horizontal
        gap={25}
        styles={{
          root: {
            display: 'grid',
            gridTemplateColumns: `${Object.keys(columns)
              .map((c) => '1fr')
              .join(' ')};`,
          },
        }}
      >
        {Object.keys(columns).map((columnName, idx) => (
          <Stack.Item grow className={columnName} key={columnName}>
            <ControlsComponentSlim />
          </Stack.Item>
        ))}
      </Stack>
    );
    return ui;
  } else if (hasControl(section)) {
    if (section.control in Controls) {
      const CustomControl = Controls[section.control];

      return (
        <Stack verticalFill gap={25} styles={{}}>
          <Stack.Item grow>
            <CustomControl />
          </Stack.Item>
        </Stack>
      );
    }
  } else if (hasHtml(section)) {
    if (isLoading) return null;

    //const [{ expressions }] = useWizard();
    //if (section.html?.indexOf('@')) {

    //    const expressionProvider = ResolveFeature("ExpressionsProvider");

    //    const { isLoading, evaluated } = expressionProvider(section.html)

    //    return <div dangerouslySetInnerHTML={{ __html: evaluated }}></div>

    //}
    return <div dangerouslySetInnerHTML={{ __html: section.html }}></div>;
  } else if (hasForm(section)) {
    const app = useModelDrivenApp();
    const { currentEntityName } = useAppInfo();
    const forminfo =
      typeof section.form === 'string'
        ? { entity: currentEntityName, form: section.form }
        : section.form;
    const entity = app.getEntity(forminfo.entity);

    return (
      <ModelDrivenForm
        entity={entity}
        entityName={forminfo.entity}
        form={entity.forms![forminfo.form]}
        locale={app.locale}
        formName={forminfo.form}
      />
    );
  } else if (hasFields(section)) {
    const app = useModelDrivenApp();
    const { currentEntityName } = useAppInfo();
    const [formData, { onChange }] = useEAVForm((x) => x.formValues);
    const columns = useMemo(
      () =>
        Object.fromEntries(
          Object.entries(section.fields).map(([x, v]) => [
            x,
            { ...v, tab: 'TAB_General', column: 'COLUMN_First', section: 'SECTION_General' },
          ]),
        ),
      [section.fields],
    );

    const form = useMemo(
      () =>
        ({
          type: 'QuickCreate',
          name: 'WizardDynamic',
          layout: {
            tabs: {
              TAB_General: {
                title: 'General Information',
                locale: {
                  '1030': {
                    title: 'General Information',
                  },
                },
                columns: {
                  COLUMN_First: {
                    sections: {
                      SECTION_General: {},
                    },
                  },
                },
              },
            },
          },
          columns: columns,
        }) as FormDefinition,
      [],
    );
    const { evaluatedForm, isLoadingForm } = useEvaluateFormDefinition(
      form,
      formData,
      'WizardDynamic',
      currentEntityName,
    );
    const formHostContextValue = useMemo(
      () => ({ formDefinition: evaluatedForm }),
      [evaluatedForm],
    );
    const schema = useSchema(
      currentEntityName,
      app.getEntity(currentEntityName),
      columns,
      'TAB_General',
      'COLUMN_First',
      'SECTION_General',
      app,
      'WizardDynamic',
      {},
    );

    if (!schema) return null;
    return (
      <FormHostContext.Provider value={formHostContextValue}>
        <ControlsComponent
          entityName={currentEntityName}
          factory={undefined}
          locale={app.locale}
          formData={formData}
          onFormDataChange={onChange as unknown as (formdata: Record<string, unknown>) => void}
          schema={schema}
          formContext={{}}
        />
      </FormHostContext.Provider>
    );
  } else if (hasJsonSchema(section)) {
    if (isLoading) return null;

    return <JsonScheamSection sectionName={sectionName} {...section} />;
  }
  return <ControlsComponentSlim />;
};

type JsonScheamSectionProps = {
  sectionName: string;
};
export const JsonScheamSection = ({
  schema,
  uiSchema,
  logicalName,
  sectionName,
}: JsonScheamSectionProps & Required<AutoFormJsonSchemaDefinition>) => {
  const [formData, { onChange }] = useEAVForm(
    (x) => x.formValues,
    undefined,
    'sectioncomponent schema',
  );

  return (
    <Form
      key={sectionName}
      uiSchema={uiSchema}
      schema={schema}
      onBlur={(e) => {}}
      onChange={(e) => {
        onChange((props, ctx) => {
          if (logicalName) props[logicalName] = e.formData;
          else mergeDeep(props, e.formData);
          //  dispatch({ action: "setValues", values: props });
        });
      }}
      idPrefix={'wizard'}
      formData={logicalName ? formData[logicalName] : formData}
      widgets={WidgetRegister}
      templates={{ BaseInputTemplate: React9BaseInputTemplate, FieldTemplate: React9FieldTemplate }}
      //  templates={{ FieldTemplate: FieldTemplate }}
      showErrorList={false}
      validator={validator}
    >
      <Fragment />
    </Form>
  );
};
