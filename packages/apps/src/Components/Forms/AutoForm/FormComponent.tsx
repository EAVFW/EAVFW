import React, { createContext, useEffect, useRef, useState } from 'react';
import { IPivotProps, Pivot, PivotItem } from '@fluentui/react';

import TabComponent from './TabComponent';
import { useRouter } from 'next/router';
import { useChangeDetector } from '@eavfw/hooks';
import { EntityDefinition, FormDefinition, FormTabDefinition } from '@eavfw/manifest';
import { useTabProvider } from '../Tabs/useTabProvider';
import { OptionsFactory } from './OptionsFactory';
import { FormValidation } from '@rjsf/utils';
import { ResolveFeature } from '../../../FeatureFlags';
import { useSectionStyles } from '../../../Styles/SectionStyles.styles';

type FormComponentProps<T extends { id?: string; [key: string]: unknown }> = {
  form: FormDefinition;
  tabs: string[];
  getTabName: (tab: FormTabDefinition) => string;
  entity: EntityDefinition;
  formName: string;
  locale: string;
  formData: T;
  onFormDataChange?: (formdata: T) => void;
  factory?: OptionsFactory;
  formContext?: Record<string, unknown>;
  extraErrors?: FormValidation;
};

const pivotItemStyle = {
  height: 'calc(100vh - 44px)',
  overflow: 'auto',
};

const FormComponent = <T extends { id?: string; [key: string]: unknown }>(
  props: FormComponentProps<T>,
) => {
  const {
    form,
    tabs,
    getTabName,
    entity,
    formName,
    formData,
    onFormDataChange,
    formContext,
    extraErrors,
  } = props;
  try {
    const renderId = useRef(new Date().toISOString());
    renderId.current = new Date().toISOString();
    useChangeDetector('FormComponent: form', form, renderId);
    //useChangeDetector("FormComponent: tabs", tabs, renderId);
    useChangeDetector('FormComponent: getTabName', getTabName, renderId);
    useChangeDetector('FormComponent: entity', entity, renderId);
    useChangeDetector('FormComponent: formName', formName, renderId);
    useChangeDetector('FormComponent: formData', formData, renderId);
    useChangeDetector('FormComponent: onFormDataChange', onFormDataChange, renderId);
    const router = useRouter();

    const styles: IPivotProps['styles'] = {
      //root: {height: "100%"},
      itemContainer: { flexGrow: 1 },
    };

    useEffect(() => {
      if (form.scripts?.onInit) {
        Object.getOwnPropertyNames(form.scripts.onInit).forEach((name) => {
          const onInit = ResolveFeature(form.scripts!.onInit![name]) as
            | ((
                form: FormDefinition,
                entity: EntityDefinition,
                formData: Record<string, unknown>,
              ) => void)
            | undefined;
          if (onInit) {
            onInit(form, entity, formData);
          }
        });
      }
    }, []);

    if (form?.type === 'QuickCreate') {
      const [tabName, tab] = Object.entries(form.layout.tabs)[0];

      return (
        <TabComponent
          key={tabName}
          entityName={entity.logicalName}
          form={form}
          formData={formData}
          columns={tab.columns}
          tabName={tabName}
          entity={entity}
          formName={formName}
          locale={props.locale}
          onFormDataChange={onFormDataChange}
          factory={props.factory}
          formContext={formContext}
          extraErrors={extraErrors}
        />
      );
    }

    const { onTabChange, tabName = tabs[0] } = useTabProvider();

    const sectionStyles = useSectionStyles();
    const tab = form.layout.tabs[tabName];
    if (!tab) return null;

    return (
      <TabComponent
        key={tabName}
        entityName={entity.logicalName}
        form={form}
        formData={formData}
        columns={tab.columns}
        tabName={tabName}
        entity={entity}
        formName={formName}
        locale={props.locale}
        onFormDataChange={onFormDataChange}
        factory={props.factory}
        formContext={formContext}
        extraErrors={extraErrors}
      />
    );
    const ui = (
      <Pivot
        className="form-tabs"
        onLinkClick={(item) => onTabChange(item?.props.itemKey!)}
        selectedKey={tabName}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        styles={styles}
      >
        {tabs
          .filter((tabName) => form.layout.tabs[tabName])
          .map((tabName, idx) => {
            const tab = form.layout.tabs[tabName];
            return (
              <PivotItem
                className={`form-tab`}
                style={{ height: '100 % ' }}
                headerText={getTabName(tab) ?? tabName}
                key={tabName}
                itemKey={tabName}
              >
                <TabComponent
                  key={tabName}
                  entityName={entity.logicalName}
                  form={form}
                  formData={formData}
                  columns={tab.columns}
                  tabName={tabName}
                  entity={entity}
                  formName={formName}
                  locale={props.locale}
                  onFormDataChange={onFormDataChange}
                  factory={props.factory}
                  formContext={formContext}
                  extraErrors={extraErrors}
                />
              </PivotItem>
            );
          })}
      </Pivot>
    );
    return ui;
  } finally {
  }
};

/** @deprecated Use named import: `import { FormComponent } from '...'` instead of default import */
export default FormComponent;
export { FormComponent };
