import React from 'react';

import {
  Stack,
  IColumn,
  IDetailsFooterProps,
  IRenderFunction,
  StickyPositionType,
  IDetailsHeaderProps,
  IDetailsColumnRenderTooltipProps,
  TooltipHost,
  Sticky,
  IconButton,
} from '@fluentui/react';

import Link from 'next/link';

import {
  AttributeDefinition,
  ChoiceType,
  EntityDefinition,
  IRecord,
  isAttributeLookup,
  isChoice,
  isLookup,
  isPolyLookup,
  LookupAttributeDefinition,
  NestedType,
} from '@eavfw/manifest';

import { useModelDrivenApp } from '../../useModelDrivenApp';
import { isAttributeLookupEntry, useColumnFilter } from '../ColumnFilter/ColumnFilterContext';
import { useAppInfo } from '../../useAppInfo';
import { Controls } from '../Controls/ControlRegister';
import { usePaging } from './PagingContext';
import { useModelDrivenGridViewerContext } from './gridViewerContext';
import { DefaultPrimaryFieldRenderProps } from './gridViewerTypes';
import { getCellText, convertDateTimeFormat } from './gridViewerUtils';
import { ModelDrivenApp } from '../../ModelDrivenApp';

/**
 * Renders the sticky header for the details list.
 */
export const onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (
  props,
  defaultRender,
) => {
  if (!props) {
    return null;
  }
  const onRenderColumnHeaderTooltip: IRenderFunction<IDetailsColumnRenderTooltipProps> = (
    tooltipHostProps,
  ) => <TooltipHost {...tooltipHostProps} />;
  return (
    <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced>
      {defaultRender!({
        ...props,
        styles: {
          root: { paddingTop: 0 },
        },
        onRenderColumnHeaderTooltip,
      })}
    </Sticky>
  );
};

/**
 * Renders the footer for the details list with paging controls.
 */
export const RenderDetailsFooter: IRenderFunction<IDetailsFooterProps> = (props, defaultRender) => {
  if (!props) {
    return null;
  }

  const {
    currentPage,
    firstItemNumber,
    lastItemNumber,
    pageSize,
    totalRecords,
    moveToFirst,
    moveNext,
    movePrevious,
  } = usePaging();
  const { selectedCount } = { selectedCount: 0 };

  return (
    <Stack grow horizontal horizontalAlign="space-between">
      <Stack.Item grow className="Footer" align="end">
        <Stack grow horizontal horizontalAlign="space-between">
          <Stack.Item grow={1} align="center">
            {firstItemNumber} - {lastItemNumber} of {totalRecords} ({selectedCount} selected)
          </Stack.Item>
          <Stack.Item align="center" className="FooterRight">
            <Stack grow horizontal verticalAlign="center">
              <IconButton
                className="FooterIcon"
                iconProps={{ iconName: 'DoubleChevronLeft' }}
                onClick={moveToFirst}
              />
              <IconButton
                className="FooterIcon"
                iconProps={{ iconName: 'ChevronLeft' }}
                onClick={movePrevious}
              />
              <span style={{ display: 'block' }}>Page {currentPage + 1}</span>
              <IconButton
                className="FooterIcon"
                iconProps={{ iconName: 'ChevronRight' }}
                onClick={moveNext}
              />
            </Stack>
          </Stack.Item>
        </Stack>
      </Stack.Item>
    </Stack>
  );
};

/**
 * Renders a choice column value with proper locale support.
 */
export const RenderChoiceColumn = ({
  value,
  type,
  locale,
}: {
  value: unknown;
  type: ChoiceType;
  locale: string;
}) => {
  if (value || value === 0) {
    const [key, optionValue] = Object.entries<Record<string, unknown> | number>(
      type.options ?? {},
    ).filter(([key, option]) => (typeof option === 'number' ? option : option.value) === value)[0];

    const optionObj = typeof optionValue === 'object' ? optionValue : undefined;
    return (
      <>
        {((optionObj?.locale as Record<string, Record<string, unknown>> | undefined)?.[locale]
          ?.displayName as React.ReactNode) ??
          (optionObj?.text as React.ReactNode) ??
          key}
      </>
    );
  }
  return null;
};

/**
 * Traverses a record path (e.g., "lookup/attribute") to resolve
 * nested lookup values across entity relationships.
 */
export const traverseRecordPath = (app: ModelDrivenApp, column: IColumn, initialItem: IRecord) => {
  const parts = column.key.split('/');
  let currentItem = initialItem as IRecord;
  let navattributes = app.getEntity(currentItem['$type'] as string).attributes;
  let value = null as unknown;
  while (parts.length) {
    const nav = parts.shift()!;
    const attribute = navattributes[nav];
    if (isAttributeLookup(attribute)) {
      currentItem = currentItem[attribute.logicalName.slice(0, -2)] as IRecord;

      if (parts.length === 0)
        return [
          currentItem,
          currentItem[attribute.type.foreignKey?.principalNameColumn?.toLowerCase()!],
          attribute,
        ];

      navattributes = app.getEntityFromKey(attribute.type.referenceType).attributes;
    } else {
      value = currentItem[attribute.logicalName];
      return [currentItem, value, attribute];
    }
  }
  return [currentItem, value];
};

/**
 * Default renderer for primary field columns, showing a link to the record.
 */
export const DefaultPrimaryFieldRender = ({
  recordRouteGenerator,
  item,
  column,
}: DefaultPrimaryFieldRenderProps) => {
  if (column.key.indexOf('/') !== -1) {
    const app = useModelDrivenApp();
    const [subitem, value] = traverseRecordPath(app, column, item) as [IRecord, unknown];

    return (
      <Link legacyBehavior={true} href={recordRouteGenerator(subitem)}>
        <a>{value as React.ReactNode}</a>
      </Link>
    );
  }
  const value = (item[column?.fieldName!] as React.ReactNode) ?? '<ingen navn>';
  return (
    <Link legacyBehavior={true} href={recordRouteGenerator(item)}>
      <a>{value}</a>
    </Link>
  );
};

/**
 * Conditionally renders a column cell based on the attribute type
 * (choice, primary field, lookup, poly-lookup, custom control, datetime, or text).
 */
export const ConditionRenderComponent = ({
  recordRouteGenerator,
  entity,
  item: rawItem,
  column,
  locale,
}: {
  [key: string]: unknown;
  column?: IColumn;
  entity: EntityDefinition;
  recordRouteGenerator: (record: IRecord) => string;
}) => {
  const item = rawItem as IRecord;
  const localeStr = locale as string;
  if (!column) throw new Error('Column not defined');

  const attribute = column.data as AttributeDefinition;

  const { onRenderPrimaryField: RenderPrimaryField } = useModelDrivenGridViewerContext();

  const type = attribute.type as NestedType;

  if (isChoice(type) && item) {
    return (
      <RenderChoiceColumn
        value={item?.[column?.fieldName as string]}
        type={type}
        locale={localeStr}
      />
    );
  } else if (attribute.isPrimaryField) {
    return (
      <RenderPrimaryField recordRouteGenerator={recordRouteGenerator} item={item} column={column} />
    );
  } else if (isLookup(type)) {
    if (column.key.indexOf('/') !== -1) {
      const app = useModelDrivenApp();
      const [subitem, value, lookup] = traverseRecordPath(app, column, item) as [
        IRecord,
        unknown,
        LookupAttributeDefinition,
      ];

      if (isChoice(lookup.type)) {
        return <RenderChoiceColumn value={value} type={lookup.type} locale={localeStr} />;
      }

      return (
        <Link
          legacyBehavior={true}
          href={recordRouteGenerator({
            id: subitem.id,
            entityName:
              (subitem?.['$type'] as string | undefined) ?? lookup.type.foreignKey?.principalTable!,
          } as IRecord)}
        >
          <a>{value as React.ReactNode}</a>
        </Link>
      );
    }

    if (!(attribute.logicalName in item)) {
      return null;
    }

    const linkedItem = item[attribute.logicalName.slice(0, -2)] as IRecord;

    if (isPolyLookup(type)) {
      const app = useModelDrivenApp();
      const { currentEntityName } = useAppInfo();
      if (type.inline) {
        const lookups = Object.entries(app.getAttributes(entity.logicalName)).filter(
          isAttributeLookupEntry,
        );

        const lookupsFromReferenceTypes = type.referenceTypes
          .map((referenceType) =>
            lookups.filter(
              (a) =>
                a[1].type.referenceType === referenceType && a[1].logicalName.slice(0, -2) in item,
            ),
          )
          .filter((x) => x.length > 0)[0][0];

        const referenceItem = item[lookupsFromReferenceTypes[1].logicalName.slice(0, -2)] as
          | IRecord
          | undefined;
        return (
          <Link
            legacyBehavior={true}
            href={recordRouteGenerator({
              id: item[attribute.logicalName] as string,
              entityName:
                ((referenceItem as IRecord | undefined)?.['$type'] as string | undefined) ??
                lookupsFromReferenceTypes[1].type?.foreignKey?.principalTable!,
            } as IRecord)}
          >
            <a>
              {
                referenceItem?.[
                  lookupsFromReferenceTypes[1].type.foreignKey?.principalNameColumn?.toLowerCase()!
                ] as React.ReactNode
              }
            </a>
          </Link>
        );
      }

      const referenceType = Object.values(
        app.getAttributes(app.getEntityFromKey(type.referenceType).logicalName),
      ).filter((a) => a.logicalName in linkedItem)[0] as LookupAttributeDefinition;

      const referenceItem = linkedItem[referenceType.logicalName.slice(0, -2)] as
        | IRecord
        | undefined;

      return (
        <Link
          legacyBehavior={true}
          href={recordRouteGenerator({
            id: linkedItem[referenceType.logicalName] as string,
            entityName:
              (referenceItem?.['$type'] as string | undefined) ??
              referenceType.type?.foreignKey?.principalTable!,
          } as IRecord)}
        >
          <a>
            {
              referenceItem?.[
                referenceType.type.foreignKey?.principalNameColumn?.toLowerCase()!
              ] as React.ReactNode
            }
          </a>
        </Link>
      );
    }
    return (
      <Link
        legacyBehavior={true}
        href={recordRouteGenerator({
          id: item[attribute.logicalName] as string,
          entityName:
            ((item[attribute.logicalName.slice(0, -2)] as IRecord | undefined)?.['$type'] as
              | string
              | undefined) ?? type.foreignKey?.principalTable!,
        } as IRecord)}
      >
        <a>
          {
            (item[attribute.logicalName.slice(0, -2)] as IRecord | undefined)?.[
              type.foreignKey?.principalNameColumn?.toLowerCase()!
            ] as React.ReactNode
          }
        </a>
      </Link>
    );
  } else if (column.data.control && column.data.control in Controls) {
    const CustomControl = Controls[column.data.control] as React.FC<{
      value: unknown;
    }>;

    return <CustomControl value={item[attribute.logicalName]}></CustomControl>;
  } else if (type.type === 'datetime') {
    const value = item && column && column.fieldName ? item[column.fieldName] : '';

    return <>{convertDateTimeFormat(value as string)}</>;
  }

  return <>{getCellText(item, column)}</>;
};
