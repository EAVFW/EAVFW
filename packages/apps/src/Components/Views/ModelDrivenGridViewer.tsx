/**
 * ModelDrivenGridViewer barrel file.
 *
 * Re-exports all public symbols from split modules and contains
 * the main ModelDrivenGridViewer component.
 */

// Re-export types
export type {
  ModelDrivenGridViewerState,
  ModelDrivenGridViewerProps,
  IScrollablePaneDetailsListExampleItem,
  DefaultPrimaryFieldRenderProps,
  ModelDrivenGridViewerContextProps,
  LookupControlRenderProps,
} from './gridViewerTypes';

// Re-export utility functions
export {
  setCount,
  setTop,
  setSkip,
  DefaultDataQuery,
  DefaultDataCountQuery,
  DefaultOnBuildFetchQuery,
} from './gridViewerUtils';

// Re-export renderers
export { traverseRecordPath } from './gridViewerRenderers';

// Re-export context
export {
  useModelDrivenGridViewerContext,
  ModelDrivenGridViewerContextProvider,
} from './gridViewerContext';

// Re-export LookupControlRender
export { LookupControlRender } from './LookupControlRender';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Stack,
  SelectionMode,
  IDetailsListProps,
  IDetailsRowStyles,
  DetailsRow,
  useTheme,
} from '@fluentui/react';

import { IRecord } from '@eavfw/manifest';

import { useRibbon } from '../Ribbon/useRibbon';
import { useProgressBarContext } from '../ProgressBar/ProgressBarContext';
import { useModelDrivenApp } from '../../useModelDrivenApp';
import { ColumnFilterProvider } from '../ColumnFilter/ColumnFilterContext';
import { useSelectionContext } from '../Selection/useSelectionContext';
import { useUserProfile } from '../Profile/useUserProfile';
import { ColumnFilterCallout } from '../ColumnFilter/ColumnFilterCallout';
import { RibbonBar } from '../Ribbon/RibbonBar';
import { useAppInfo } from '../../useAppInfo';
import { useLazyMemo } from '../../../../hooks/src';
import { usePaging } from './PagingContext';
import styles from './ModelDrivenGridViewer.module.scss';
import ModelDrivenList from './ModelDrivenList';
import { ModelDrivenViewContextProvider } from './ModelDrivenViewContext';

import { ModelDrivenGridViewerProps, ModelDrivenGridViewerState } from './gridViewerTypes';
import {
  DefaultDataQuery,
  DefaultDataCountQuery,
  DefaultOnBuildFetchQuery,
} from './gridViewerUtils';
import { ConditionRenderComponent, RenderDetailsFooter } from './gridViewerRenderers';

/**
 * A model-driven grid viewer component that renders entity records
 * in a details list with filtering, paging, and selection support.
 */
export function ModelDrivenGridViewer({
  allowNoPaging,
  locale,
  entity,
  filter,
  onChange,
  formData,
  listComponent,
  showViewSelector = true,
  newRecord,
  showRibbonBar,
  commands,
  rightCommands,
  viewName,
  recordRouteGenerator,
  padding,
  entityName,
  defaultValues,
  onHeaderRender,
  onBuildFetchQuery = DefaultOnBuildFetchQuery,
  onQueueData = DefaultDataQuery,
  onQueryDataCount = DefaultDataCountQuery,
}: ModelDrivenGridViewerProps) {
  const app = useModelDrivenApp();
  const appinfo = useAppInfo();

  const [items, setItems] = useState<IRecord[]>(
    newRecord
      ? ((formData?.[entity.collectionSchemaName.toLowerCase()] as IRecord[] | undefined) ?? [])
      : [],
  );
  const selectedView = useMemo(() => viewName ?? Object.keys(entity.views ?? {})[0], [viewName]);
  const [announcedMessage, setannouncedMessage] = useState<string>();

  const [isCompactMode, setisCompactMode] = useState(false);
  const attributes = useMemo(
    () => ({
      ...((entity.TPT && app.getEntity(entity.TPT).attributes) ?? {}),
      ...entity.attributes,
    }),
    [entityName],
  );
  const viewDefinition = useMemo(() => entity.views?.[selectedView], [selectedView]);
  const { hideProgressBar, showIndeterminateProgressIndicator } = useProgressBarContext();

  const [isModalSelection, setisModalSelection] = useState(
    entity.views?.[selectedView]?.selection !== false,
  );
  const { setSelection, selection, selectionDetails } = useSelectionContext();

  const stateCommands = useLazyMemo<ModelDrivenGridViewerState['commands']>(
    () => commands?.({ selection }) ?? rightCommands ?? [],
    [commands, selection, selectionDetails, appinfo.currentEntityName, appinfo.currentRecordId],
  );

  const { buttons, addButton, removeButton, events } = useRibbon();

  useEffect(() => {
    for (const cmd of stateCommands) {
      addButton(cmd);
    }

    return () => {
      for (const cmd of stateCommands) {
        removeButton(cmd.key);
      }
    };
  }, [stateCommands]);

  const {
    fetchQuery,
    setFetchQuery,
    pageSize,
    currentPage,
    setTotalRecords,
    enabled: pagingContextEnabled,
  } = usePaging();
  const pagingDisabled = useMemo(
    () =>
      viewDefinition?.paging === false ||
      (typeof viewDefinition?.paging === 'object' && viewDefinition?.paging?.enabled === false),
    [viewDefinition],
  );

  if (!pagingContextEnabled && !(allowNoPaging || pagingDisabled))
    throw new Error(
      `Please wrap ModelDrivenEntityViewer with the PagingProvider or set allowNoPaging=true: pagingContextEnabled=${pagingContextEnabled}, allowNoPaging=${allowNoPaging}, pagingDisabled=${pagingDisabled}`,
    );

  if (fetchQuery) {
    fetchQuery['$count'] = false;
  }
  const { data, isError, isLoading, mutate } = onQueueData(entity, newRecord, fetchQuery);

  const { data: count } = onQueryDataCount(entity, newRecord, fetchQuery);

  useEffect(() => {
    if (formData?.modifiedon) mutate();
  }, [formData?.modifiedon]);

  // Show loading bar based on loading from data.
  useEffect(() => {
    if (isLoading && !newRecord) showIndeterminateProgressIndicator();
    else {
      hideProgressBar();
    }
    return () => {
      hideProgressBar();
    };
  }, [isLoading, isError]);

  // Set items whenever its done loading and augment with entityName.
  useEffect(() => {
    if (data)
      setItems(data.items.map((item) => Object.assign(item, { entityName: entity.logicalName })));

    if (newRecord && defaultValues) {
      setItems(
        defaultValues.map((item) =>
          Object.assign(item, { entityName: entity.logicalName }),
        ) as IRecord[],
      );
    }
  }, [data, newRecord && defaultValues]);

  useEffect(() => {
    setTotalRecords(count?.count ?? -1);
  }, [count?.count]);

  const user = useUserProfile();

  const hasMoreViews = Object.keys(entity?.views ?? {}).length > 1;

  const theme = useTheme();

  const _onRenderRow = useCallback<Required<IDetailsListProps>['onRenderRow']>(
    (props) => {
      const customStyles: Partial<IDetailsRowStyles> = {};

      if (props) {
        if (props.itemIndex % 2 === 0) {
          customStyles.root = {
            backgroundColor: theme.palette.neutralLighterAlt,
          };
        }
        return <DetailsRow {...props} styles={customStyles} />;
      }
      return null;
    },
    [theme.palette.neutralLighterAlt],
  );

  const _onItemInvoked = (item: IRecord): void => {
    window.location.href = recordRouteGenerator(item);
  };

  return (
    <Stack verticalFill>
      <ModelDrivenViewContextProvider mutate={mutate}>
        <ColumnFilterProvider
          currentEntityName={entity.logicalName}
          view={viewDefinition}
          filter={filter}
          attributes={attributes}
          locale={locale}
          onHeaderRender={onHeaderRender}
          onBuildFetchQuery={onBuildFetchQuery}
          setFetchQuery={setFetchQuery}
          currentPage={currentPage}
          pageSize={pageSize}
          pagingContextEnabled={pagingContextEnabled}
          app={app}
        >
          <ColumnFilterCallout />

          <Stack.Item
            className={styles.gridviewWrapper}
            grow
            styles={{ root: { padding: padding } }}
          >
            {showRibbonBar && stateCommands.length > 0 && <RibbonBar hideBack />}

            {isModalSelection ? (
              <ModelDrivenList
                className="gridview"
                items={items}
                selectionMode={SelectionMode.multiple}
                setKey="multiple"
                onChange={onChange}
                listComponent={listComponent}
                formData={formData}
                onRenderItemColumn={(item, index, column) => (
                  <ConditionRenderComponent
                    entity={entity}
                    recordRouteGenerator={recordRouteGenerator}
                    item={item}
                    index={index}
                    column={column}
                    setItems={setItems}
                    formName={Object.keys(entity.forms ?? {})[0]}
                    attribute={app.getAttribute(attributes, column?.key!)}
                    items={items}
                    locale={locale}
                  />
                )}
                onItemInvoked={_onItemInvoked}
                onRenderDetailsFooter={
                  pagingDisabled || !pagingContextEnabled ? undefined : RenderDetailsFooter
                }
              />
            ) : (
              <ModelDrivenList
                items={items}
                selectionMode={SelectionMode.none}
                setKey="none"
                onChange={onChange}
                formData={formData}
                listComponent={listComponent}
                onRenderItemColumn={(item, index, column) => (
                  <ConditionRenderComponent
                    recordRouteGenerator={recordRouteGenerator}
                    entity={entity}
                    item={item}
                    index={index}
                    column={column}
                    setItems={setItems}
                    formName={Object.keys(entity.forms ?? {})[0]}
                    attribute={app.getAttribute(attributes, column?.key!)}
                    items={items}
                    locale={locale}
                  />
                )}
                onItemInvoked={_onItemInvoked}
                onRenderDetailsFooter={
                  pagingDisabled || !pagingContextEnabled ? undefined : RenderDetailsFooter
                }
              />
            )}
          </Stack.Item>
        </ColumnFilterProvider>
      </ModelDrivenViewContextProvider>
    </Stack>
  );
}

/** @deprecated Use named import: `import { ModelDrivenGridViewer } from '...'` instead of default import */
export default ModelDrivenGridViewer;
