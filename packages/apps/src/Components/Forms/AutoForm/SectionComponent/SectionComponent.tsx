import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { useChangeDetector, useLazyMemo } from '@eavfw/hooks';
import {
  deleteRecordSWR,
  FormTabDefinitionWithColumns,
  hasColumns,
  hasControl,
  ViewReference,
} from '@eavfw/manifest';
import { capitalize } from '@eavfw/utils';
import { ICommandBarItemProps, IDetailsListProps, Panel, Stack } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import { useEAVForm } from '../../../../../../forms/src';
import { useAppInfo } from '../../../../useAppInfo';
import { useModelDrivenApp } from '../../../../useModelDrivenApp';
import { Controls } from '../../../Controls/ControlRegister';
import { RibbonContextProvider } from '../../../Ribbon/RibbonContextProvider';
import { RibbonHost } from '../../../Ribbon/RibbonHost';
import ModelDrivenGridViewer from '../../../Views/ModelDrivenGridViewer';
import { PagingProvider } from '../../../Views/PagingContext';
import { Views } from '../../../Views/ViewRegister';
import { FormRender } from '../../FormRender';
import ColumnComponent from '../ColumnComponent';
import ControlsComponent from '../ControlsComponent';
import { findEntry } from './sectionUtils';
import { buildLookupFilter } from './buildLookupFilter';
import { useSchema } from './useSchema';
import { SectionComponentProps } from './SectionComponentProps';

// Re-export split modules to preserve public API
export { WizardSection, JsonScheamSection } from './WizardSection';

export function SectionComponent<T extends { id?: string; [key: string]: unknown }>(
  props: SectionComponentProps<T>,
) {
  const {
    form,
    tabName,
    columnName,
    sectionName,
    entityName,
    entity,
    formName,
    formData,
    onFormDataChange,
    factory,
    locale,
    formContext,
    extraErrors,
  } = props;

  try {
    const renderId = useRef(new Date().toISOString());
    renderId.current = new Date().toISOString();
    useChangeDetector(
      `SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} form`,
      form,
      renderId,
    );
    useChangeDetector(
      `SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} tabName`,
      tabName,
      renderId,
    );
    useChangeDetector(
      `SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} columnName`,
      columnName,
      renderId,
    );
    useChangeDetector(
      `SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} sectionName`,
      sectionName,
      renderId,
    );
    useChangeDetector(
      `SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} entity`,
      entity,
      renderId,
    );
    useChangeDetector(
      `SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} formName`,
      formName,
      renderId,
    );
    useChangeDetector(
      `SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} formData`,
      formData,
      renderId,
    );
    useChangeDetector(
      `SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} onFormDataChange`,
      onFormDataChange,
      renderId,
    );
    useChangeDetector(
      `SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} factory`,
      factory,
      renderId,
    );
    useChangeDetector(
      `SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} locale`,
      locale,
      renderId,
    );

    const columns = form.columns;
    const tab = form.layout.tabs[tabName] as FormTabDefinitionWithColumns;
    const section = findEntry(tab.columns, columnName, sectionName);
    if (!section) return null;
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
              <ColumnComponent<T>
                form={form}
                sections={columns[columnName].sections}
                tabName={tabName}
                columnName={columnName}
                entity={entity}
                formName={formName}
                formData={formData}
                onFormDataChange={onFormDataChange}
                locale={locale}
                entityName={entityName}
                factory={factory}
                formContext={formContext}
                extraErrors={extraErrors}
              />
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
    }
    const app = useModelDrivenApp();
    const router = useRouter();
    const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);
    const localization = {
      new: capitalize(app.getLocalization('new') ?? 'New'),
      delete: 'Delete',
    };
    const schema = useSchema(
      entityName,
      entity,
      columns,
      tabName,
      columnName,
      sectionName,
      app,
      formName,
      formContext ?? {},
    );
    //TODO , make expression parsning work on views.
    const [{ allowedforchildcreation }] = useEAVForm((state) => ({
      allowedforchildcreation: state.formValues.allowedforchildcreation,
    }));
    const appinfo = useAppInfo();
    const views = useLazyMemo(() => {
      try {
        const views = app.getReferences(
          entity.logicalName,
          formName,
          tabName,
          columnName,
          sectionName,
        );

        for (let view of views) {
          view.ribbon = { ...view?.ribbon };
          let visible = view.ribbon.new?.visible as string | boolean;
          if (typeof visible === 'string' && visible.indexOf('@') !== -1) {
            if (visible === '@canCreateTaskDefintion()') {
              view.ribbon.new.visible = (allowedforchildcreation as boolean | undefined) ?? false;
            }
          }
        }
        return views;
      } finally {
      }
    }, [
      entity.logicalName,
      formName,
      tabName,
      columnName,
      sectionName,
      allowedforchildcreation,
      appinfo.currentEntityName,
      appinfo.currentRecordId,
    ]);

    const [activeViewRef, setactiveViewRef] = useState<ViewReference>();
    useEffect(() => {
      if (activeViewRef) {
        openPanel();
      } else {
        dismissPanel();
      }
    }, [activeViewRef]);
    const { currentAppName, currentAreaName } = useAppInfo();

    return (
      <>
        <Panel
          headerText="Quick Create"
          styles={{ scrollableContent: { display: 'flex', flexDirection: 'column', flexGrow: 1 } }}
          isOpen={isOpen}
          onDismiss={() => setactiveViewRef(undefined)}
          // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
          closeButtonAriaLabel="Close"
        >
          <Stack verticalFill>
            {activeViewRef && (
              <FormRender
                stickyFooter={false}
                dismissPanel={(ev) => {
                  setactiveViewRef(undefined);
                }}
                record={{}}
                onChange={(data) => {
                  onFormDataChange?.({
                    [activeViewRef!.entity.collectionSchemaName.toLowerCase()]: [
                      ...((formData[
                        activeViewRef.entity.collectionSchemaName.toLowerCase()
                      ] as unknown[]) ?? []),
                      data,
                    ],
                  } as T);
                }}
                formName="Quick"
                entityName={activeViewRef!.entityName}
              />
            )}
          </Stack>
        </Panel>

        {schema && (
          <ControlsComponent<T>
            entityName={entityName}
            factory={factory}
            locale={locale}
            formData={formData}
            sectionName={sectionName}
            tabName={tabName}
            columnName={columnName}
            onFormDataChange={onFormDataChange}
            schema={schema}
            formContext={{ ...formContext, section }}
            extraErrors={extraErrors}
          />
        )}
        {views.map((gridprops) => (
          <RibbonContextProvider key={gridprops.key}>
            <RibbonHost ribbon={gridprops.ribbon ?? {}}>
              <PagingProvider
                initialPageSize={
                  typeof gridprops.view?.paging === 'object'
                    ? (gridprops.view.paging.pageSize ?? undefined)
                    : undefined
                }
                enabled={
                  !(
                    gridprops.view?.paging === false ||
                    (typeof gridprops.view?.paging === 'object' &&
                      gridprops.view?.paging?.enabled === false)
                  )
                }
              >
                <ModelDrivenGridViewer
                  {...gridprops}
                  locale={locale}
                  onChange={
                    onFormDataChange as ((data: Record<string, unknown>) => void) | undefined
                  }
                  filter={buildLookupFilter(entityName, formData.id!, gridprops)}
                  formData={formData}
                  newRecord={formData.id ? false : true}
                  defaultValues={
                    formData[gridprops.entity.collectionSchemaName.toLowerCase()] as
                      | Record<string, unknown>[]
                      | undefined
                  }
                  listComponent={
                    gridprops.view?.control && gridprops.view?.control in Views
                      ? (Views[gridprops.view.control] as unknown as React.ComponentType<
                          IDetailsListProps & {
                            formData: Record<string, unknown>;
                            onChange?: (related: Record<string, unknown>) => void;
                          }
                        >)
                      : undefined
                  }
                  padding={0}
                  showRibbonBar={true}
                  showViewSelector={false}
                  recordRouteGenerator={(record) =>
                    app.recordUrl({
                      appName: currentAppName,
                      areaName: currentAreaName,
                      entityName:
                        '$type' in record
                          ? (record['$type'] as string)
                          : ((record.entityName as string) ?? entity.logicalName),
                      recordId: record.id,
                    })
                  }
                  commands={(view) =>
                    [
                      {
                        key: 'newRelatedItem',
                        text: `${localization.new} ${
                          gridprops.entity.locale?.[app.locale]?.displayName ??
                          gridprops.entity.displayName
                        }`,
                        iconProps: { iconName: 'Add' },
                        onClick: (e, i) => {
                          if (gridprops.view?.ribbon?.new?.supportQuickCreate) {
                            setactiveViewRef(gridprops);
                          } else {
                            router.push(
                              app.newEntityUrl(
                                router.query.appname as string,
                                router.query.area as string,
                                gridprops.entity.logicalName,
                                undefined,
                                {
                                  [gridprops.attribute]:
                                    gridprops.polylookup === 'split'
                                      ? `${entityName}:${formData?.id ?? ''}`
                                      : (formData?.id ?? ''),
                                },
                              ),
                            );
                          }
                          //location.href = ;
                        },
                      } as ICommandBarItemProps,
                      {
                        key: 'deleteSelection',
                        text: `${localization.delete}`,
                        iconProps: { iconName: 'Delete' },
                        disabled: view.selection.getSelection().length === 0,
                        onClick: (e, i) => {
                          setTimeout(async () => {
                            let tasks = view.selection
                              .getSelection()
                              .map((i) => deleteRecordSWR(gridprops.entity, i.id!));
                            await Promise.all(tasks);

                            location.reload();
                          });
                        },
                      } as ICommandBarItemProps, //,
                    ].filter(
                      (commandBarButton) =>
                        (commandBarButton.key === 'newRelatedItem' &&
                          gridprops?.ribbon?.new?.visible !== false) ||
                        (commandBarButton.key === 'deleteSelection' &&
                          gridprops?.ribbon?.delete?.visible !== false),
                    )
                  }
                />
              </PagingProvider>
            </RibbonHost>
          </RibbonContextProvider>
        ))}
      </>
    );
  } finally {
  }
}

/** @deprecated Use named import: `import { SectionComponent } from '...'` instead of default import */
export default SectionComponent;
