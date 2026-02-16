import {
  AttributeDefinition,
  getNavigationProperty,
  isAttributeLookup,
  isLookup,
  isPolyLookup,
  LookupAttributeDefinition,
  LookupType,
  NestedType,
  PolyLookupType,
  ViewDefinition,
} from '@eavfw/manifest';
import {
  IColumn,
  IDetailsColumnProps,
  IRenderFunction,
  mergeStyleSets,
  Target,
} from '@fluentui/react';
import { useUserProfile } from '../Profile/useUserProfile';
import { IFetchQuery } from '../Views';
import { filterRoles } from '../../filterRoles';
import React, { FC, Reducer, useEffect } from 'react';
import { IColumnData } from './IColumnData';
import cloneDeep from 'clone-deep';
import { ColumnOrder } from './ColumnOrder';
import { ModelDrivenApp } from '../../ModelDrivenApp';
import { UserProfile } from '../Profile';
import { useAppInfo } from '../../useAppInfo';
import {
  IColumnFilterContext,
  ColumnFilterDispatch,
  columnFilterReducer,
  isAttributeLookupEntry,
} from './columnFilterReducer';

interface IColumnFilterProps {
  children: React.ReactNode;
  view?: ViewDefinition;
  attributes: {
    [key: string]: AttributeDefinition;
  };
  locale: string;
  onHeaderRender?: IRenderFunction<IDetailsColumnProps>;
  onBuildFetchQuery: <T>(q: T) => T;
  setFetchQuery: (q: IFetchQuery) => void;
  currentPage: number;
  pageSize: number;
  filter?: string;
  pagingContextEnabled: boolean;
  app: ModelDrivenApp;
  currentEntityName: string;
}

const ColumnFilterContext = React.createContext<
  [columnFilterState: IColumnFilterContext, columnFilterDispatch: ColumnFilterDispatch] | undefined
>(undefined);

const ColumnFilterProvider = ({
  children,
  view,
  attributes,
  locale,
  onHeaderRender,
  setFetchQuery,
  currentPage,
  pageSize,
  filter,
  pagingContextEnabled,
  onBuildFetchQuery,
  app,
  currentEntityName,
}: IColumnFilterProps) => {
  const user = useUserProfile();
  const [columnFilterState, columnFilterDispatch] = React.useReducer(columnFilterReducer, {
    isCalloutVisible: false,
    columns: [],
    user,
  });

  const columnAttributes = React.useMemo(() => {
    function mapselect(attr: AttributeDefinition) {
      if (isLookup(attr.type) && attr.type.split) {
        return attr.type.referenceTypes
          ?.map(
            (referenceType) =>
              `${currentEntityName}${app.getEntityFromKey(referenceType).logicalName}references`,
          )
          .join(',');
      }
      return attr.logicalName;
    }

    const columns = Object.keys(view?.columns ?? {})
      .filter((c) => attributes[c] && !attributes[c].isPrimaryKey)
      .map((c) => mapselect(attributes[c]));

    if (columns.length === 0) return [];

    const keys = Object.values(attributes)
      .filter((a) => a.isPrimaryKey || a.isRowVersion)
      .map((c) => c.logicalName);

    return columns.concat(keys);
  }, [view, attributes]);

  React.useEffect(() => {
    const { columns } = columnFilterState;
    if (columns?.length <= 0) return;

    function expandPolyLookup(key: string, attr: AttributeDefinition) {
      let type = attr.type;

      if (isPolyLookup(type)) {
        let expands = (type.inline ? type.referenceTypes : [type.referenceType]).map(
          (referenceType) =>
            Object.values(app.getAttributes(app.getEntityFromKey(referenceType).logicalName))
              .filter(isAttributeLookup)
              .map(
                (a) =>
                  `${getNavigationProperty(a)}($select=${Object.values(app.getAttributes(app.getEntityFromKey(a.type.referenceType).logicalName)).filter((c) => c.isPrimaryField)[0].logicalName})`,
              ),
        );

        return `$expand=${expands.join(',')};`;
      } else if (isAttributeLookup(attr)) {
        let a = [
          ...new Set(
            columns
              .filter((f) => f.key.split('/')[0] === key && f.key !== key)
              .map((c) => c.key.split('/')[1]),
          ),
        ]
          .map((nav) => {
            let columnNavigation = app.getEntityFromKey(attr.type.referenceType).attributes[nav];
            if (isAttributeLookup(columnNavigation)) {
              return columnNavigation.schemaName.slice(0, -2);
            }

            return;
          })
          .filter((x) => x);

        if (a.length) {
          return `$expand=${a.join(',')};`;
        }
      }

      //return [];
      return '';
    }

    function selectPolyLookup(key: string, attr: AttributeDefinition) {
      let type = attr.type;
      if (isPolyLookup(type)) {
        //if (type.split) {
        //    return '';
        //}

        let selects = Object.values(
          app.getAttributes(app.getEntityFromKey(type.referenceType).logicalName),
        )
          .filter(isAttributeLookup)
          .map((a) => a.logicalName);
        return ',' + selects.join(',');
      } else if (isLookup(type) && key.indexOf('/') !== -1) {
        let nextAttributeLogicalName = key.split('/')[1].toLowerCase().replace(/\W+/g, '');

        return ',' + nextAttributeLogicalName;
      }

      if (key.indexOf('/') !== -1) {
      }

      return '';
    }

    function getPrimaryField(referenceType: string) {
      return Object.values(
        app.getAttributes(app.getEntityFromKey(referenceType).logicalName),
      ).filter((c) => c.isPrimaryField)[0].logicalName;
    }

    function createExpandForLookups([key, a]: [string, LookupAttributeDefinition]) {
      if (a.type.split)
        return a.type.referenceTypes?.map(
          (referenceType) =>
            `${currentEntityName}${app.getEntityFromKey(referenceType).logicalName}references`,
        );

      if (a.type.inline)
        return `${a.type.referenceTypes?.map((referenceType) => `${app.getEntityFromKey(referenceType).logicalName}($select=${getPrimaryField(referenceType)})`).join(',')}`;

      return `${getNavigationProperty(a)}(${expandPolyLookup(key, a)}$select=${getPrimaryField(a.type.referenceType)}${selectPolyLookup(key, a)})`;
    }

    let expand = columns
      .map((x) => [x.key, x.data] as [string, AttributeDefinition])
      .filter(isAttributeLookupEntry)
      .map(createExpandForLookups);

    let orderBy = columns.filter((c) => c.isSorted)[0];

    let localFilters = columns
      .filter((c) => (c.data['columnFilter'] as IColumnData)?.odataFilter !== undefined)
      .map((c) => {
        let cData = c.data['columnFilter'] as IColumnData;
        return cData.odataFilter;
      });
    let manifestFilter = view?.filter;
    if (manifestFilter) {
      localFilters.push(manifestFilter);
    }

    let localColumnFilter = localFilters.join(' and ');

    let localFilter;
    if (filter && localColumnFilter) {
      localFilter = `${filter} and ${localColumnFilter}`;
    } else if (localColumnFilter) {
      localFilter = `$filter=${localColumnFilter}`;
    } else if (filter) {
      localFilter = filter;
    }

    if (localFilter?.startsWith('$filter=')) localFilter = localFilter?.substr('$filter='.length);

    let query: IFetchQuery = {
      $expand: expand.join(','),
      $filter: localFilter,
      $select: columnAttributes.join(','),
      $count: true,
      $top: pageSize,
      $skip: currentPage * pageSize,
    };

    if (!pagingContextEnabled) {
      delete query['$skip'];
      delete query['$top'];
    }

    if (orderBy) {
      query['$orderby'] = orderBy.fieldName + ' ' + (orderBy.isSortedDescending ? 'desc' : 'asc');
    }

    setFetchQuery(onBuildFetchQuery(query));
  }, [attributes, columnFilterState.columns, filter, currentPage, pageSize, columnAttributes]);

  useEffect(() => {
    columnFilterDispatch({
      type: 'initializeColumns',
      view: view ?? {
        columns: { ...Object.fromEntries(Object.keys(attributes).map((column) => [column, {}])) },
      },
      app: app,
      attributes: attributes,
      locale: locale,
      onHeaderRender: onHeaderRender,
      dispatch: columnFilterDispatch,
    });
  }, [view, attributes, locale]);

  return (
    <ColumnFilterContext.Provider value={[columnFilterState, columnFilterDispatch]}>
      {children}
    </ColumnFilterContext.Provider>
  );
};

const useColumnFilter = () => {
  const context = React.useContext(ColumnFilterContext);
  if (context === undefined) {
    throw new Error('useColumnFilter must be used within a ColumnFilterProvider');
  }
  return context;
};

export { isAttributeLookupEntry } from './columnFilterReducer';
export { ColumnFilterProvider, useColumnFilter };
