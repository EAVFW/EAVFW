import {
  IColumn,
  IStackStyles,
  ICommandBarStyles,
  ICommandBarItemProps,
  IDropdownOption,
  IObjectWithKey,
  Selection,
  mergeStyleSets,
} from '@fluentui/react';

import { AttributeDefinition, IRecord, LookupType } from '@eavfw/manifest';

/**
 * State shape for the ModelDrivenGridViewer component.
 */
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

/**
 * Props for the ModelDrivenGridViewer component.
 */
export type ModelDrivenGridViewerProps = {
  allowNoPaging?: boolean;
  defaultValues?: Array<Record<string, unknown>>;
  viewName?: string;
  filter?: string;
  newRecord?: boolean;
  entityName?: string;
  entity: import('@eavfw/manifest').EntityDefinition;
  locale: string;
  showViewSelector?: boolean;
  showRibbonBar?: boolean;
  padding?: number;
  rightCommands?: ICommandBarItemProps[];
  commands?: (ctx: {
    selection: Selection<Partial<IRecord> & IObjectWithKey>;
  }) => ICommandBarItemProps[];
  recordRouteGenerator: (record: IRecord) => string;
  listComponent?: React.ComponentType<
    import('@fluentui/react').IDetailsListProps & {
      formData: Record<string, unknown>;
      onChange?: (related: Record<string, unknown>) => void;
    }
  >;
  onChange?: (data: Record<string, unknown>) => void;
  formData?: Record<string, unknown>;
  onHeaderRender?: import('@fluentui/react').IRenderFunction<
    import('@fluentui/react').IDetailsColumnProps
  >;
  onBuildFetchQuery?: <T>(q: T) => T;
  onQueueData?: typeof import('./gridViewerUtils').DefaultDataQuery;
  onQueryDataCount?: typeof import('./gridViewerUtils').DefaultDataCountQuery;
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

/**
 * Props for the default primary field renderer.
 */
export type DefaultPrimaryFieldRenderProps = {
  recordRouteGenerator: (record: IRecord) => string;
  item: IRecord;
  column: IColumn;
};

/**
 * Context props for the ModelDrivenGridViewer context.
 */
export type ModelDrivenGridViewerContextProps = {
  onRenderPrimaryField: React.FC<DefaultPrimaryFieldRenderProps>;
};

/**
 * Props for the LookupControlRender component.
 */
export type LookupControlRenderProps = {
  recordRouteGenerator: (record: IRecord) => string;
  item: IRecord;
  attribute: AttributeDefinition;
  type: LookupType;
  onChange?: (data: IRecord) => void;
};

export const RibbonStyles: IStackStyles = {
  root: {
    overflow: 'hidden',
    width: `100%`,
    borderBottom: 'solid 0.5px white',
  },
};

export const leftribbon: ICommandBarStyles = {
  root: {
    padding: 0,
    margin: 0,
  },
};

export const classNames = mergeStyleSets({
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

export const footerItem: IScrollablePaneDetailsListExampleItem = {
  key: 'footer',
  name: 'Footer 1',
  test2: 'Footer 2',
  test3: 'Footer 3',
  test4: 'Footer 4',
  test5: 'Footer 5',
  test6: 'Footer 6',
};
