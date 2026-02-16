import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Stack,
  DetailsList,
  DetailsListLayoutMode,
  Selection,
  SelectionMode,
  IColumn,
  IStackStyles,
  CommandBar,
  ICommandBarStyles,
  ICommandBarItemProps,
  IDropdownOption,
  IDetailsFooterProps,
  IRenderFunction,
  StickyPositionType,
  IDetailsHeaderProps,
  IDetailsColumnRenderTooltipProps,
  TooltipHost,
  Sticky,
  DetailsRow,
  mergeStyleSets,
  IDetailsRowStyles,
  IDetailsListProps,
  getTheme,
  ConstrainMode,
  Modal,
  IObjectWithKey,
  ISelection,
  MessageBar,
  MessageBarType,
  IDetailsColumnProps,
  useTheme,
  IconButton,
  DetailsHeader,
} from '@fluentui/react';
import { FormValidation, FieldValidation } from '@rjsf/utils';

import Link from 'next/link';

import { useBoolean, useId } from '@fluentui/react-hooks';

import {
  AttributeDefinition,
  EntityDefinition,
  getNavigationProperty,
  IRecord,
  isAttributeLookup,
  isLookup,
  LookupAttributeDefinition,
  LookupType,
  queryEntitySWR,
  ViewColumnDefinition,
  ViewDefinition,
} from '@eavfw/manifest';
import { FormRenderProps } from '../Forms/FormRenderProps';
import { useRibbon } from '../Ribbon/useRibbon';
import { errorMessageFactory, useMessageContext } from '../MessageArea/MessageContext';
import { useProgressBarContext } from '../ProgressBar/ProgressBarContext';
import { handleValidationErrors } from '../../Validation/handleValidationErrors';
import { LazyFormRender } from '../Forms/LazyFormRender';
import { useModelDrivenApp } from '../../useModelDrivenApp';
import { ColumnFilterProvider, useColumnFilter } from '../ColumnFilter/ColumnFilterContext';
import { useSelectionContext } from '../Selection/useSelectionContext';
import { IColumnData } from '../ColumnFilter/IColumnData';
import { useUserProfile } from '../Profile/useUserProfile';
import { RibbonHost } from '../Ribbon/RibbonHost';
import { ColumnFilterCallout } from '../ColumnFilter/ColumnFilterCallout';
import { RibbonBar } from '../Ribbon/RibbonBar';
import { filterRoles } from '../../filterRoles';
import { useAppInfo } from '../../useAppInfo';
import { useLazyMemo } from '../../../../hooks/src';
import { Controls } from '../Controls/ControlRegister';
import { IFetchQuery, usePaging } from './PagingContext';
import styles from './ModelDrivenGridViewer.module.scss';
import { useModelDrivenGridViewerContext } from './ModelDrivenGridViewer';

//const theme = getTheme();

export type ModelDrivenGridViewerState = {
  columns: IColumn[];
  items: IRecord[];
  selectionDetails: string;
  isModalSelection: boolean;
  isCompactMode: boolean;
  announcedMessage?: string;
  showViewSelector: boolean;
  showRibbonBar: boolean;
  padding: number;
  views: IDropdownOption[];
  selectedView: string;
  loaded: boolean;
  commands: ICommandBarItemProps[];
};

export type ModelDrivenListProps = {
  listComponent?: React.ComponentType<
    IDetailsListProps & {
      formData: Record<string, unknown>;
      onChange?: (related: Record<string, unknown>) => void;
    }
  >;
  onChange?: (data: Record<string, unknown>) => void;
  formData?: Record<string, unknown>;
  onRenderDetailsFooter?: IRenderFunction<IDetailsFooterProps>;
  onRenderItemColumn: (item?: IRecord, index?: number, column?: IColumn) => React.ReactNode;
  className?: string;
  selectionMode: SelectionMode;
  setKey: string;
  items: IRecord[];
  onItemInvoked: (item: IRecord) => void;
};

const RibbonStyles: IStackStyles = {
  root: {
    overflow: 'hidden',
    width: `100%`,
    borderBottom: 'solid 0.5px white',
  },
};
const leftribbon: ICommandBarStyles = {
  root: {
    padding: 0,
    margin: 0,
  },
};

export interface IScrollablePaneDetailsListExampleItem {
  key: number | string;
  name: string;
  test2: string;
  test3: string;
  test4: string;
  test5: string;
  test6: string;
}

const footerItem: IScrollablePaneDetailsListExampleItem = {
  key: 'footer',
  name: 'Footer 1',
  test2: 'Footer 2',
  test3: 'Footer 3',
  test4: 'Footer 4',
  test5: 'Footer 5',
  test6: 'Footer 6',
};

const onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (props, defaultRender) => {
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

const classNames = mergeStyleSets({
  wrapper: {
    height: '80vh',
    position: 'relative',
    backgroundColor: 'white',
  },
  filter: {
    backgroundColor: 'white',
    paddingBottom: 20,
    maxWidth: 300,
  },
  header: {
    margin: 0,
    backgroundColor: 'white',
  },
  row: {
    display: 'inline-block',
  },
  cell: {
    alignSelf: 'center',
  },
});

const RenderDetailsFooter: IRenderFunction<IDetailsFooterProps> = (props, defaultRender) => {
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
    <Sticky
      stickyPosition={StickyPositionType.Footer}
      isScrollSynced={true}
      stickyClassName="Footer"
    >
      <Stack grow horizontal horizontalAlign="space-between">
        <Stack.Item grow className="Footer">
          <Stack grow horizontal horizontalAlign="space-between">
            <Stack.Item grow={1} align="center">
              {firstItemNumber} - {lastItemNumber} of {totalRecords} ({selectedCount} selected)
            </Stack.Item>
            <Stack.Item align="center" className="FooterRight">
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
              <span>Page {currentPage + 1}</span>
              <IconButton
                className="FooterIcon"
                iconProps={{ iconName: 'ChevronRight' }}
                onClick={moveNext}
              />
            </Stack.Item>
          </Stack>
        </Stack.Item>
      </Stack>
    </Sticky>
  );
};

function _getKey(item: IRecord, index?: number): string {
  return item.key as string;
}

const getCellText = (item: IRecord, column: IColumn): string => {
  let value = item && column && column.fieldName ? item[column.fieldName] : '';

  if (value === null || value === undefined) {
    value = '';
  }

  if (typeof value === 'boolean') {
    return value.toString();
  }

  return String(value);
};

export function ModelDrivenList({
  onChange,
  formData,
  listComponent,
  onRenderDetailsFooter,
  onItemInvoked,
  onRenderItemColumn,
  className,
  selectionMode,
  setKey,
  items,
}: ModelDrivenListProps) {
  const [isCompactMode, setisCompactMode] = useState(false);

  const { setSelection, selection, selectionDetails } = useSelectionContext();
  const [{ columns }] = useColumnFilter();

  const theme = useTheme();

  const _onRenderRow = useCallback<Required<IDetailsListProps>['onRenderRow']>(
    (props) => {
      const customStyles: Partial<IDetailsRowStyles> = {};

      if (props) {
        if (props.itemIndex % 2 === 0) {
          // Every other row renders with a different background color
          customStyles.root = { backgroundColor: theme.palette.neutralLighterAlt };
        }
        return <DetailsRow {...props} styles={customStyles} />;
      }
      return null;
    },
    [theme.palette.neutralLighterAlt],
  );

  const localColumns = useMemo(
    () => columns?.filter((c) => c.data.visible !== false) ?? [],
    [columns],
  );

  if (!localColumns?.length) return <div>loading data</div>;

  const ListComponent = listComponent ?? DetailsList;

  return (
    <ListComponent
      className={className}
      styles={{ headerWrapper: { paddingTop: 0 }, focusZone: { paddingTop: 0 } }}
      constrainMode={ConstrainMode.unconstrained}
      items={items}
      compact={isCompactMode}
      columns={localColumns}
      selectionMode={selectionMode}
      getKey={_getKey}
      setKey={setKey}
      layoutMode={DetailsListLayoutMode.justified}
      isHeaderVisible={true}
      selection={selection as unknown as ISelection<IObjectWithKey>}
      selectionPreservedOnEmptyClick={true}
      enterModalSelectionOnTouch={true}
      ariaLabelForSelectionColumn="Toggle selection"
      ariaLabelForSelectAllCheckbox="Toggle selection for all items"
      checkButtonAriaLabel="select row"
      onItemInvoked={onItemInvoked}
      onRenderRow={_onRenderRow}
      onRenderDetailsHeader={onRenderDetailsHeader}
      onChange={onChange}
      formData={formData!}
      onRenderItemColumn={onRenderItemColumn}
      onRenderDetailsFooter={onRenderDetailsFooter}
    />
  );
}

/** @deprecated Use named import: `import { ModelDrivenList } from '...'` instead of default import */
export default ModelDrivenList;
